
import React, { useMemo, useEffect, useRef } from 'react';
import { Vehicle } from '../types';
import ImageCarousel from './ImageCarousel';
import VehicleCard from './VehicleCard';
import SocialShareButtons from './SocialShareButtons';
import DescriptionCard from './DescriptionCard';
import { ShieldIcon, TagIcon, CalendarIcon, GaugeIcon, CogIcon, SlidersIcon, GasPumpIcon, ChatBubbleIcon, ArrowRightIcon, ArrowLeftIcon } from '../constants';
import { trackEvent } from '../lib/analytics';

interface VehicleDetailPageProps {
    vehicle: Vehicle;
    allVehicles: Vehicle[];
}

const SpecificationItem: React.FC<{ icon: React.ReactNode; label: string; value: string | number; }> = ({ icon, label, value }) => (
    <div className="flex items-center justify-between py-4">
        <div className="flex items-center">
            <div className="flex-shrink-0 w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mr-4">
               <span className="text-rago-burgundy">{icon}</span>
            </div>
            <div>
                <p className="text-base text-gray-500 dark:text-gray-400">{label}</p>
                <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{value}</p>
            </div>
        </div>
    </div>
);

const Breadcrumb: React.FC<{ vehicle: Vehicle }> = ({ vehicle }) => (
    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl py-3 px-5 border border-slate-200 dark:border-slate-800 shadow-sm">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-base font-medium text-slate-500 dark:text-slate-400 flex-wrap">
            <a href="/" className="hover:text-rago-burgundy transition-colors">Inicio</a>
            <ArrowRightIcon className="h-4 w-4 text-slate-400" />
            <a href="/#catalog" className="hover:text-rago-burgundy transition-colors">Catálogo</a>
            <ArrowRightIcon className="h-4 w-4 text-slate-400" />
            <span className="text-slate-800 dark:text-slate-200 font-bold truncate max-w-xs">{vehicle.make} {vehicle.model}</span>
        </nav>
    </div>
);

