
import React, { useState, useMemo, useEffect, useRef, lazy, Suspense } from 'react';
import { Vehicle, AnalyticsEvent, SiteData, Review, FinancingConfig, ReviewUpdate, Consignment, ConsignmentConfig } from '../types';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon, LogoutIcon, EyeIcon, ChatBubbleIcon, TargetIcon, StarIcon, CircleDollarSignIcon, GripVerticalIcon, FileCheckIcon, StatsIcon, ShareIcon, ArrowUpDownIcon, MessageSquareIcon, HeartIcon, MousePointerClickIcon, GlobeIcon, CogIcon, SellCarIcon } from '../constants';
import { optimizeUrl } from '../utils/image';
import ConfirmationModal from './ConfirmationModal';
import VehiclePerformanceTable, { PerformanceData } from './VehiclePerformanceTable';
import ReviewEditModal from './ReviewEditModal';
import ConsignmentsPanel from './admin/ConsignmentsPanel';

const PageViewsChart = lazy(() => import('./charts/AnalyticsCharts').then(module => ({ default: module.PageViewsChart })));
const TopVehiclesChart = lazy(() => import('./charts/AnalyticsCharts').then(module => ({ default: module.TopVehiclesChart })));
const EventDistributionChart = lazy(() => import('./charts/AnalyticsCharts').then(module => ({ default: module.EventDistributionChart })));

interface AdminPanelProps {
    vehicles: Vehicle[];
    allEvents: AnalyticsEvent[];
    siteData: SiteData;
    onAdd: (consignment?: Consignment) => void;
    onEdit: (vehicle: Vehicle) => void;
    onDelete: (vehicleId: number) => void;
    onLogout: () => void;
    onDataUpdate: () => void;
    onToggleFeatured: (vehicleId: number, currentStatus: boolean) => void;
    onToggleSold: (vehicleId: number, currentStatus: boolean) => void;
    onReorder: (reorderedVehicles: Vehicle[]) => void;
}

