

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Vehicle, VehicleFormData } from './types';
import { supabase } from './lib/supabaseClient';
import Header from './components/Header';
import Hero from './components/Hero';
import FilterBar from './components/FilterBar';
import VehicleList from './components/VehicleList';
import VehicleDetailModal from './components/VehicleDetailModal';
import AdminPanel from './components/AdminPanel';
import VehicleFormModal from './components/VehicleFormModal';
import ConfirmationModal from './components/ConfirmationModal';
import Footer from './components/Footer';

type ModalState = 
    | { type: 'none' }
    | { type: 'detail'; vehicle: Vehicle }
    | { type: 'form'; vehicle?: Vehicle }
    | { type: 'confirmDelete'; vehicleId: number };

const App: React.FC = () => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [modalState, setModalState] = useState<ModalState>({ type: 'none' });
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ make: '', year: '', price: '' });

    const fetchVehicles = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: dbError } = await supabase
                .from('vehicles')
                .select('*')
                .order('created_at', { ascending: false });

            if (dbError) throw dbError;
            setVehicles(data || []);
        } catch (err: any) {
            console.error("Error fetching vehicles:", err);
            setError("No se pudieron cargar los vehículos. Por favor, intente de nuevo más tarde.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVehicles();
    }, [fetchVehicles]);

    const uniqueBrands = useMemo(() => {
        const brands = new Set(vehicles.map(v => v.make));
        return Array.from(brands).sort();
    }, [vehicles]);

    const filteredVehicles = useMemo(() => {
        let tempVehicles = [...vehicles];

        const lowercasedTerm = searchTerm.toLowerCase().trim();
        if (lowercasedTerm) {
            tempVehicles = tempVehicles.filter(vehicle =>
                vehicle.make.toLowerCase().includes(lowercasedTerm) ||
                vehicle.model.toLowerCase().includes(lowercasedTerm) ||
                String(vehicle.year).includes(lowercasedTerm)
            );
        }
        
        if (filters.make) {
            tempVehicles = tempVehicles.filter(v => v.make === filters.make);
        }

        if (filters.year) {
            const yearNum = parseInt(filters.year, 10);
            if (!isNaN(yearNum)) {
                tempVehicles = tempVehicles.filter(v => v.year >= yearNum);
            }
        }

        if (filters.price) {
            const priceNum = parseInt(filters.price, 10);
            if (!isNaN(priceNum)) {
                tempVehicles = tempVehicles.filter(v => v.price <= priceNum);
            }
        }

        return tempVehicles;
    }, [vehicles, searchTerm, filters]);


    const handleSelectVehicle = (vehicle: Vehicle) => setModalState({ type: 'detail', vehicle });
    const handleCloseModal = () => setModalState({ type: 'none' });
    
    const handleFilterChange = useCallback((newFilters: { make: string, year: string, price: string }) => {
        setFilters(newFilters);
    }, []);

    const handleAddVehicleClick = () => setModalState({ type: 'form' });
    const handleEditVehicleClick = (vehicle: Vehicle) => setModalState({ type: 'form', vehicle });
    const handleDeleteVehicleClick = (vehicleId: number) => setModalState({ type: 'confirmDelete', vehicleId });

    const handleSaveVehicle = async (vehicleData: VehicleFormData) => {
        const { id, ...vehicleInfo } = vehicleData;
        const isEdit = !!id;

        try {
            if (isEdit) {
                const { error: updateError } = await supabase.from('vehicles').update(vehicleInfo).eq('id', id);
                if (updateError) throw updateError;
            } else {
                const { error: insertError } = await supabase.from('vehicles').insert(vehicleData);
                if (insertError) throw insertError;
            }
            await fetchVehicles();
            handleCloseModal();
        } catch (err: any) {
            console.error("Error saving vehicle:", err);
            alert(`Error al guardar el vehículo: ${err.message}`);
        }
    };

    const confirmDelete = async () => {
        if (modalState.type === 'confirmDelete') {
            try {
                const { error: deleteError } = await supabase.from('vehicles').delete().eq('id', modalState.vehicleId);
                if (deleteError) throw deleteError;
                setVehicles(prev => prev.filter(v => v.id !== modalState.vehicleId));
                handleCloseModal();
            } catch (err: any) {
                console.error("Error deleting vehicle:", err);
                alert(`Error al eliminar el vehículo: ${err.message}`);
            }
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-rago-black font-sans transition-colors duration-300 flex flex-col">
            <Header isAdmin={isAdmin} onToggleAdmin={() => setIsAdmin(prev => !prev)} />
            
            {!isAdmin && <Hero searchTerm={searchTerm} onSearchChange={setSearchTerm} />}

            <main className="container mx-auto px-4 md:px-6 py-8 flex-grow">
                {loading ? (
                    <div className="text-center py-16">
                        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">Cargando vehículos...</h2>
                    </div>
                ) : error ? (
                     <div className="text-center py-16 text-red-500">
                        <h2 className="text-2xl font-semibold">{error}</h2>
                    </div>
                ) : isAdmin ? (
                    <AdminPanel 
                        vehicles={vehicles}
                        onAdd={handleAddVehicleClick}
                        onEdit={handleEditVehicleClick}
                        onDelete={handleDeleteVehicleClick}
                    />
                ) : (
                    <>
                        <FilterBar 
                            filters={filters} 
                            onFilterChange={handleFilterChange} 
                            brands={uniqueBrands}
                        />
                        <VehicleList vehicles={filteredVehicles} onVehicleClick={handleSelectVehicle} />
                    </>
                )}
            </main>

            <Footer />

            {modalState.type === 'detail' && (
                <VehicleDetailModal vehicle={modalState.vehicle} onClose={handleCloseModal} />
            )}
            
            {modalState.type === 'form' && (
                <VehicleFormModal 
                    isOpen={true}
                    onClose={handleCloseModal}
                    onSubmit={handleSaveVehicle}
                    initialData={modalState.vehicle}
                    brands={uniqueBrands}
                />
            )}

            {modalState.type === 'confirmDelete' && (
                <ConfirmationModal
                    isOpen={true}
                    onClose={handleCloseModal}
                    onConfirm={confirmDelete}
                    title="Confirmar Eliminación"
                    message="¿Estás seguro de que quieres eliminar este vehículo? Esta acción no se puede deshacer."
                />
            )}
        </div>
    );
};

export default App;