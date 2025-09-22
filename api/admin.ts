import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../lib/database.types';

type VehicleInsert = Database['public']['Tables']['vehicles']['Insert'];
type ReviewUpdate = Database['public']['Tables']['reviews']['Update'];
type SiteConfigValue = Database['public']['Tables']['site_config']['Row']['value'];
type ConsignmentUpdate = Database['public']['Tables']['consignments']['Update'];


export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!supabaseUrl || !supabaseServiceKey || !adminPassword) {
            return res.status(500).json({ message: 'La configuración del servidor está incompleta.' });
        }
        
        const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey);

        if (req.method === 'GET') {
            const { data, error } = await supabaseAdmin.from('analytics_events').select('*');
            if (error) throw error;
            return res.status(200).json(data || []);
        }

        if (req.method === 'POST') {
            const { action, payload } = req.body;

            switch (action) {
                case 'saveVehicle': {
                    const vehicleData = payload as VehicleInsert;
                    const { consignment_id, ...restOfVehicleData } = vehicleData;
                    let result;
                    
                    if (restOfVehicleData.id) {
                        const { id, ...dataToUpdate } = restOfVehicleData;
                        const { data, error } = await supabaseAdmin.from('vehicles').update(dataToUpdate).eq('id', id).select().single();
                        if (error) throw error;
                        result = data;
                    } else {
                        const dataToInsert = { ...restOfVehicleData, consignment_id };
                        delete (dataToInsert as Partial<VehicleInsert>).id;

                        const { data: allOrders } = await supabaseAdmin.from('vehicles').select('display_order');
                        const maxOrder = (allOrders || []).reduce((max, v) => (v && typeof v.display_order === 'number' && v.display_order > max) ? v.display_order : max, -1);
                        
                        dataToInsert.display_order = maxOrder + 1;
                        if (!dataToInsert.vehicle_type) dataToInsert.vehicle_type = 'N/A';

                        const { data, error } = await supabaseAdmin.from('vehicles').insert(dataToInsert).select().single();
                        if (error) throw error;
                        result = data;

                        if (consignment_id && result) {
                             await supabaseAdmin.from('consignments').update({ status: 'published', vehicle_id: result.id }).eq('id', consignment_id);
                        }
                    }
                    return res.status(200).json({ success: true, vehicle: result });
                }

                case 'deleteVehicle': {
                    const { vehicleId } = payload;
                    if (!vehicleId) return res.status(400).json({ message: 'vehicleId es requerido.' });
                    
                    await supabaseAdmin.from('analytics_events').delete().eq('vehicle_id', vehicleId);
                    await supabaseAdmin.from('reviews').delete().eq('vehicle_id', vehicleId);

                    const { data: vehicle, error: fetchError } = await supabaseAdmin.from('vehicles').select('images').eq('id', vehicleId).single();
                    if (fetchError && fetchError.code !== 'PGRST116') {
                        return res.status(404).json({ message: `Vehículo con id ${vehicleId} no encontrado.` });
                    }

                    if (vehicle && vehicle.images && vehicle.images.length > 0) {
                        const filePaths = vehicle.images.map((url: string) => { try { const pathParts = new URL(url).pathname.split('/vehicle-images/'); return pathParts.length > 1 ? decodeURIComponent(pathParts[1]) : null; } catch (e) { return null; } }).filter((p): p is string => p !== null);
                        if (filePaths.length > 0) await supabaseAdmin.storage.from('vehicle-images').remove(filePaths);
                    }

                    const { error: deleteError } = await supabaseAdmin.from('vehicles').delete().eq('id', vehicleId);
                    if (deleteError) throw deleteError;

                    await supabaseAdmin.from('consignments').update({ status: 'approved', vehicle_id: null }).eq('vehicle_id', vehicleId);
                    
                    return res.status(200).json({ success: true, message: 'Vehículo y datos asociados eliminados.' });
                }
                
                case 'get_all_reviews': {
                    const { data, error } = await supabaseAdmin.from('reviews').select('*').order('created_at', { ascending: false });
                    if (error) throw error;
                    return res.status(200).json(data || []);
                }
                case 'update_review': {
                    const { id, ...dataToUpdate } = payload as ReviewUpdate;
                    if (!id) return res.status(400).json({ message: 'ID de reseña requerido.'});
                    const { data, error } = await supabaseAdmin.from('reviews').update(dataToUpdate).eq('id', id).select().single();
                    if (error) throw error;
                    return res.status(200).json({ success: true, review: data });
                }
                case 'delete_review': {
                    const { id } = payload;
                    if (!id) return res.status(400).json({ message: 'ID de reseña requerido.' });
                    const { error } = await supabaseAdmin.from('reviews').delete().eq('id', id);
                    if (error) throw error;
                    return res.status(200).json({ success: true, message: 'Reseña eliminada.'});
                }

                case 'update_site_config': {
                    const { key, value } = payload as { key: string, value: SiteConfigValue };
                    const { error } = await supabaseAdmin.from('site_config').upsert({ key, value });
                    if (error) throw error;
                    return res.status(200).json({ success: true, message: 'Configuración guardada.' });
                }

                case 'get_consignments': {
                     const { data, error } = await supabaseAdmin.from('consignments').select('*').order('created_at', { ascending: false });
                    if (error) throw error;
                    return res.status(200).json(data || []);
                }
                
                case 'get_consignment_details': {
                    const { id } = payload;
                    if (!id) return res.status(400).json({ message: 'ID de consignación requerido.'});
                    const { data, error } = await supabaseAdmin.from('consignment_history').select('*').eq('consignment_id', id).order('created_at', { ascending: false });
                    if (error) throw error;
                    return res.status(200).json(data || []);
                }

                case 'update_consignment': {
                    const { id, ...dataToUpdate } = payload as ConsignmentUpdate & { id: number };
                    if (!id) return res.status(400).json({ message: 'ID de consignación requerido.'});

                    if (dataToUpdate.status) {
                        const { data: currentConsignment, error: fetchError } = await supabaseAdmin.from('consignments').select('status').eq('id', id).single();
                        if (fetchError) throw fetchError;
                        
                        if (currentConsignment.status !== dataToUpdate.status) {
                            await supabaseAdmin.from('consignment_history').insert({
                                consignment_id: id,
                                old_status: currentConsignment.status,
                                new_status: dataToUpdate.status
                            });
                        }
                    }

                    const { data, error } = await supabaseAdmin.from('consignments').update(dataToUpdate).eq('id', id).select().single();
                    if (error) throw error;
                    return res.status(200).json({ success: true, consignment: data });
                }
                
                case 'delete_consignment': {
                    const { id } = payload;
                    if (!id) return res.status(400).json({ message: 'ID de consignación es requerido.' });

                    const { data: consignment, error: fetchErr } = await supabaseAdmin.from('consignments').select('images').eq('id', id).single();
                    if (fetchErr) return res.status(404).json({ message: 'Consignación no encontrada.' });

                    if (consignment.images && consignment.images.length > 0) {
                        const filePaths = consignment.images.map(url => { try { return new URL(url).pathname.split('/vehicle-images/')[1]; } catch { return null; }}).filter(Boolean) as string[];
                        if(filePaths.length > 0) await supabaseAdmin.storage.from('vehicle-images').remove(filePaths);
                    }
                    
                    await supabaseAdmin.from('consignment_history').delete().eq('consignment_id', id);
                    const { error: deleteErr } = await supabaseAdmin.from('consignments').delete().eq('id', id);
                    if (deleteErr) throw deleteErr;

                    return res.status(200).json({ success: true, message: 'Consignación eliminada.'});
                }


                case 'reorderVehicles': {
                    const { vehicles } = payload;
                    if (!Array.isArray(vehicles)) return res.status(400).json({ message: 'El payload debe ser un array de vehículos.' });
                    const { error } = await supabaseAdmin.rpc('reorder_vehicles', { updates: vehicles });
                    if (error) throw error;
                    return res.status(200).json({ success: true });
                }

                case 'resetAnalytics': {
                    const { password } = payload;
                    if (password?.trim() !== adminPassword.trim()) return res.status(401).json({ message: 'Contraseña incorrecta.' });
                    const { error } = await supabaseAdmin.from('analytics_events').delete().gt('id', -1);
                    if (error) throw error;
                    return res.status(200).json({ success: true, message: 'Estadísticas reiniciadas.' });
                }
                
                case 'createSignedUploadUrl': {
                    const { fileName, fileType } = payload;
                    if (!fileName || !fileType) return res.status(400).json({ message: 'fileName y fileType son requeridos.' });
                    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '');
                    const path = `public/${Date.now()}-${sanitizedFileName}`;
                    const { data, error } = await supabaseAdmin.storage.from('vehicle-images').createSignedUploadUrl(path);
                    if (error) throw error;
                    const token = new URL(data.signedUrl).searchParams.get('token');
                    if (!token) throw new Error('No se pudo procesar el token de la URL firmada.');
                    return res.status(200).json({ token, path: data.path });
                }

                default:
                    return res.status(400).json({ message: 'Acción inválida especificada.' });
            }
        }
        
        return res.status(405).json({ message: 'Método no permitido.' });
    } catch (error: any) {
        console.error(`Error en manejador de admin para acción "${req.body?.action}":`, error);
        return res.status(500).json({ message: 'Ocurrió un error en el servidor.', details: error.message });
    }
}