const TabButton: React.FC<{ name: string; icon: React.ReactNode; isActive: boolean; onClick: () => void }> = ({ name, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 sm:gap-3 flex-shrink-0 py-3 px-1 sm:px-2 border-b-2 font-semibold text-base sm:text-lg transition-colors focus:outline-none ${
            isActive
                ? 'border-rago-burgundy text-rago-burgundy'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
        }`}
    >
        {icon}
        {name}
    </button>
);

const KeyMetricCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-subtle dark:shadow-subtle-dark border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-4 sm:gap-5">
            <div className="flex-shrink-0 bg-slate-100 dark:bg-slate-700/50 text-rago-burgundy p-3 sm:p-4 rounded-xl">
                {icon}
            </div>
            <div>
                <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">{value}</p>
                <p className="text-sm sm:text-base font-medium text-slate-500 dark:text-slate-400 mt-1">{title}</p>
            </div>
        </div>
    </div>
);

// --- STATS VIEW ---
const StatsView: React.FC<{ vehicles: Vehicle[]; allEvents: AnalyticsEvent[]; onAnalyticsReset: () => void; }> = ({ vehicles, allEvents, onAnalyticsReset }) => {
    const [dateRange, setDateRange] = useState<'today' | '7d' | '30d' | 'all'>('7d');
    const [isResetting, setIsResetting] = useState(false);
    const [password, setPassword] = useState('');

    const filteredEvents = useMemo(() => {
        if (dateRange === 'all') return allEvents;

        const now = new Date();
        // Use UTC date for calculations to avoid timezone issues.
        const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

        let startDateUTC: Date;

        switch(dateRange) {
            case 'today':
                startDateUTC = todayUTC;
                break;
            case '7d':
                startDateUTC = new Date(todayUTC);
                startDateUTC.setUTCDate(todayUTC.getUTCDate() - 6);
                break;
            case '30d':
                startDateUTC = new Date(todayUTC);
                startDateUTC.setUTCDate(todayUTC.getUTCDate() - 29);
                break;
            default:
                // Should not happen, but as a fallback, return all events
                return allEvents;
        }
        
        return allEvents.filter(event => new Date(event.created_at) >= startDateUTC);
    }, [allEvents, dateRange]);

    const performanceData = useMemo<PerformanceData[]>(() => {
        return vehicles.map(vehicle => {
            const eventsForVehicle = filteredEvents.filter(e => e.vehicle_id === vehicle.id);
            const views = eventsForVehicle.filter(e => e.event_type === 'view_vehicle_detail').length;
            const contacts = eventsForVehicle.filter(e => e.event_type === 'click_whatsapp_vehicle').length;
            const cardClicks = eventsForVehicle.filter(e => e.event_type === 'click_card_details').length;
            const favorites = eventsForVehicle.filter(e => e.event_type === 'favorite_add').length;
            const shares = eventsForVehicle.filter(e => e.event_type === 'click_share_vehicle').length;
            const contactRate = views > 0 ? (contacts / views) * 100 : 0;
            return { vehicle, views, cardClicks, contacts, shares, favorites, contactRate };
        });
    }, [vehicles, filteredEvents]);
    
    const totalViews = useMemo(() => filteredEvents.filter(e => e.event_type === 'view_vehicle_detail').length, [filteredEvents]);
    const totalPageViews = useMemo(() => filteredEvents.filter(e => e.event_type === 'page_view').length, [filteredEvents]);
    const totalContacts = useMemo(() => filteredEvents.filter(e => e.event_type === 'click_whatsapp_vehicle').length, [filteredEvents]);
    const totalFavorites = useMemo(() => filteredEvents.filter(e => e.event_type === 'favorite_add').length, [filteredEvents]);
    const conversionRate = totalViews > 0 ? ((totalContacts / totalViews) * 100).toFixed(1) + '%' : '0%';

    const chartData = useMemo(() => {
        const topVehiclesMap: { [key: number]: number } = {};
        const eventDistributionMap: { [key: string]: number } = {};

        filteredEvents.forEach(event => {
            if (event.event_type === 'view_vehicle_detail' && event.vehicle_id) {
                topVehiclesMap[event.vehicle_id] = (topVehiclesMap[event.vehicle_id] || 0) + 1;
            }
            eventDistributionMap[event.event_type] = (eventDistributionMap[event.event_type] || 0) + 1;
        });

        const getPageViewsData = () => {
            const now = new Date();
            const todayUTCStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
            let dataMap = new Map<string, number>();
            let labels: string[] = [];
        
            if (dateRange === 'today') {
                for (let i = 0; i < 24; i++) {
                    const label = `${i.toString().padStart(2, '0')}:00`;
                    labels.push(label);
                    dataMap.set(label, 0);
                }
                filteredEvents.forEach(event => {
                    if (event.event_type === 'page_view') {
                        const hour = new Date(event.created_at).getUTCHours();
                        const label = `${hour.toString().padStart(2, '0')}:00`;
                        if (dataMap.has(label)) {
                            dataMap.set(label, (dataMap.get(label) || 0) + 1);
                        }
                    }
                });
                return { labels, data: Array.from(dataMap.values()) };
        
            } else if (dateRange === '7d' || dateRange === '30d') {
                const days = dateRange === '7d' ? 7 : 30;
                const tempMap = new Map<string, number>();
                
                for (let i = days - 1; i >= 0; i--) {
                    const d = new Date(todayUTCStart);
                    d.setUTCDate(todayUTCStart.getUTCDate() - i);
                    const dateKey = d.toISOString().split('T')[0];
                    tempMap.set(dateKey, 0);
                }
        
                filteredEvents.forEach(event => {
                    if (event.event_type === 'page_view') {
                        const dateKey = new Date(event.created_at).toISOString().split('T')[0];
                        if (tempMap.has(dateKey)) {
                            tempMap.set(dateKey, (tempMap.get(dateKey) || 0) + 1);
                        }
                    }
                });
        
                Array.from(tempMap.keys()).forEach(dateKey => {
                    const d = new Date(`${dateKey}T12:00:00Z`);
                    const label = dateRange === '7d' 
                        ? d.toLocaleDateString('es-AR', { weekday: 'short', timeZone: 'UTC' }).replace('.', '')
                        : d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', timeZone: 'UTC' });
                    labels.push(label);
                });
                
                return { labels, data: Array.from(tempMap.values()) };
        
            } else { // 'all'
                const allPageViewEvents = allEvents.filter(e => e.event_type === 'page_view');
                if (allPageViewEvents.length === 0) return { labels: [], data: [] };
                
                const sortedEvents = allPageViewEvents.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                
                const firstDate = new Date(sortedEvents[0].created_at);
                const firstMonthUTC = new Date(Date.UTC(firstDate.getUTCFullYear(), firstDate.getUTCMonth(), 1));
                let currentDate = firstMonthUTC;
        
                while (currentDate <= todayUTCStart) {
                    const monthKey = currentDate.toLocaleDateString('es-AR', { month: 'short', year: '2-digit', timeZone: 'UTC' });
                    labels.push(monthKey);
                    dataMap.set(monthKey, 0);
                    currentDate.setUTCMonth(currentDate.getUTCMonth() + 1);
                }
        
                sortedEvents.forEach(event => {
                    const date = new Date(event.created_at);
                    const monthKey = date.toLocaleDateString('es-AR', { month: 'short', year: '2-digit', timeZone: 'UTC' });
                    if (dataMap.has(monthKey)) {
                        dataMap.set(monthKey, (dataMap.get(monthKey) || 0) + 1);
                    }
                });
                return { labels, data: Array.from(dataMap.values()) };
            }
        };

        return {
            pageViews: getPageViewsData(),
            topVehicles: Object.entries(topVehiclesMap).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id, views]) => {
                const vehicle = vehicles.find(v => v.id === Number(id));
                return {
                    label: vehicle ? `${vehicle.make} ${vehicle.model}` : `ID ${id}`,
                    views,
                }
            }),
            eventDistribution: eventDistributionMap,
        };
    }, [filteredEvents, vehicles, dateRange, allEvents]);


    const handleResetConfirm = async () => {
        try {
            const response = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'resetAnalytics', payload: { password } }),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al reiniciar.');
            }
            onAnalyticsReset();
            setIsResetting(false);
            setPassword('');
            alert('Las estadísticas han sido reiniciadas.');
        } catch (error: any) {
            alert(error.message);
        }
    };
    
    const ChartSuspenseFallback: React.FC<{ className?: string }> = ({ className }) => (
        <div className={`flex items-center justify-center text-slate-500 ${className}`}>
            <svg className="animate-spin h-6 w-6 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path></svg>
            Cargando gráfico...
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Rendimiento General</h2>
                <div className="flex bg-slate-200 dark:bg-slate-700/50 p-1 rounded-lg">
                    {(['today', '7d', '30d', 'all'] as const).map(range => (
                        <button key={range} onClick={() => setDateRange(range)} className={`px-3 sm:px-4 py-1.5 text-sm sm:text-base font-semibold rounded-md transition-colors ${dateRange === range ? 'bg-white dark:bg-slate-800 text-rago-burgundy shadow-sm' : 'text-slate-600 dark:text-slate-300'}`}>
                            {range === 'today' ? 'Hoy' : range === '7d' ? '7 días' : range === '30d' ? '30 días' : 'Todo'}
                        </button>
                    ))}
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KeyMetricCard title="Vistas de Vehículos" value={totalViews} icon={<EyeIcon className="h-7 w-7"/>} />
                <KeyMetricCard title="Contactos por WhatsApp" value={totalContacts} icon={<MessageSquareIcon className="h-7 w-7"/>} />
                <KeyMetricCard title="Agregado a Favoritos" value={totalFavorites} icon={<HeartIcon className="h-7 w-7"/>} />
                <KeyMetricCard title="Tasa de Contacto" value={conversionRate} icon={<TargetIcon className="h-7 w-7"/>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-subtle dark:shadow-subtle-dark border border-slate-200 dark:border-slate-700">
                    <Suspense fallback={<ChartSuspenseFallback className="h-80" />}>
                        <PageViewsChart data={chartData.pageViews} total={totalPageViews} />
                    </Suspense>
                </div>
                 <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-subtle dark:shadow-subtle-dark border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-bold mb-4">Top 5 Vehículos Más Vistos</h3>
                    <Suspense fallback={<ChartSuspenseFallback className="h-64" />}>
                        <TopVehiclesChart data={chartData.topVehicles} />
                    </Suspense>
                </div>
                 <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-subtle dark:shadow-subtle-dark border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-bold mb-4">Distribución de Eventos</h3>
                    <Suspense fallback={<ChartSuspenseFallback className="h-64" />}>
                        <EventDistributionChart data={chartData.eventDistribution} />
                    </Suspense>
                </div>
            </div>

            <VehiclePerformanceTable performanceData={performanceData} />
            
            <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
                 <h3 className="text-xl font-bold text-red-600 dark:text-red-500">Zona de Peligro</h3>
                <div className="mt-4 bg-red-50 dark:bg-red-900/20 p-6 rounded-xl border border-red-200 dark:border-red-500/30">
                     <p className="text-red-800 dark:text-red-200">Esta acción eliminará permanentemente todos los datos de análisis. No se puede deshacer.</p>
                     <button onClick={() => setIsResetting(true)} className="mt-4 px-5 py-2 text-base font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700">
                        Reiniciar Estadísticas
                    </button>
                </div>
            </div>

            {isResetting && <ConfirmationModal isOpen={true} onClose={() => setIsResetting(false)} onConfirm={handleResetConfirm} title="Confirmar Reinicio" message="Introduce tu contraseña de administrador para confirmar.">
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-4 w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md" placeholder="Contraseña de administrador"/>
            </ConfirmationModal>}
        </div>
    );
};

// --- INVENTORY VIEW ---
const InventoryView: React.FC<Omit<AdminPanelProps, 'allEvents' | 'siteData' | 'onDataUpdate'>> = ({ vehicles, onAdd, onEdit, onDelete, onToggleFeatured, onToggleSold, onReorder }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [orderedVehicles, setOrderedVehicles] = useState(vehicles);
    const dragItem = useRef<number | null>(null);

    useEffect(() => {
        const lowercasedTerm = searchTerm.toLowerCase().trim();
        setOrderedVehicles(
            lowercasedTerm
                ? vehicles.filter(v => `${v.make} ${v.model} ${v.year}`.toLowerCase().includes(lowercasedTerm))
                : vehicles
        );
    }, [vehicles, searchTerm]);
    
    const isReorderEnabled = searchTerm === '';
    const handleDragStart = (position: number) => dragItem.current = position;
    const handleDragEnter = (position: number) => {
        if (dragItem.current === null) return;
        const newOrderedVehicles = [...orderedVehicles];
        const draggedItemContent = newOrderedVehicles.splice(dragItem.current, 1)[0];
        newOrderedVehicles.splice(position, 0, draggedItemContent);
        dragItem.current = position;
        setOrderedVehicles(newOrderedVehicles);
    };
    const handleDragEnd = () => {
        if (dragItem.current !== null) onReorder(orderedVehicles);
        dragItem.current = null;
    };
    
    return (
         <div className="relative bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 animate-fade-in">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                 <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Gestión de Inventario</h2>
                 <div className="flex items-center gap-4 w-full md:w-auto flex-col sm:flex-row">
                     <div className="relative w-full sm:w-64">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-base bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-rago-burgundy focus:border-transparent transition"
                        />
                    </div>
                    <button
                        onClick={() => onAdd()}
                        className="flex w-full sm:w-auto items-center justify-center gap-2 px-5 py-2.5 text-base font-semibold text-white bg-rago-burgundy rounded-lg hover:bg-rago-burgundy-darker focus:outline-none focus:ring-4 focus:ring-rago-burgundy/50 transition-all transform hover:-translate-y-px"
                    >
                        <PlusIcon className="h-5 w-5" />
                        Añadir
                    </button>
                </div>
            </div>
            {!isReorderEnabled && (
                <div className="mb-4 p-3 text-sm text-center bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-500/50">
                    El reordenamiento manual está deshabilitado mientras se usa la búsqueda.
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="w-full text-base text-left text-slate-600 dark:text-slate-300">
                    <thead className="text-sm text-slate-700 uppercase bg-slate-100 dark:bg-slate-700/50 dark:text-slate-400">
                        <tr>
                            <th scope="col" className="p-4 w-12" title="Reordenar"></th>
                            <th scope="col" className="p-4">Vehículo</th>
                            <th scope="col" className="p-4 text-center">Estado</th>
                            <th scope="col" className="p-4">Precio</th>
                            <th scope="col" className="p-4 text-center">Destacado</th>
                            <th scope="col" className="p-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orderedVehicles.map((vehicle, index) => (
                            <tr key={vehicle.id} className={`border-b dark:border-slate-700 ${vehicle.is_sold ? 'opacity-60' : 'hover:bg-slate-50 dark:hover:bg-slate-800/20'} ${isReorderEnabled ? 'cursor-grab' : ''}`} draggable={isReorderEnabled} onDragStart={() => handleDragStart(index)} onDragEnter={() => handleDragEnter(index)} onDragEnd={handleDragEnd} onDragOver={(e) => e.preventDefault()}>
                                <td className="p-4 text-slate-400 text-center">{isReorderEnabled ? <GripVerticalIcon className="inline-block" /> : <span>{index + 1}</span>}</td>
                                <td className="p-4"><div className="flex items-center gap-4"><img src={optimizeUrl(vehicle.images[0], { w: 96, h: 72, fit: 'cover' })} alt={`${vehicle.make} ${vehicle.model}`} className="w-24 h-16 object-cover rounded-md flex-shrink-0 bg-slate-200 dark:bg-slate-700"/><div><p className="font-bold text-slate-800 dark:text-white">{vehicle.make} {vehicle.model}</p><p className="text-sm text-slate-500">{vehicle.year}</p></div></div></td>
                                <td className="p-4 text-center"><span className={`px-3 py-1 text-sm font-semibold rounded-full ${vehicle.is_sold ? 'bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-200' : 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'}`}>{vehicle.is_sold ? 'Vendido' : 'Disponible'}</span></td>
                                <td className="p-4 font-semibold text-lg text-slate-700 dark:text-slate-200">${vehicle.price.toLocaleString('es-AR')}</td>
                                <td className="p-4 text-center"><button onClick={() => onToggleFeatured(vehicle.id, vehicle.is_featured)} disabled={vehicle.is_sold} className="disabled:opacity-30 disabled:cursor-not-allowed"><StarIcon className={`h-6 w-6 transition-colors ${vehicle.is_featured ? 'text-amber-400' : 'text-slate-400 hover:text-amber-400'}`} filled={vehicle.is_featured} /></button></td>
                                <td className="p-4 text-right"><div className="flex items-center justify-end gap-1 flex-wrap"><button onClick={() => onToggleSold(vehicle.id, vehicle.is_sold)} className="p-2 text-slate-500 hover:text-green-500 dark:hover:text-green-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors" title={vehicle.is_sold ? 'Marcar como disponible' : 'Marcar como vendido'}><CircleDollarSignIcon className="h-5 w-5"/></button><button onClick={() => onEdit(vehicle)} className="p-2 text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors" title="Editar"><EditIcon /></button><button onClick={() => onDelete(vehicle.id)} className="p-2 text-slate-500 hover:text-red-500 dark:hover:text-red-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors" title="Eliminar"><TrashIcon /></button></div></td>
                            </tr>
                        ))}
                        {orderedVehicles.length === 0 && (<tr><td colSpan={6} className="text-center py-12 text-slate-500">No se encontraron vehículos.</td></tr>)}
                    </tbody>
                </table>
             </div>
        </div>
    );
};