const VehicleDetailPage: React.FC<VehicleDetailPageProps> = ({ vehicle, allVehicles }) => {
    const similarVehiclesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        trackEvent('view_vehicle', vehicle.id);
    }, [vehicle.id]);

    const handleWhatsAppClick = () => {
        trackEvent('click_whatsapp', vehicle.id);
    };

    const contactMessage = `Hola, estoy interesado en el ${vehicle.make} ${vehicle.model}.`;
    const whatsappLink = `https://wa.me/5492284635692?text=${encodeURIComponent(contactMessage)}`;

    const specs = [
        { icon: <ShieldIcon className="h-6 w-6"/>, label: "Marca", value: vehicle.make },
        { icon: <TagIcon className="h-6 w-6"/>, label: "Modelo", value: vehicle.model },
        { icon: <CalendarIcon className="h-6 w-6"/>, label: "Año", value: vehicle.year },
        { icon: <GaugeIcon className="h-6 w-6"/>, label: "Kilometraje", value: `${vehicle.mileage.toLocaleString('es-AR')} km` },
        { icon: <CogIcon className="h-6 w-6"/>, label: "Motor", value: vehicle.engine },
        { icon: <SlidersIcon className="h-6 w-6"/>, label: "Transmisión", value: vehicle.transmission },
        { icon: <GasPumpIcon className="h-6 w-6"/>, label: "Combustible", value: vehicle.fuelType },
    ];
    
    const relatedVehicles = useMemo(() => {
        if (!allVehicles || allVehicles.length <= 1) return [];

        const availableVehicles = allVehicles.filter(v => !v.is_sold);

        const priceRangeVehicles = availableVehicles.filter(v => {
            if (v.id === vehicle.id) return false;
            if (vehicle.price === 0) return false;
            const priceDiff = Math.abs(v.price - vehicle.price) / vehicle.price;
            return priceDiff <= 0.25;
        });

        const sameMake = availableVehicles.filter(v => v.id !== vehicle.id && v.make === vehicle.make);
        
        const combined = [...priceRangeVehicles, ...sameMake];
        const uniqueIds = new Set();
        const uniqueVehicles = combined.filter(v => {
            if (uniqueIds.has(v.id)) {
                return false;
            }
            uniqueIds.add(v.id);
            return true;
        });

        return uniqueVehicles.slice(0, 8); // Get more for carousel
    }, [vehicle, allVehicles]);
    
    const scrollSimilar = (direction: 'left' | 'right') => {
        if (similarVehiclesRef.current) {
            const scrollAmount = similarVehiclesRef.current.clientWidth * 0.8;
            similarVehiclesRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    return (
        <div className="max-w-screen-xl mx-auto">
            <div className="mb-8">
                <Breadcrumb vehicle={vehicle} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 lg:gap-x-12">
                
                {/* --- Left Column: Image & Description --- */}
                <div className="lg:col-span-3 flex flex-col gap-y-8 order-1">
                    {/* Image Carousel */}
                    <div className="opacity-0 animate-fade-in-up">
                        <div className="-mx-4 md:-mx-6 lg:mx-0">
                            <div className="relative lg:rounded-2xl lg:overflow-hidden lg:shadow-rago-lg aspect-[4/3] bg-gray-200 dark:bg-black">
                                <ImageCarousel images={vehicle.images} />
                                 {vehicle.is_sold && (
                                    <div className="absolute inset-0 bg-white/10 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center z-20 pointer-events-none lg:rounded-2xl">
                                        <img src="https://res.cloudinary.com/dbq5jp6jn/image/upload/v1752208124/toppng.com-vendido-carimbo-la-96-nike-missile-site-432x152_1_ybxv6w.png" alt="Vendido" className="w-2/3 md:w-1/2 opacity-90 transform -rotate-[15deg] drop-shadow-lg" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Description (Mobile: will appear after right col because of flex order) */}
                    <div className="order-3 lg:order-2 opacity-0 animate-fade-in-up" style={{ animationDelay: '250ms' }}>
                        <DescriptionCard description={vehicle.description} />
                    </div>
                </div>

                {/* --- Right Column: Price & Specs (Sticky) --- */}
                <div className="lg:col-span-2 mt-8 lg:mt-0 order-2 lg:order-3">
                    <div className="lg:sticky lg:top-28 flex flex-col gap-y-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                        {/* Main Info Card */}
                        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-6 shadow-subtle dark:shadow-subtle-dark">
                            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 border-b dark:border-gray-700 pb-4 mb-6">
                                <h1 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                                    {vehicle.make} {vehicle.model}
                                </h1>
                                <span className="text-xl font-bold inline-block align-baseline py-1 px-4 rounded-full text-rago-burgundy bg-rago-burgundy/10 dark:text-white dark:bg-rago-burgundy">
                                    {vehicle.year}
                                </span>
                            </div>
                            <div className="mb-6">
                                <p className="text-[2.1rem] leading-tight sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-rago-burgundy">
                                    ${vehicle.price.toLocaleString('es-AR')}
                                </p>
                            </div>
                            {vehicle.is_sold ? (
                                <div className="group w-full flex items-center justify-center gap-3 text-center bg-slate-400 dark:bg-slate-700 text-white font-bold py-4 px-4 rounded-lg text-xl cursor-not-allowed">
                                    Vehículo Vendido
                                </div>
                            ) : (
                                <a
                                    href={whatsappLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={handleWhatsAppClick}
                                    className="group w-full flex items-center justify-center gap-3 text-center bg-gradient-to-r from-rago-burgundy to-rago-burgundy-darker hover:shadow-rago-glow text-white font-bold py-4 px-4 rounded-lg transition-all duration-300 text-xl transform hover:-translate-y-0.5 animate-pulse-burgundy"
                                >
                                    <ChatBubbleIcon className="h-7 w-7 transition-transform duration-300 group-hover:scale-110" />
                                    <span>Contactar por WhatsApp</span>
                                </a>
                            )}
                            <SocialShareButtons vehicle={vehicle} />
                        </div>
                        
                        {/* Specifications Card */}
                        <section>
                            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-subtle dark:shadow-subtle-dark overflow-hidden border border-gray-200 dark:border-gray-800">
                                <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4">
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Especificaciones</h3>
                                </div>
                                <div className="p-6 divide-y divide-gray-200 dark:divide-gray-800">
                                    {specs.map(spec => (
                                        <SpecificationItem key={spec.label} icon={spec.icon} label={spec.label} value={spec.value} />
                                    ))}
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            {/* Related Vehicles Section */}
            {relatedVehicles.length > 0 && (
                <section className="mt-16 lg:mt-24 bg-white dark:bg-rago-black border-y border-slate-200 dark:border-slate-800/50">
                    <div className="max-w-screen-xl mx-auto py-20 lg:py-24 px-4 md:px-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                        <div className="relative">
                            <div className="text-center mb-12">
                                <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white">
                                    También te podría interesar
                                </h2>
                                <p className="mt-4 text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                                    Explora otros vehículos en nuestro inventario que se ajustan a tus intereses.
                                </p>
                            </div>
                
                            <div ref={similarVehiclesRef} className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar -mx-4 px-4 md:-mx-6 md:px-6">
                                {relatedVehicles.map((relatedVehicle, index) => (
                                    <div key={relatedVehicle.id} className="flex-shrink-0 w-[85%] sm:w-[45%] md:w-1/3 lg:w-1/4 stagger-child" style={{ animationDelay: `${index * 80}ms` }}>
                                        <VehicleCard vehicle={relatedVehicle} />
                                    </div>
                                ))}
                            </div>
                
                            {relatedVehicles.length > 4 && (
                                <>
                                    <button onClick={() => scrollSimilar('left')} aria-label="Anterior" className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-14 h-14 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-full shadow-lg hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-white transition-all duration-300 transform hover:scale-105">
                                        <ArrowLeftIcon className="h-7 w-7" />
                                    </button>
                                    <button onClick={() => scrollSimilar('right')} aria-label="Siguiente" className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-14 h-14 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-full shadow-lg hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-white transition-all duration-300 transform hover:scale-105">
                                        <ArrowRightIcon className="h-7 w-7" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { scrollbar-width: none; }`}</style>
                </section>
            )}
        </div>
    );
};

export default VehicleDetailPage;
