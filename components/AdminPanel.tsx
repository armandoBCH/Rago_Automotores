

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Vehicle, AnalyticsEvent } from '../types';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon, LogoutIcon, EyeIcon, ChatBubbleIcon as WhatsAppIcon } from '../constants';
import { optimizeUrl } from '../utils/image';
import { supabase } from '../lib/supabaseClient';

interface AdminPanelProps {
    vehicles: Vehicle[];
    onAdd: () => void;
    onEdit: (vehicle: Vehicle) => void;
    onDelete: (vehicleId: number) => void;
    onLogout: () => void;
}

const StatCard: React.FC<{ title: string, value: string | number, icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-xl flex items-center gap-5">
        <div className="bg-rago-burgundy/10 text-rago-burgundy dark:bg-rago-burgundy/20 dark:text-rago-burgundy p-3 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-base text-slate-500 dark:text-slate-400">{title}</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
    </div>
);

const AnalyticsDashboard: React.FC<{ vehicles: Vehicle[] }> = ({ vehicles }) => {
    const [events, setEvents] = useState<AnalyticsEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [dbError, setDbError] = useState<string | null>(null);

    const fetchAnalytics = useCallback(async () => {
        setLoading(true);
        setDbError(null);
        const { data, error } = await supabase.from('analytics_events').select('*').order('created_at', { ascending: false });
        
        if (error) {
            console.error("Error fetching analytics:", error);
            if (error.message.includes('violates row-level security policy')) {
                setDbError("Error de permisos: No se pueden leer las estadísticas. Asegúrate de haber aplicado la política de lectura (SELECT) en la tabla 'analytics_events' de Supabase.");
            } else {
                setDbError("No se pudieron cargar las estadísticas. Intenta de nuevo.");
            }
        } else {
            setEvents(data);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);
    
    const analyticsSummary = useMemo(() => {
        const viewCounts: { [key: number]: number } = {};
        const contactCounts: { [key: number]: number } = {};
        let totalViews = 0;
        let totalContacts = 0;

        const contactEventTypes = [
            'click_whatsapp',
            'click_whatsapp_general',
            'click_whatsapp_footer',
            'click_phone_footer',
            'click_whatsapp_sell'
        ];

        events.forEach(event => {
            if (event.event_type === 'view_vehicle' && event.vehicle_id) {
                totalViews++;
                viewCounts[event.vehicle_id] = (viewCounts[event.vehicle_id] || 0) + 1;
            } else if (contactEventTypes.includes(event.event_type)) {
                totalContacts++;
                // Only count per-vehicle contacts for the ranking
                if (event.event_type === 'click_whatsapp' && event.vehicle_id) {
                    contactCounts[event.vehicle_id] = (contactCounts[event.vehicle_id] || 0) + 1;
                }
            }
        });

        const getVehicleDetails = (id: number) => vehicles.find(v => v.id === id);

        const mostViewed = Object.entries(viewCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([id, count]) => ({ vehicle: getVehicleDetails(Number(id)), count }))
            .filter(item => item.vehicle)
            .slice(0, 5);

        const mostContacted = Object.entries(contactCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([id, count]) => ({ vehicle: getVehicleDetails(Number(id)), count }))
            .filter(item => item.vehicle)
            .slice(0, 5);

        return { totalViews, totalContacts, mostViewed, mostContacted };
    }, [events, vehicles]);

    if (loading) return <div className="text-center p-10">Cargando estadísticas...</div>;

    if (dbError) return (
        <div className="bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-r-lg" role="alert">
            <p className="font-bold">Error al Cargar Estadísticas</p>
            <p>{dbError}</p>
             <button
                onClick={fetchAnalytics}
                className="mt-3 px-3 py-1 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700"
            >
                Reintentar
            </button>
        </div>
    );
    
    const RankingList: React.FC<{ title: string, data: { vehicle: Vehicle | undefined, count: number }[], icon: React.ReactNode }> = ({ title, data, icon }) => (
         <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">{title}</h3>
            {data.length > 0 ? (
                <ul className="space-y-4">
                    {data.map(({ vehicle, count }) => vehicle && (
                        <li key={vehicle.id} className="flex items-center gap-4">
                            <img src={optimizeUrl(vehicle.images[0], {w: 64, h: 48, fit: 'cover'})} alt={vehicle.model} className="w-16 h-12 object-cover rounded-md flex-shrink-0 bg-slate-200 dark:bg-slate-700" />
                            <div className="flex-grow min-w-0">
                                <p className="font-semibold text-slate-700 dark:text-slate-200 truncate">{vehicle.make} {vehicle.model}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{vehicle.year}</p>
                            </div>
                            <div className="flex items-center gap-2 font-bold text-lg text-slate-600 dark:text-slate-300 flex-shrink-0">
                                {icon}
                                <span>{count}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : <p className="text-slate-500 dark:text-slate-400">No hay datos suficientes.</p>}
        </div>
    );
    

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard title="Vistas Totales de Vehículos" value={analyticsSummary.totalViews} icon={<EyeIcon className="h-7 w-7"/>} />
                <StatCard title="Interacciones de Contacto Totales" value={analyticsSummary.totalContacts} icon={<WhatsAppIcon className="h-7 w-7"/>} />
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <RankingList title="Vehículos Más Vistos" data={analyticsSummary.mostViewed} icon={<EyeIcon className="h-5 w-5" />} />
                <RankingList title="Vehículos Más Contactados" data={analyticsSummary.mostContacted} icon={<WhatsAppIcon className="h-5 w-5" />} />
            </div>
        </div>
    );
};


const AdminPanel: React.FC<AdminPanelProps> = ({ vehicles, onAdd, onEdit, onDelete, onLogout }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'inventory' | 'analytics'>('inventory');

    const filteredVehicles = useMemo(() => {
        const lowercasedTerm = searchTerm.toLowerCase().trim();
        if (!lowercasedTerm) {
            return vehicles;
        }
        return vehicles.filter(v =>
            v.make.toLowerCase().includes(lowercasedTerm) ||
            v.model.toLowerCase().includes(lowercasedTerm) ||
            String(v.year).includes(lowercasedTerm)
        );
    }, [vehicles, searchTerm]);
    
    const TabButton: React.FC<{ tabId: 'inventory' | 'analytics', children: React.ReactNode }> = ({ tabId, children }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`px-4 py-2 font-semibold text-lg rounded-t-lg transition-colors duration-200 ${
                activeTab === tabId
                    ? 'bg-white dark:bg-slate-900 text-rago-burgundy'
                    : 'bg-transparent text-slate-500 dark:text-slate-400 hover:text-rago-burgundy'
            }`}
        >
            {children}
        </button>
    );


    return (
        <div className="transition-colors duration-300">
             <div className="flex justify-between items-end mb-4 sm:mb-0">
                <div className="border-b border-slate-300 dark:border-slate-700">
                    <TabButton tabId="inventory">Inventario</TabButton>
                    <TabButton tabId="analytics">Estadísticas</TabButton>
                </div>
                 <button
                    onClick={onLogout}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 text-base font-medium text-rago-burgundy dark:text-gray-300 bg-rago-burgundy/10 rounded-lg hover:bg-rago-burgundy/20 dark:bg-gray-800 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rago-burgundy transition-colors flex-shrink-0"
                    aria-label="Cerrar sesión"
                >
                    <LogoutIcon className="h-5 w-5" />
                    <span className="hidden sm:inline">Cerrar Sesión</span>
                </button>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-lg rounded-tl-none shadow-lg">
                {activeTab === 'inventory' && (
                    <>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                            <h2 className="text-3xl font-bold text-gray-800 dark:text-white flex-shrink-0">Gestión de Inventario</h2>
                            <div className="w-full sm:w-auto flex items-stretch gap-3">
                                <div className="flex-grow sm:w-64">
                                    <div className="bg-slate-200 dark:bg-gray-800/60 p-1 rounded-xl shadow-inner relative">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <SearchIcon className="h-5 w-5 text-gray-400" />
                                        </span>
                                        <input
                                            type="text"
                                            placeholder="Buscar por marca, modelo..."
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 text-base bg-white dark:bg-gray-900 border-transparent text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-rago-burgundy rounded-lg transition"
                                            aria-label="Buscar vehículo"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={onAdd}
                                    className="flex items-center justify-center gap-2 px-5 py-2.5 text-base font-medium text-white bg-rago-burgundy rounded-lg hover:bg-rago-burgundy-darker focus:outline-none focus:ring-4 focus:ring-rago-burgundy/50 transition-colors flex-shrink-0"
                                >
                                    <PlusIcon className="h-5 w-5" />
                                    Añadir
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-base text-left text-gray-500 dark:text-gray-400">
                                <thead className="text-sm text-white uppercase bg-rago-burgundy dark:bg-gray-800 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Imagen</th>
                                        <th scope="col" className="px-6 py-3">Vehículo</th>
                                        <th scope="col" className="px-6 py-3">Año</th>
                                        <th scope="col" className="px-6 py-3">Precio</th>
                                        <th scope="col" className="px-6 py-3">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredVehicles.map(vehicle => (
                                        <tr key={vehicle.id} className="bg-white border-b dark:bg-gray-900 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <td className="px-6 py-4">
                                                <img 
                                                    src={optimizeUrl(vehicle.images?.[0], { w: 80, h: 64, fit: 'cover', output: 'webp', q: 70 })}
                                                    alt={`${vehicle.make} ${vehicle.model}`} 
                                                    className="w-20 h-16 object-cover rounded bg-gray-200 dark:bg-gray-700" 
                                                    loading="lazy"
                                                    decoding="async"
                                                />
                                            </td>
                                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white text-base">
                                                {vehicle.make} {vehicle.model}
                                            </th>
                                            <td className="px-6 py-4 text-base">{vehicle.year}</td>
                                            <td className="px-6 py-4 text-base">${vehicle.price.toLocaleString()}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <button onClick={() => onEdit(vehicle)} className="text-gray-500 hover:text-rago-burgundy dark:text-gray-400 dark:hover:text-white transition-colors">
                                                        <EditIcon className="h-6 w-6" />
                                                    </button>
                                                    <button onClick={() => onDelete(vehicle.id)} className="text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400 transition-colors">
                                                        <TrashIcon className="h-6 w-6" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filteredVehicles.length === 0 && (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                {vehicles.length === 0
                                    ? "No hay vehículos en el inventario."
                                    : `No se encontraron vehículos para "${searchTerm}".`
                                }
                            </div>
                        )}
                    </>
                )}
                {activeTab === 'analytics' && <AnalyticsDashboard vehicles={vehicles} />}
            </div>
        </div>
    );
};

export default AdminPanel;