// --- REVIEWS VIEW ---
const ReviewsPanel: React.FC<{ onDataUpdate: () => void; vehicles: Vehicle[] }> = ({ onDataUpdate, vehicles }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<{ type: 'edit' | 'delete', data: Review } | null>(null);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'get_all_reviews' })
            });
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            setReviews(data);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    useEffect(() => { fetchReviews(); }, []);

    const handleUpdate = async (reviewData: ReviewUpdate) => {
        try {
            const response = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'update_review', payload: reviewData })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'La actualización falló.');
            }
            fetchReviews(); // Re-fetch to show changes
            onDataUpdate(); // Update global state
            setModal(null); // Close modal on success
        } catch (error: any) {
            alert(`Error al actualizar la reseña: ${error.message}`);
            throw error; // Rethrow to be caught in modal
        }
    };

    const handleDelete = async (reviewId: number) => {
        try {
            const response = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete_review', payload: { id: reviewId } })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'La eliminación falló.');
            }
            fetchReviews();
            onDataUpdate();
            setModal(null);
        } catch (error: any) { alert(`Error al eliminar la reseña: ${error.message}`); }
    };
    
    const ToggleButton: React.FC<{isToggled: boolean, onToggle: ()=>void}> = ({isToggled, onToggle}) => (
        <button onClick={onToggle} className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${isToggled ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
            {isToggled ? 'Sí' : 'No'}
        </button>
    );

    return (
        <div className="animate-fade-in"><h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-6">Gestionar Reseñas</h2><div className="overflow-x-auto bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700"><table className="w-full text-left">
            <thead className="text-sm text-slate-700 uppercase bg-slate-100 dark:bg-slate-700/50 dark:text-slate-400">
                <tr className="border-b dark:border-slate-700">
                    <th className="p-4">Cliente</th>
                    <th className="p-4">Vehículo</th>
                    <th className="p-4">Comentario</th>
                    <th className="p-4 text-center">Visible (Detalle)</th>
                    <th className="p-4 text-center">Visible (Inicio)</th>
                    <th className="p-4 text-right">Acciones</th>
                </tr>
            </thead>
            <tbody>
            {loading ? <tr><td colSpan={6} className="text-center p-8">Cargando reseñas...</td></tr> : reviews.map(review => {
                const vehicle = review.vehicle_id ? vehicles.find(v => v.id === review.vehicle_id) : null;
                return (<tr key={review.id} className="border-b dark:border-slate-700/50">
                    <td className="p-4 font-semibold whitespace-nowrap">{review.customer_name}<div className="flex mt-1">{[...Array(5)].map((_, i) => <StarIcon key={i} className={`h-4 w-4 ${i < review.rating ? 'text-amber-400' : 'text-slate-300'}`} filled={i < review.rating} />)}</div></td>
                    <td className="p-4 text-sm">{vehicle ? `${vehicle.make} ${vehicle.model}` : <span className="text-slate-400 italic">General</span>}</td>
                    <td className="p-4 max-w-sm"><p className="line-clamp-2" title={review.comment || ''}>{review.comment}</p>{review.response_from_owner && <p className="text-xs text-green-600 mt-1 italic">Tiene respuesta</p>}</td>
                    <td className="p-4 text-center"><ToggleButton isToggled={review.is_visible} onToggle={() => handleUpdate({ id: review.id, is_visible: !review.is_visible })} /></td>
                    <td className="p-4 text-center"><ToggleButton isToggled={review.show_on_homepage} onToggle={() => handleUpdate({ id: review.id, show_on_homepage: !review.show_on_homepage })} /></td>
                    <td className="p-4 text-right"><div className="flex justify-end gap-2"><button onClick={() => setModal({ type: 'edit', data: review })} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded" title="Editar y Responder"><EditIcon /></button><button onClick={() => setModal({ type: 'delete', data: review })} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50 rounded" title="Eliminar"><TrashIcon /></button></div></td>
                </tr>)
            })}
            </tbody>
        </table></div>
        {modal?.type === 'delete' && <ConfirmationModal isOpen={true} onClose={() => setModal(null)} onConfirm={() => handleDelete(modal.data.id)} title="Eliminar Reseña" message="¿Seguro que quieres eliminar esta reseña?" />}
        {modal?.type === 'edit' && (
            <ReviewEditModal
                isOpen={true}
                onClose={() => setModal(null)}
                reviewData={modal.data}
                onUpdate={handleUpdate}
            />
        )}
        </div>
    )
};


