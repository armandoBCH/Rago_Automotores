

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Vehicle, VehicleFormData, AnalyticsEvent } from './types';
import { ChatBubbleIcon, InstagramIcon, CatalogIcon, SellCarIcon, HomeIcon, StatsIcon } from './constants';
import { supabase } from './lib/supabaseClient';
import { trackEvent } from './lib/analytics';
import { optimizeUrl } from './utils/image';
import Header from './components/Header';
import Hero from './components/Hero';
import FilterBar from './components/FilterBar';
import VehicleList from './components/VehicleList';
import VehicleDetailPage from './components/VehicleDetailPage';
import AdminPanel from './components/AdminPanel';
import VehicleFormModal from './components/VehicleFormModal';
import ConfirmationModal from './components/ConfirmationModal';
import Footer from './components/Footer';
import LoginPage from './components/LoginPage';
import SellYourCarSection from './components/SellYourCarSection';
import ScrollToTopButton from './components/ScrollToTopButton';
import VehicleStatsModal from './components/VehicleStatsModal';

type ModalState = 
    | { type: 'none' }
    | { type: 'form'; vehicle?: Vehicle }
    | { type: 'confirmDelete'; vehicleId: number }
    | { type: 'vehicleStats'; vehicle: Vehicle };

const App: React.FC = () => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [analyticsEvents, setAnalyticsEvents] = useState<AnalyticsEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [dbError, setDbError] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem('rago-admin') === 'true');
    const [modalState, setModalState] = useState<ModalState>({ type: 'none' });
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ make: '', year: '', price: '' });
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // Initialize path based on current location, but accommodate admin state
    const [path, setPath] = useState(() => {
        const currentAdminState = sessionStorage.getItem('rago-admin') === 'true';
        if (currentAdminState) {
            return '/admin'; // Force admin path if logged in
        }
        return window.location.pathname;
    });

    const fetchAllData = useCallback(async () => {
        setLoading(true);
        setDbError(null);
        try {
            const [vehiclesResult, analyticsResult] = await Promise.all([
                supabase.from('vehicles').select('*').order('created_at', { ascending: false }),
                supabase.from('analytics_events').select('*')
            ]);

            if (vehiclesResult.error) throw vehiclesResult.error;
            if (analyticsResult.error) throw analyticsResult.error;

            setVehicles(vehiclesResult.data || []);
            setAnalyticsEvents(analyticsResult.data || []);
        } catch (err: any) {
            console.error("Error fetching data:", err);
            setDbError("No se pudieron cargar los datos. Por favor, intente de nuevo más tarde.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);
    
    const navigate = useCallback((newPath: string, replace = false) => {
        const currentPath = path + window.location.search + window.location.hash;
        if (newPath === currentPath) return;

        if (replace) {
            window.history.replaceState({}, '', newPath);
        } else {
            window.history.pushState({}, '', newPath);
        }
        // Only set the pathname part to the state for routing logic
        setPath(newPath.split('?')[0].split('#')[0]);
    }, [path]);

    useEffect(() => {
        const handlePopState = () => {
             setPath(window.location.pathname);
        };
        
        const handleInternalLinkClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            const anchor = target.closest('a');
            if (!anchor || !anchor.href || anchor.target === '_blank' || event.metaKey || event.ctrlKey) return;

            const destinationUrl = new URL(anchor.href, window.location.origin);
            if (destinationUrl.origin !== window.location.origin) return;

            event.preventDefault();
            
            const currentUrl = new URL(window.location.href);
            const isSamePage = currentUrl.pathname === destinationUrl.pathname && currentUrl.search === destinationUrl.search;
            const newPath = destinationUrl.pathname + destinationUrl.hash + destinationUrl.search;

            if (isSamePage && destinationUrl.hash) {
                 const targetElement = document.querySelector(destinationUrl.hash);
                 if (targetElement) {
                     targetElement.scrollIntoView({ behavior: 'smooth' });
                     if (destinationUrl.hash !== currentUrl.hash) {
                         // Update URL without re-triggering navigation logic for the page itself
                         window.history.pushState({}, '', newPath);
                     }
                 }
            } else if (!isSamePage || destinationUrl.hash) {
                navigate(newPath);
            }
            
            setIsMobileMenuOpen(false);
        };

        window.addEventListener('popstate', handlePopState);
        document.addEventListener('click', handleInternalLinkClick);
        return () => {
            window.removeEventListener('popstate', handlePopState);
            document.removeEventListener('click', handleInternalLinkClick);
        };
    }, [navigate]);

    useEffect(() => {
        const { hash } = window.location;
        if (hash) {
            const id = hash.slice(1);
            const timer = setTimeout(() => {
                const element = document.getElementById(id);
                if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
            return () => clearTimeout(timer);
        } else {
            window.scrollTo(0, 0);
        }
    }, [path]);

    useEffect(() => {
        document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isMobileMenuOpen]);

    const handleLoginSuccess = () => {
        sessionStorage.setItem('rago-admin', 'true');
        setIsAdmin(true);
        navigate('/admin');
    };

    const handleLogout = () => {
        sessionStorage.removeItem('rago-admin');
        setIsAdmin(false);
        navigate('/');
    };
    
    const pathname = path.split('?')[0].split('#')[0] || '/';
    const vehicleDetailMatch = pathname.match(/^\/vehiculo\/(.+)$/);
    const slug = vehicleDetailMatch ? vehicleDetailMatch[1].replace(/\/$/, '') : null;
    const vehicleIdStr = slug ? slug.split('-').pop() ?? null : null;
    const vehicleId = vehicleIdStr ? parseInt(vehicleIdStr, 10) : null;
    const isHomePage = pathname === '/' || pathname === '/index.html';
    const isAdminPage = pathname === '/admin';

    const selectedVehicle = useMemo(() => {
        if (!vehicleId || isNaN(vehicleId)) return null;
        return vehicles.find(v => v.id === vehicleId);
    }, [vehicleId, vehicles]);
    
    useEffect(() => {
        if (!selectedVehicle) return;

        const head = document.head;
        const originalTitle = document.title;
        const updateMetaContent = (selector: string, content: string) => { const el = head.querySelector(selector); if (el) el.setAttribute('content', content); };
        
        document.title = `${selectedVehicle.make} ${selectedVehicle.model} | Rago Automotores`;
        const vehicleImage = optimizeUrl(selectedVehicle.images[0], { w: 1200, h: 630, fit: 'cover', q: 80, output: 'jpeg' });
        const vehicleDesc = `Año ${selectedVehicle.year} - $${selectedVehicle.price.toLocaleString('es-AR')}. Mirá más detalles en Rago Automotores.`;

        updateMetaContent('meta[property="og:title"]', `${selectedVehicle.make} ${selectedVehicle.model}`);
        updateMetaContent('meta[property="og:description"]', vehicleDesc);
        updateMetaContent('meta[property="og:image"]', vehicleImage);
        updateMetaContent('meta[property="og:url"]', window.location.href);
        updateMetaContent('meta[property="og:type"]', 'product');
        updateMetaContent('meta[name="twitter:title"]', `${selectedVehicle.make} ${selectedVehicle.model}`);
        updateMetaContent('meta[name="twitter:description"]', vehicleDesc);
        updateMetaContent('meta[name="twitter:image"]', vehicleImage);

        return () => {
            document.title = originalTitle;
            updateMetaContent('meta[property="og:title"]', 'Rago Automotores - Catálogo de Vehículos');
            updateMetaContent('meta[property="og:description"]', 'Tu concesionaria de confianza para vehículos seleccionados. Calidad y transparencia en cada venta.');
            updateMetaContent('meta[property="og:image"]', 'https://i.imgur.com/zOGb0ay.jpeg');
            updateMetaContent('meta[property="og:url"]', window.location.origin);
            updateMetaContent('meta[property="og:type"]', 'website');
            updateMetaContent('meta[name="twitter:title"]', 'Rago Automotores - Catálogo de Vehículos');
            updateMetaContent('meta[name="twitter:description"]', 'Tu concesionaria de confianza para vehículos seleccionados. Calidad y transparencia en cada venta.');
            updateMetaContent('meta[name="twitter:image"]', 'https://i.imgur.com/zOGb0ay.jpeg');
        };
    }, [selectedVehicle]);

    const uniqueBrands = useMemo(() => Array.from(new Set(vehicles.map(v => v.make))).sort(), [vehicles]);

    const filteredVehicles = useMemo(() => {
        let tempVehicles = [...vehicles];
        const lowercasedTerm = searchTerm.toLowerCase().trim();
        if (lowercasedTerm) tempVehicles = tempVehicles.filter(v => `${v.make} ${v.model} ${v.year}`.toLowerCase().includes(lowercasedTerm));
        if (filters.make) tempVehicles = tempVehicles.filter(v => v.make === filters.make);
        if (filters.year) tempVehicles = tempVehicles.filter(v => v.year >= parseInt(filters.year, 10));
        if (filters.price) tempVehicles = tempVehicles.filter(v => v.price <= parseInt(filters.price, 10));
        return tempVehicles;
    }, [vehicles, searchTerm, filters]);

    const handleCloseModal = () => setModalState({ type: 'none' });
    const handleFilterChange = useCallback((newFilters: { make: string, year: string, price: string }) => setFilters(newFilters), []);

    const handleAddVehicleClick = () => setModalState({ type: 'form' });
    const handleEditVehicleClick = (vehicle: Vehicle) => setModalState({ type: 'form', vehicle });
    const handleDeleteVehicleClick = (vehicleId: number) => setModalState({ type: 'confirmDelete', vehicleId });
    const handleShowStatsClick = (vehicle: Vehicle) => setModalState({ type: 'vehicleStats', vehicle });

    const handleSaveVehicle = async (vehicleData: VehicleFormData) => {
        const isEdit = !!vehicleData.id;
        try {
            if (isEdit && vehicleData.id) {
                const { id, ...dataToUpdate } = vehicleData;
                const { error } = await supabase.from('vehicles').update(dataToUpdate).eq('id', id);
                if (error) throw error;
            } else {
                const { id, ...dataToInsert } = vehicleData;
                const { error } = await supabase.from('vehicles').insert([dataToInsert]);
                if (error) throw error;
            }
            await fetchAllData();
            handleCloseModal();
        } catch (err: any) {
            console.error("Error saving vehicle:", err);
            alert(`Error al guardar el vehículo: ${err.message}`);
        }
    };

    const confirmDelete = async () => {
        if (modalState.type === 'confirmDelete') {
            try {
                const { error } = await supabase.from('vehicles').delete().eq('id', modalState.vehicleId);
                if (error) throw error;
                await fetchAllData(); 
                handleCloseModal();
            } catch (err: any) {
                console.error("Error deleting vehicle:", err);
                alert(`Error al eliminar el vehículo: ${err.message}`);
            }
        }
    };
    
    const handleAnalyticsReset = () => fetchAllData();

    const NotFoundPage = () => (
        <div className="text-center py-16">
            <h1 className="text-4xl font-bold text-rago-burgundy mb-4">404 - Página No Encontrada</h1>
            <p className="text-xl text-slate-700 dark:text-slate-300">La página que buscas no existe o fue removida.</p>
            <a href="/" className="mt-8 inline-block px-6 py-3 text-lg font-semibold text-white bg-rago-burgundy rounded-lg hover:bg-rago-burgundy-darker transition-colors">Volver al Inicio</a>
        </div>
    );
    
    const renderMainContent = () => {
        if (pathname === '/login' && !isAdmin) return <LoginPage onLoginSuccess={handleLoginSuccess} />;
        if (isAdmin || isAdminPage) {
            if (!isAdmin) return <LoginPage onLoginSuccess={handleLoginSuccess} />;
            return <AdminPanel vehicles={vehicles} allEvents={analyticsEvents} onAdd={handleAddVehicleClick} onEdit={handleEditVehicleClick} onDelete={handleDeleteVehicleClick} onLogout={handleLogout} onAnalyticsReset={handleAnalyticsReset} onShowStats={handleShowStatsClick} />;
        }
        if (loading) return <div className="text-center py-16"><h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300">Cargando vehículos...</h2></div>;
        if (dbError) return <div className="text-center py-16 text-red-500"><h2 className="text-2xl font-semibold">{dbError}</h2></div>;
        if (vehicleId) return selectedVehicle ? <VehicleDetailPage vehicle={selectedVehicle} allVehicles={vehicles} /> : <NotFoundPage />;
        if (isHomePage) return (<><FilterBar filters={filters} onFilterChange={handleFilterChange} brands={uniqueBrands} /><VehicleList vehicles={filteredVehicles} /><SellYourCarSection /></>);
        return <NotFoundPage />;
    };
    
    const contactMessage = "Hola, estoy interesado en sus vehículos.";
    const whatsappLink = `https://wa.me/5492284635692?text=${encodeURIComponent(contactMessage)}`;
    const instagramUrl = "https://www.instagram.com/ragoautomotores?igsh=MWJuamF6ZXF5YjF4cw%3D%3D";

    const mainAppContainerClasses = `min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 font-sans transform-gpu origin-center relative transition-all duration-500 ease-in-out ${isMobileMenuOpen ? 'scale-[0.85] -translate-x-[70%] sm:-translate-x-64 rounded-3xl shadow-2xl overflow-y-hidden brightness-[0.7] blur-sm' : 'scale-100 translate-x-0 rounded-none shadow-none brightness-100 blur-0'}`;
    const hamburgerClasses = `md:hidden fixed top-6 right-6 z-[60] p-2 transition-colors duration-300 ${isMobileMenuOpen ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`;

    return (
        <div className="bg-slate-800 dark:bg-rago-black min-h-screen overflow-x-hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={hamburgerClasses} aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"} aria-controls="mobile-menu" aria-expanded={isMobileMenuOpen}>
                <div id="nav-icon3" className={isMobileMenuOpen ? 'open' : ''}><span></span><span></span><span></span><span></span></div>
            </button>
            <nav id="mobile-menu" aria-hidden={!isMobileMenuOpen} className={`fixed top-0 right-0 h-full w-[85%] max-w-sm bg-gradient-to-br from-slate-900 via-rago-burgundy-darker to-rago-black shadow-2xl p-6 pt-20 flex flex-col text-white transform-gpu transition-transform duration-500 ease-in-out z-50 md:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="px-6 mb-12 text-center"><a href="/"><img src="https://i.imgur.com/zOGb0ay.jpeg" alt="Rago Automotores Logo" className="h-20 inline-block" /></a></div>
                <ul className="flex flex-col gap-2">
                    <li><a href="/" className="flex items-center gap-4 px-3 py-4 text-2xl font-semibold text-slate-200 rounded-lg hover:bg-white/10 transition-colors"><HomeIcon className="h-7 w-7 text-rago-burgundy" /><span>Inicio</span></a></li>
                    <li><a href="/#catalog" className="flex items-center gap-4 px-3 py-4 text-2xl font-semibold text-slate-200 rounded-lg hover:bg-white/10 transition-colors"><CatalogIcon className="h-7 w-7 text-rago-burgundy" /><span>Catálogo</span></a></li>
                    <li><a href="/#sell-car-section" className="flex items-center gap-4 px-3 py-4 text-2xl font-semibold text-slate-200 rounded-lg hover:bg-white/10 transition-colors"><SellCarIcon className="h-7 w-7 text-rago-burgundy" /><span>Vender mi Auto</span></a></li>
                </ul>
                <div className="mt-auto pt-8 border-t border-slate-700/50">
                    <div className="flex justify-center gap-x-8">
                        <a href={instagramUrl} onClick={() => trackEvent('click_instagram')} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-slate-400 hover:text-white transition-transform duration-300 hover:scale-110"><InstagramIcon className="h-8 w-8" /></a>
                        <a href={whatsappLink} onClick={() => trackEvent('click_whatsapp_general')} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="text-slate-400 hover:text-white transition-transform duration-300 hover:scale-110"><ChatBubbleIcon className="h-8 w-8" /></a>
                    </div>
                </div>
            </nav>
            <div className={mainAppContainerClasses}>
                {isMobileMenuOpen && <div role="button" aria-label="Cerrar menú" className="absolute inset-0 z-50" onClick={() => setIsMobileMenuOpen(false)}></div>}
                <Header />
                {!isAdmin && isHomePage && <Hero searchTerm={searchTerm} onSearchChange={setSearchTerm} />}
                <main id="catalog" className="container mx-auto px-4 md:px-6 py-8 flex-grow">
                     <div key={path} className="animate-fade-in">{renderMainContent()}</div>
                </main>
                <Footer />
            </div>
            {modalState.type === 'form' && <VehicleFormModal isOpen={true} onClose={handleCloseModal} onSubmit={handleSaveVehicle} initialData={modalState.vehicle} brands={uniqueBrands} />}
            {modalState.type === 'confirmDelete' && <ConfirmationModal isOpen={true} onClose={handleCloseModal} onConfirm={confirmDelete} title="Confirmar Eliminación" message="¿Estás seguro de que quieres eliminar este vehículo? Esta acción no se puede deshacer." />}
            {modalState.type === 'vehicleStats' && <VehicleStatsModal vehicle={modalState.vehicle} allEvents={analyticsEvents} onClose={handleCloseModal} />}
            {isHomePage && <ScrollToTopButton />}
        </div>
    );
};

export default App;
