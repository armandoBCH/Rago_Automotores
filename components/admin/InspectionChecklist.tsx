
import React, { useState, useEffect } from 'react';
import type { Json } from '../../lib/database.types';
import { CheckIcon, XIcon, ClockIcon } from '../../constants';

type ChecklistStatus = 'pending' | 'ok' | 'review';

interface ChecklistItem {
    label: string;
    status: ChecklistStatus;
}

interface ChecklistSection {
    label: string;
    items: Record<string, ChecklistItem>;
}

type ChecklistData = Record<string, ChecklistSection>;

interface InspectionChecklistProps {
    checklistData: Json | null;
    onUpdate: (data: Json) => void;
}

const DEFAULT_CHECKLIST: ChecklistData = {
    mecanica: {
        label: "Mecánica",
        items: {
            motor: { label: "Motor", status: 'pending' },
            transmision: { label: "Transmisión", status: 'pending' },
            frenos: { label: "Frenos", status: 'pending' },
            tren_delantero: { label: "Tren Delantero", status: 'pending' }
        }
    },
    documentacion: {
        label: "Documentación",
        items: {
            titulo: { label: "Título", status: 'pending' },
            cedula: { label: "Cédula", status: 'pending' },
            deudas: { label: "Deudas (Patente/Infracc.)", status: 'pending' },
            verificacion_policial: { label: "Verificación Policial", status: 'pending' }
        }
    },
    estetica: {
        label: "Estética y Chasis",
        items: {
            chasis: { label: "N° de Chasis/Motor", status: 'pending' },
            pintura: { label: "Pintura y Carrocería", status: 'pending' },
            interior: { label: "Interior", status: 'pending' },
            neumaticos: { label: "Neumáticos", status: 'pending' }
        }
    }
};

const STATUS_CONFIG: Record<ChecklistStatus, { icon: React.ReactNode; text: string; classes: string }> = {
    pending: { icon: <ClockIcon className="h-4 w-4" />, text: 'Pendiente', classes: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300' },
    ok: { icon: <CheckIcon className="h-4 w-4" />, text: 'OK', classes: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' },
    review: { icon: <XIcon className="h-4 w-4" />, text: 'Revisar', classes: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' },
};

const InspectionChecklist: React.FC<InspectionChecklistProps> = ({ checklistData, onUpdate }) => {
    const [checklist, setChecklist] = useState<ChecklistData>(DEFAULT_CHECKLIST);

    useEffect(() => {
        // Merge default structure with saved data to handle schema changes gracefully
        const initialData = checklistData && typeof checklistData === 'object' ? checklistData : {};
        const mergedData = JSON.parse(JSON.stringify(DEFAULT_CHECKLIST)); // Deep copy

        // Fix: Cast initialData to a less strict type to allow safe property access.
        const initialDataAny = initialData as any;

        for (const sectionKey in mergedData) {
            if (initialDataAny[sectionKey]) {
                for (const itemKey in mergedData[sectionKey].items) {
                    if (initialDataAny[sectionKey].items?.[itemKey]?.status) {
                        mergedData[sectionKey].items[itemKey].status = initialDataAny[sectionKey].items[itemKey].status;
                    }
                }
            }
        }
        // Fix: Ensure the state is updated with the correct type after JSON operations.
        setChecklist(mergedData as ChecklistData);
    }, [checklistData]);

    const handleStatusChange = (sectionKey: string, itemKey: string, newStatus: ChecklistStatus) => {
        const newChecklist = { ...checklist };
        newChecklist[sectionKey].items[itemKey].status = newStatus;
        setChecklist(newChecklist);
        onUpdate(newChecklist as unknown as Json);
    };
    
    return (
        <div className="animate-fade-in space-y-6">
            {Object.entries(checklist).map(([sectionKey, section]) => (
                <div key={sectionKey} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                    <h4 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-3">{section.label}</h4>
                    <div className="space-y-3">
                        {Object.entries(section.items).map(([itemKey, item]) => (
                            <div key={itemKey} className="flex justify-between items-center bg-white dark:bg-slate-900/50 p-3 rounded-md">
                                <span className="text-slate-700 dark:text-slate-300">{item.label}</span>
                                <div className="flex gap-1">
                                    {(['ok', 'review', 'pending'] as ChecklistStatus[]).map(status => (
                                        <button
                                            key={status}
                                            onClick={() => handleStatusChange(sectionKey, itemKey, status)}
                                            className={`p-1 rounded-full transition-all duration-300 ease-in-out transform focus:outline-none ${item.status === status ? 'scale-110 opacity-100' : 'scale-100 opacity-50 hover:opacity-100 focus:opacity-100'}`}
                                            title={STATUS_CONFIG[status].text}
                                        >
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-md transition-shadow ${STATUS_CONFIG[status].classes} ${item.status === status ? 'shadow-lg' : ''}`}>
                                                {STATUS_CONFIG[status].icon}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default InspectionChecklist;