// --- CONFIG VIEW ---
const ConfigPanel: React.FC<{ financingConfig: FinancingConfig, consignmentConfig: ConsignmentConfig, onDataUpdate: () => void }> = ({ financingConfig, consignmentConfig, onDataUpdate }) => {
    const [formState, setFormState] = useState({ ...financingConfig, ...consignmentConfig });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => { setFormState({ ...financingConfig, ...consignmentConfig }) }, [financingConfig, consignmentConfig]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: Number(value) }));
    };

    const handleSubmit = async (e: React.FormEvent, configKey: 'financing' | 'consignment') => {
        e.preventDefault();
        setIsSaving(true);
        try {
            let payloadValue;
            if (configKey === 'financing') {
                payloadValue = { maxAmount: formState.maxAmount, maxTerm: formState.maxTerm, interestRate: formState.interestRate };
            } else {
                payloadValue = { commissionRate: formState.commissionRate };
            }

            const response = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'update_site_config', payload: { key: configKey, value: payloadValue } })
            });
            if (!response.ok) throw new Error('Failed to save');
            onDataUpdate(); // Refresh global data
            alert('Configuración guardada!');
        } catch (error) {
            alert('Error al guardar la configuración.');
        } finally {
            setIsSaving(false);
        }
    };
    
    return(
        <div className="animate-fade-in"><h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-6">Configuración del Sitio</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <form onSubmit={(e) => handleSubmit(e, 'financing')} className="space-y-6"><h3 className="text-lg font-bold">Calculadora de Financiación</h3>
                    <div><label htmlFor="maxAmount" className="block text-sm font-medium">Monto Máximo a Financiar (ARS)</label><input type="number" id="maxAmount" name="maxAmount" value={formState.maxAmount} onChange={handleChange} className="mt-1 form-input" /></div>
                    <div><label htmlFor="maxTerm" className="block text-sm font-medium">Plazo Máximo (meses)</label><input type="number" id="maxTerm" name="maxTerm" value={formState.maxTerm} onChange={handleChange} className="mt-1 form-input" /></div>
                    <div><label htmlFor="interestRate" className="block text-sm font-medium">Tasa de Interés Mensual (%)</label><input type="number" step="0.01" id="interestRate" name="interestRate" value={formState.interestRate} onChange={handleChange} className="mt-1 form-input" /></div>
                    <div><button type="submit" disabled={isSaving} className="px-5 py-2.5 text-base font-semibold text-white bg-rago-burgundy rounded-lg hover:bg-rago-burgundy-darker disabled:opacity-60">{isSaving ? 'Guardando...' : 'Guardar Cambios'}</button></div>
                </form>
            </div>
             <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <form onSubmit={(e) => handleSubmit(e, 'consignment')} className="space-y-6"><h3 className="text-lg font-bold">Venta por Consignación</h3>
                    <div><label htmlFor="commissionRate" className="block text-sm font-medium">Comisión por Venta (%)</label><input type="number" step="0.1" id="commissionRate" name="commissionRate" value={formState.commissionRate} onChange={handleChange} className="mt-1 form-input" /></div>
                    <div><button type="submit" disabled={isSaving} className="px-5 py-2.5 text-base font-semibold text-white bg-rago-burgundy rounded-lg hover:bg-rago-burgundy-darker disabled:opacity-60">{isSaving ? 'Guardando...' : 'Guardar Cambios'}</button></div>
                </form>
            </div>
        </div>
        <style>{`.form-input{display:block;width:100%;padding:0.5rem 0.75rem;background-color:#f9fafb;border:1px solid #d1d5db;border-radius:0.375rem}.dark .form-input{background-color:#1f2937;border-color:#4b5563;color:#e5e7eb}`}</style>
        </div>
    )
};


