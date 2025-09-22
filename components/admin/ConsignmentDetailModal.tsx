import React, { useState, useEffect, useCallback } from 'react';
import { Consignment, ConsignmentUpdate } from '../../types';
import type { Database, Json } from '../../lib/database.types';
import { XIcon, WhatsAppIcon, HistoryIcon } from '../../constants';
import { optimizeUrl } from '../../utils/image';
import InspectionChecklist from './InspectionChecklist';

type ConsignmentHistory = Database['public']['Tables']['consignment_history']['Row'];

interface ConsignmentDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    consignment: Consignment;
    onApproveAndCreateListing: (consignment: Consignment) => void;
    onDataUpdate: () => void;
}

type Status = Consignment['status'];

const statusOptions: Status[] = ['pending', 'in_review', 'approved', 'published', 'sold', 'rejected'];
const STATUS_TEXT: Record<Status, string> = {
    pending: 'Pendiente', in_review: 'En Revisión', approved: 'Aprobado',
    published: 'Publicado', sold: 'Vendido', rejected: 'Rechazado'
};

const DetailItem: React.FC<{ label: string; value: string | number | null | undefined }> = ({ label, value }) => (
    <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-base font-semibold text-slate-800 dark:text-white">{value || '-'}</p>
    </div>
);

const ConsignmentDetailModal: React.FC<ConsignmentDetailModalProps> = ({ isOpen, onApproveAndCreateListing, onDataUpdate, ...props }) => {
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [consignment, setConsignment] = useState<Consignment>(props.consignment);
    const [history, setHistory] = useState<ConsignmentHistory[]>([]);
    const [activeTab, setActiveTab] = useState('details');

    useEffect(() => {
        if (isOpen) {
            setIsAnimatingOut(false);
            setConsignment(props.consignment);
            fetchHistory(props.consignment.id);
        }
    }, [isOpen, props.consignment]);
    
    const fetchHistory = async (id: number) => {
        try {
            const response = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'get_consignment_details', payload: { id } })
            });
            if (response.ok) {
                const data = await response.json();
                setHistory(data);
            }
        } catch (error) { console.error("Failed to fetch history", error); }
    };

    const handleClose = () => {
        setIsAnimatingOut(true);
        setTimeout(props.onClose, 300);
    };

    const handleUpdate = useCallback(async (updateData: ConsignmentUpdate, optimisticData?: Partial<Consignment>) => {
        setIsSaving(true);
        if (optimisticData) {
            setConsignment(prev => ({ ...prev, ...optimisticData }));
        }
        try {
            const response = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'update_consignment', payload: { id: consignment.id, ...updateData } })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to save update');
            
            setConsignment(result.consignment);
            if (updateData.status && updateData.status !== props.consignment.status) {
                fetchHistory(consignment.id);
            }
            onDataUpdate();

        } catch (error) {
            console.error(error);
            alert('Error al guardar los cambios.');
            setConsignment(props.consignment); // Revert optimistic update
        } finally {
            setIsSaving(false);
        }
    }, [consignment.id, onDataUpdate, props.consignment]);
    
    const handleStatusChange = (newStatus: Status) => {
        handleUpdate({ status: newStatus }, { status: newStatus });
    };

    const handleApprove = () => {
        handleUpdate({ status: 'approved' }).then(() => {
            onApproveAndCreateListing({ ...consignment, status: 'approved' });
            handleClose();
        });
    };
    
    const handleNumericFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setConsignment(prev => ({...prev, [name]: value === '' ? null : Number(value.replace(/\D/g, ''))}));
    };
    
    const handleSaveAppraisal = () => {
         handleUpdate({
            appraisal_value: consignment.appraisal_value,
            market_price_suggestion: consignment.market_price_suggestion,
            final_agreed_price: consignment.final_agreed_price
         });
    };

    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 bg-black flex justify-center items-center z-50 p-4 transition-opacity duration-300 ease-out ${!isAnimatingOut ? 'bg-opacity-60' : 'bg-opacity-0'}`} onClick={handleClose}>
            <div className={`bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col transform transition-all duration-300 ease-out ${!isAnimatingOut ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} onClick={e => e.stopPropagation()}>
                <header className="flex-shrink-0 flex justify-between items-center p-4 pl-6 border-b dark:border-slate-800">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{consignment.make} {consignment.model} <span className="text-slate-500 font-medium">({consignment.year})</span></h3>
                        <p className="text-sm text-slate-500">Recibido: {new Date(consignment.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"><XIcon className="h-6 w-6" /></button>
                </header>
                
                <div className="flex-grow flex overflow-hidden">
                    {/* Left Panel */}
                    <div className="w-1/3 flex-shrink-0 border-r dark:border-slate-800 overflow-y-auto p-6 space-y-6">
                        <div>
                             <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Estado</p>
                            <select value={consignment.status} onChange={(e) => handleStatusChange(e.target.value as Status)} className="form-input w-full">
                                {statusOptions.map(s => <option key={s} value={s}>{STATUS_TEXT[s]}</option>)}
                            </select>
                        </div>
                        <div>
                            <h4 className="font-bold mb-3 text-slate-800 dark:text-slate-200">Datos del Propietario</h4>
                             <div className="space-y-3">
                                <DetailItem label="Nombre" value={consignment.owner_name} />
                                <DetailItem label="Teléfono" value={consignment.owner_phone} />
                                <DetailItem label="Email" value={consignment.owner_email} />
                            </div>
                        </div>
                         <div>
                            <h4 className="font-bold mb-3 text-slate-800 dark:text-slate-200">Comunicación</h4>
                            <div className="space-y-2">
                                <a href={`https://wa.me/${consignment.owner_phone}?text=${encodeURIComponent(`¡Hola ${consignment.owner_name}! Te contacto de Rago Automotores por tu solicitud para el ${consignment.make} ${consignment.model}.`)}`} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-green-500 rounded-md hover:bg-green-600"><WhatsAppIcon className="h-4 w-4" /><span>Solicitud Recibida</span></a>
                                <a href={`https://wa.me/${consignment.owner_phone}?text=${encodeURIComponent(`¡Hola ${consignment.owner_name}! Queríamos coordinar la inspección de tu ${consignment.make} ${consignment.model}. ¿Qué día te quedaría cómodo?`)}`} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-slate-700 bg-slate-200 rounded-md hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"><WhatsAppIcon className="h-4 w-4" /><span>Agendar Inspección</span></a>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold mb-3 text-slate-800 dark:text-slate-200 flex items-center gap-2"><HistoryIcon className="h-5 w-5" />Historial de Cambios</h4>
                             <ul className="space-y-2 text-sm">
                                {history.map(h => (
                                    <li key={h.id} className="flex items-start gap-2">
                                        <div className="text-slate-400 mt-0.5">{new Date(h.created_at).toLocaleDateString('es-AR')}</div>
                                        <div className="text-slate-600 dark:text-slate-300">
                                            <span className="font-semibold">{STATUS_TEXT[h.old_status as Status] || 'Inicio'}</span> &rarr; <span className="font-semibold">{STATUS_TEXT[h.new_status as Status]}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    {/* Right Panel */}
                    <div className="flex-grow overflow-y-auto p-6">
                        <div className="border-b dark:border-slate-800 mb-4">
                            <nav className="flex gap-4 -mb-px">
                                <button onClick={() => setActiveTab('details')} className={`py-3 px-1 border-b-2 font-semibold ${activeTab === 'details' ? 'border-rago-burgundy text-rago-burgundy' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Detalles</button>
                                <button onClick={() => setActiveTab('checklist')} className={`py-3 px-1 border-b-2 font-semibold ${activeTab === 'checklist' ? 'border-rago-burgundy text-rago-burgundy' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Checklist</button>
                            </nav>
                        </div>
                        
                        {activeTab === 'details' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <DetailItem label="Marca" value={consignment.make} /><DetailItem label="Modelo" value={consignment.model} />
                                    <DetailItem label="Año" value={consignment.year} /><DetailItem label="Kilometraje" value={`${consignment.mileage.toLocaleString('es-AR')} km`} />
                                    <DetailItem label="Motor" value={consignment.engine} /><DetailItem label="Transmisión" value={consignment.transmission} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Info Extra</p>
                                    <p className="text-base text-slate-700 dark:text-slate-300 whitespace-pre-wrap p-3 bg-slate-50 dark:bg-slate-800/50 rounded-md">{consignment.extra_info || 'N/A'}</p>
                                </div>
                                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 space-y-4">
                                    <h4 className="font-bold text-slate-800 dark:text-slate-200">Tasación Interna</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div><label className="text-xs font-medium">Precio Solicitado (Cliente)</label><p className="text-xl font-bold text-rago-burgundy">${consignment.price_requested.toLocaleString('es-AR')}</p></div>
                                        <div><label htmlFor="appraisal_value" className="text-xs font-medium">Valor de Tasación</label><input type="text" id="appraisal_value" name="appraisal_value" value={consignment.appraisal_value || ''} onChange={handleNumericFieldChange} className="form-input mt-1 w-full" placeholder="ARS"/></div>
                                        <div><label htmlFor="market_price_suggestion" className="text-xs font-medium">Precio Mercado Sugerido</label><input type="text" id="market_price_suggestion" name="market_price_suggestion" value={consignment.market_price_suggestion || ''} onChange={handleNumericFieldChange} className="form-input mt-1 w-full" placeholder="ARS"/></div>
                                        <div className="md:col-span-3"><label htmlFor="final_agreed_price" className="text-xs font-medium">Precio Final Acordado</label><input type="text" id="final_agreed_price" name="final_agreed_price" value={consignment.final_agreed_price || ''} onChange={handleNumericFieldChange} className="form-input mt-1 w-full" placeholder="ARS"/></div>
                                    </div>
                                    <button onClick={handleSaveAppraisal} disabled={isSaving} className="px-3 py-1.5 text-sm font-semibold text-white bg-rago-burgundy rounded-md hover:bg-rago-burgundy-darker disabled:opacity-50">Guardar Tasación</button>
                                </div>
                                <div>
                                    <p className="font-medium text-slate-500 dark:text-slate-400 mb-2">Imágenes</p>
                                    <div className="flex flex-wrap gap-2">{consignment.images.map(img => <a href={img} target="_blank" rel="noopener noreferrer" key={img}><img src={optimizeUrl(img, {w: 120, h: 90, fit: 'cover'})} className="w-28 h-20 object-cover rounded-md" /></a>)}</div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'checklist' && <InspectionChecklist checklistData={consignment.inspection_checklist} onUpdate={(data) => handleUpdate({ inspection_checklist: data })} />}
                    </div>
                </div>

                <footer className="flex-shrink-0 p-4 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-800 flex justify-between items-center">
                    <div>{isSaving && <span className="text-sm text-slate-500">Guardando...</span>}</div>
                    <div className="flex gap-3">
                         {(consignment.status === 'in_review' || consignment.status === 'approved') && !consignment.vehicle_id && (
                            <button onClick={handleApprove} disabled={isSaving} className="px-4 py-2 text-base font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50">
                                {consignment.status === 'approved' ? 'Crear Publicación' : 'Aprobar y Crear'}
                            </button>
                        )}
                        {consignment.vehicle_id && <a href={`/vehiculo/id-${consignment.vehicle_id}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-base font-semibold text-rago-burgundy bg-rago-burgundy/10 rounded-lg hover:bg-rago-burgundy/20">Ver Publicación</a>}
                        <button onClick={handleClose} className="px-4 py-2 text-base font-medium text-slate-700 bg-slate-200 rounded-md hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-300 dark:hover:bg-slate-500">Cerrar</button>
                    </div>
                </footer>
            </div>
             <style>{`.form-input{display:block;width:100%;padding:0.5rem 0.75rem;background-color:#fff;border:1px solid #d1d5db;border-radius:0.375rem;transition:border-color .2s,box-shadow .2s;font-size:1rem;line-height:1.5rem}.dark .form-input{background-color:#1f2937;border-color:#4b5563;color:#e5e7eb}.form-input:focus{outline:0;box-shadow:0 0 0 2px rgba(108,30,39,.5);border-color:#6c1e27}`}</style>
        </div>
    );
};

export default ConsignmentDetailModal;