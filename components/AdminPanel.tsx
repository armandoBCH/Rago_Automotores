

import React, { useState, useMemo } from 'react';
import { Vehicle } from '../types';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon, LogoutIcon } from '../constants';
import { optimizeUrl } from '../utils/image';

interface AdminPanelProps {
    vehicles: Vehicle[];
    onAdd: () => void;
    onEdit: (vehicle: Vehicle) => void;
    onDelete: (vehicleId: number) => void;
    onLogout: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ vehicles, onAdd, onEdit, onDelete, onLogout }) => {
    const [searchTerm, setSearchTerm] = useState('');

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


    return (
        <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg shadow-lg transition-colors duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white flex-shrink-0">Gestión de Inventario</h2>
                <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="w-full sm:w-64">
                        <div className="bg-slate-200 dark:bg-gray-800/60 p-1 rounded-xl shadow-inner relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <SearchIcon className="h-5 w-5 text-gray-400" />
                            </span>
                            <input
                                type="text"
                                placeholder="Buscar por marca, modelo, año..."
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
                        Añadir Vehículo
                    </button>
                    <button
                        onClick={onLogout}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 text-base font-medium text-rago-burgundy dark:text-gray-300 bg-rago-burgundy/10 rounded-lg hover:bg-rago-burgundy/20 dark:bg-gray-800 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rago-burgundy transition-colors flex-shrink-0"
                        aria-label="Cerrar sesión"
                    >
                        <LogoutIcon className="h-5 w-5" />
                        <span className="hidden sm:inline">Cerrar Sesión</span>
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
                                        <button onClick={() => onEdit(vehicle)} className="text-gray-500 hover:text-rago-burgundy dark:text-gray-400 dark:hover:text-rago-white transition-colors">
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
        </div>
    );
};

export default AdminPanel;