export const AdminPanel: React.FC<AdminPanelProps> = (props) => {
    const [activeTab, setActiveTab] = useState<'inventory' | 'consignments' | 'stats' | 'reviews' | 'config'>('inventory');
    const [consignments, setConsignments] = useState<Consignment[]>([]);
    const [isLoadingConsignments, setIsLoadingConsignments] = useState(false);

    const fetchConsignments = async () => {
        setIsLoadingConsignments(true);
        try {
            const response = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'get_consignments' })
            });
            if (response.ok) {
                const data = await response.json();
                setConsignments(data);
            }
        } catch (error) {
            console.error("Failed to fetch consignments:", error);
        } finally {
            setIsLoadingConsignments(false);
        }
    };
    
    useEffect(() => {
        if (activeTab === 'consignments') {
            fetchConsignments();
        }
    }, [activeTab]);

    return (
        <div className="bg-slate-100 dark:bg-slate-900/50 p-4 sm:p-6 lg:p-8 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-800/50 min-h-[85vh]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Panel de Administración</h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400 mt-1">Gestioná tu inventario y analizá las estadísticas.</p>
                </div>
                <button
                    onClick={props.onLogout}
                    className="flex items-center gap-2 px-4 py-2 text-base font-semibold text-white bg-rago-burgundy rounded-lg hover:bg-rago-burgundy-darker focus:outline-none focus:ring-4 focus:ring-rago-burgundy/50 transition-all flex-shrink-0"
                >
                    <LogoutIcon className="h-5 w-5" />
                    Cerrar Sesión
                </button>
            </div>
            
            <div className="border-b border-slate-200 dark:border-slate-700">
                <nav className="-mb-px flex space-x-2 sm:space-x-6 overflow-x-auto" aria-label="Tabs">
                    <TabButton name="Inventario" icon={<FileCheckIcon className="h-5 w-5 sm:h-6 sm:w-6"/>} isActive={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} />
                    <TabButton name="Consignaciones" icon={<SellCarIcon className="h-5 w-5 sm:h-6 sm:w-6"/>} isActive={activeTab === 'consignments'} onClick={() => setActiveTab('consignments')} />
                    <TabButton name="Estadísticas" icon={<StatsIcon className="h-5 w-5 sm:h-6 sm:w-6"/>} isActive={activeTab === 'stats'} onClick={() => setActiveTab('stats')} />
                    <TabButton name="Reseñas" icon={<StarIcon className="h-5 w-5 sm:h-6 sm:w-6"/>} isActive={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')} />
                    <TabButton name="Configuración" icon={<CogIcon className="h-5 w-5 sm:h-6 sm:w-6"/>} isActive={activeTab === 'config'} onClick={() => setActiveTab('config')} />
                </nav>
            </div>
            
            <div className="mt-8">
                {activeTab === 'inventory' && <InventoryView {...props} />}
                {activeTab === 'consignments' && <ConsignmentsPanel consignments={consignments} isLoading={isLoadingConsignments} onRefresh={fetchConsignments} onApprove={props.onAdd} onDataUpdate={props.onDataUpdate} />}
                {activeTab === 'stats' && <StatsView vehicles={props.vehicles} allEvents={props.allEvents} onAnalyticsReset={props.onDataUpdate} />}
                {activeTab === 'reviews' && <ReviewsPanel onDataUpdate={props.onDataUpdate} vehicles={props.vehicles} />}
                {activeTab === 'config' && <ConfigPanel financingConfig={props.siteData.financingConfig} consignmentConfig={props.siteData.consignmentConfig} onDataUpdate={props.onDataUpdate} />}
            </div>
        </div>
    );
};