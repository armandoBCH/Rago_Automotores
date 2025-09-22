
import React, { useState, useMemo } from 'react';
import { Consignment } from '../../types';
import { optimizeUrl } from '../../utils/image';
import ConsignmentDetailModal from './ConsignmentDetailModal';

type Status = Consignment['status'];

const STATUS_MAP: Record<Status, { text: string; classes: string }> = {
    pending: { text: 'Pendiente', classes: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' },
    in_review: { text: 'En Revisión', classes: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' },
    approved: { text: 'Aprobado', classes: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300' },
    published: { text: 'Publicado', classes: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' },
    sold: { text: 'Vendido', classes: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300' },
    rejected: { text: 'Rechazado', classes: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' },
};

interface ConsignmentsPanelProps {
    consignments: Consignment[];
    isLoading: boolean;
    onRefresh: () => void;
    onApprove: (consignment: Consignment) => void;
    onDataUpdate: () => void;
}

const ConsignmentsPanel: React.FC<ConsignmentsPanelProps> = ({ consignments, isLoading, onRefresh, onApprove, onDataUpdate }) => {
    const [activeFilter, setActiveFilter] = useState<Status | 'all'>('all');
    const [selectedConsignment, setSelectedConsignment] = useState<Consignment | null>(null);

    const filteredConsignments = useMemo(() => {
        if (activeFilter === 'all') return consignments;
        return consignments.filter(c => c.status === activeFilter);
    }, [consignments, activeFilter]);
    
    const handleModalClose = () => {
        setSelectedConsignment(null);
        onRefresh(); // Refresh data when modal closes
    };

    return (
        <div className="animate-fade-in">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Gestión de Consignaciones</h2>
            </div>
            
            <div className="mb-4 flex flex-wrap gap-2">
                {(['all', ...Object.keys(STATUS_MAP)] as (Status | 'all')[]).map(status => (
                    <button
                        key={status}
                        onClick={() => setActiveFilter(status)}
                        className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                            activeFilter === status 
                                ? 'bg-rago-burgundy text-white shadow' 
                                : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
                        }`}
                    >
                        {status === 'all' ? 'Todos' : STATUS_MAP[status as Status].text}
                    </button>
                ))}
            </div>

            <div className="overflow-x-auto bg-white dark:bg-slate-800 p-4 sm:p-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <table className="w-full text-left">
                    <thead className="text-sm text-slate-700 uppercase bg-slate-100 dark:bg-slate-700/50 dark:text-slate-400">
                        <tr>
                            <th className="p-4">Vehículo</th>
                            <th className="p-4">Propietario</th>
                            <th className="p-4">Precio Solicitado</th>
                            <th className="p-4">Fecha</th>
                            <th className="p-4 text-center">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={5} className="text-center p-12">Cargando...</td></tr>
                        ) : filteredConsignments.length === 0 ? (
                             <tr><td colSpan={5} className="text-center p-12 text-slate-500">No hay consignaciones en este estado.</td></tr>
                        ) : (
                            filteredConsignments.map(c => (
                                <tr key={c.id} onClick={() => setSelectedConsignment(c)} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <img src={optimizeUrl(c.images[0], { w: 80, h: 60, fit: 'cover' })} alt={`${c.make} ${c.model}`} className="w-20 h-14 object-cover rounded-md flex-shrink-0 bg-slate-200 dark:bg-slate-700" />
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-white">{c.make} {c.model}</p>
                                                <p className="text-sm text-slate-500">{c.year}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <p className="font-semibold">{c.owner_name}</p>
                                        <p className="text-sm text-slate-500">{c.owner_phone}</p>
                                    </td>
                                    <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">${c.price_requested.toLocaleString('es-AR')}</td>
                                    <td className="p-4 text-sm text-slate-500">{new Date(c.created_at).toLocaleDateString('es-AR')}</td>
                                    <td className="p-4 text-center">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${STATUS_MAP[c.status].classes}`}>
                                            {STATUS_MAP[c.status].text}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {selectedConsignment && (
                <ConsignmentDetailModal
                    isOpen={!!selectedConsignment}
                    onClose={handleModalClose}
                    consignment={selectedConsignment}
                    onApproveAndCreateListing={onApprove}
                    onDataUpdate={onDataUpdate}
                />
            )}
        </div>
    );
};

export default ConsignmentsPanel;
