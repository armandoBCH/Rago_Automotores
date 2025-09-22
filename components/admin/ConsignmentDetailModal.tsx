
import React, { useState, useEffect } from 'react';
import { Consignment, ConsignmentUpdate } from '../../types';
import { XIcon } from '../../constants';
import { optimizeUrl } from '../../utils/image';

interface ConsignmentDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    consignment: Consignment;
    onApproveAndCreateListing: (consignment: Consignment) => void;
    onDataUpdate: () => void;
}

// Fix: Define the Status type alias to be used in the component.
type Status = Consignment['status'];

const statusOptions: Consignment['status'][] = ['pending', 'in_review', 'approved', 'published', 'sold', 'rejected'];
const STATUS_TEXT: Record<Consignment['status'], string> = {
    pending: 'Pendiente', in_review: 'En Revisión', approved: 'Aprobado',
    published: 'Publicado', sold: 'Vendido', rejected: 'Rechazado'
};

const DetailItem: React.FC<{ label: string; value: string | number | null | undefined }> = ({ label, value }) => (
    <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-base font-semibold text-slate-800 dark:text-white">{value || '-'}</p>
    </div>
);

const ConsignmentDetailModal: React.FC<ConsignmentDetailModalProps> = ({ isOpen, onClose, consignment, onApproveAndCreateListing, onDataUpdate }) => {
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [internalNotes, setInternalNotes] = useState(consignment.internal_notes || '');
    const [status, setStatus] = useState(consignment.status);
    
    useEffect(() => {
        if (isOpen) setIsAnimatingOut(false);
    }, [isOpen]);

    const handleClose = () => {
        setIsAnimatingOut(true);
        setTimeout(onClose, 200);
    };

    const handleUpdate = async (updateData: ConsignmentUpdate) => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'update_consignment', payload: { id: consignment.id, ...updateData } })
            });
            if (!response.ok) throw new Error('Failed to save update');
            onDataUpdate();
        } catch (error) {
            console.error(error);
            alert('Error al guardar los cambios.');
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleStatusChange = (newStatus: Status) => {
        setStatus(newStatus);
        handleUpdate({ status: newStatus });
    };

    const handleSaveNotes = () => {
        handleUpdate({ internal_notes: internalNotes });
    };

    const handleApprove = () => {
        handleUpdate({ status: 'approved' }).then(() => {
            onApproveAndCreateListing({ ...consignment, status: 'approved' });
            handleClose();
        });
    };

    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 bg-black flex justify-center items-center z-50 p-4 transition-opacity duration-200 ease-out ${!isAnimatingOut ? 'bg-opacity-60' : 'bg-opacity-0'}`} onClick={handleClose}>
            <div className={`bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col transform transition-all duration-200 ease-out ${!isAnimatingOut ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b dark:border-slate-700">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Detalle de Consignación</h3>
                    <button onClick={handleClose}><XIcon className="h-6 w-6" /></button>
                </header>
                
                <div className="flex-grow overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <DetailItem label="Marca" value={consignment.make} />
                            <DetailItem label="Modelo" value={consignment.model} />
                            <DetailItem label="Año" value={consignment.year} />
                            <DetailItem label="Kilometraje" value={`${consignment.mileage.toLocaleString('es-AR')} km`} />
                            <DetailItem label="Motor" value={consignment.engine} />
                            <DetailItem label="Transmisión" value={consignment.transmission} />
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Precio Solicitado</p>
                            <p className="text-2xl font-bold text-rago-burgundy">${consignment.price_requested.toLocaleString('es-AR')}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Información Extra</p>
                            <p className="text-base text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{consignment.extra_info || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Imágenes</p>
                            <div className="flex flex-wrap gap-2">
                                {consignment.images.map(img => <a href={img} target="_blank" rel="noopener noreferrer" key={img}><img src={optimizeUrl(img, {w: 120, h: 90, fit: 'cover'})} className="w-32 h-24 object-cover rounded-md" /></a>)}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6 lg:border-l lg:pl-6 dark:border-slate-700">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Estado Actual</p>
                            <select value={status} onChange={(e) => handleStatusChange(e.target.value as Status)} className="form-input w-full">
                                {statusOptions.map(s => <option key={s} value={s}>{STATUS_TEXT[s]}</option>)}
                            </select>
                        </div>
                         <div>
                            <p className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">Datos del Propietario</p>
                            <div className="space-y-3">
                                <DetailItem label="Nombre" value={consignment.owner_name} />
                                <DetailItem label="Teléfono" value={consignment.owner_phone} />
                                <DetailItem label="Email" value={consignment.owner_email} />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="internal_notes" className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-1">Notas Internas</label>
                            <textarea id="internal_notes" value={internalNotes} onChange={e => setInternalNotes(e.target.value)} rows={4} className="form-input w-full" placeholder="Añadir notas privadas..."></textarea>
                            <button onClick={handleSaveNotes} disabled={isSaving} className="mt-2 px-3 py-1 text-sm font-semibold text-white bg-slate-600 rounded-md hover:bg-slate-700 disabled:opacity-50">Guardar Nota</button>
                        </div>

                        {consignment.status === 'in_review' && (
                            <button onClick={handleApprove} disabled={isSaving} className="w-full mt-4 px-4 py-3 text-base font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50">
                                Aprobar y Crear Publicación
                            </button>
                        )}
                         {consignment.vehicle_id && (
                             <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg text-center">
                                <a href={`/vehiculo/id-${consignment.vehicle_id}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-rago-burgundy hover:underline">Ver Publicación Activa</a>
                            </div>
                        )}
                    </div>
                </div>
                 <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 flex justify-end">
                    <button onClick={handleClose} className="px-4 py-2 text-base font-medium text-slate-700 bg-slate-200 rounded-md hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-300 dark:hover:bg-slate-500">Cerrar</button>
                </div>
            </div>
             <style>{`.form-input{display:block;width:100%;padding:0.5rem 0.75rem;background-color:#fff;border:1px solid #d1d5db;border-radius:0.375rem;box-shadow:0 1px 2px 0 rgba(0,0,0,0.05);transition:border-color .2s,box-shadow .2s;font-size:1rem;line-height:1.5rem}.dark .form-input{background-color:#1f2937;border-color:#4b5563;color:#e5e7eb}.form-input:focus{outline:0;box-shadow:0 0 0 2px rgba(108,30,39,.5);border-color:#6c1e27}`}</style>
        </div>
    );
};

export default ConsignmentDetailModal;