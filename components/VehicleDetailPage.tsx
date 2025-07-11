

import React, { useMemo, useEffect, useRef } from 'react';
import { Vehicle } from '../types';
import ImageCarousel from './ImageCarousel';
import VehicleCard from './VehicleCard';
import SocialShareButtons from './SocialShareButtons';
import DescriptionCard from './DescriptionCard';
import { ShieldIcon, TagIcon, CalendarIcon, GaugeIcon, CogIcon, SlidersIcon, GasPumpIcon, ChatBubbleIcon, ArrowRightIcon, ArrowLeftIcon } from '../constants';
import { trackEvent } from '../lib/analytics';
import { optimizeUrl, slugify } from '../utils/image';

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
    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl py-3 px-5 border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-base font-medium text-slate-500 dark:text-slate-400 flex-wrap">
            <a href="/" className="hover:text-rago-burgundy transition-colors">Inicio</a>
            <ArrowRightIcon className="h-4 w-4 text-slate-400" />
            <a href="/#catalog" className="hover:text-rago-burgundy transition-colors">Catálogo</a>
            <ArrowRightIcon className="h-4 w-4 text-slate-400" />
            <span className="text-slate-800 dark:text-slate-200 font-bold truncate max-w-xs">{vehicle.make} {vehicle.model}</span>
        </nav>
    </div>
);

const PriceCard: React.FC<{ vehicle: Vehicle, whatsappLink: string, onWhatsAppClick: () => void }> = ({ vehicle, whatsappLink, onWhatsAppClick }) => (
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
                onClick={onWhatsAppClick}
                className="group w-full flex items-center justify-center gap-3 text-center bg-gradient-to-r from-rago-burgundy to-rago-burgundy-darker hover:shadow-rago-glow text-white font-bold py-4 px-4 rounded-lg transition-all duration-300 text-xl transform hover:-translate-y-0.5 animate-pulse-burgundy"
            >
                <ChatBubbleIcon className="h-7 w-7 transition-transform duration-300 group-hover:scale-110" />
                <span>Contactar por WhatsApp</span>
            </a>
        )}
        <SocialShareButtons vehicle={vehicle} />
    </div>
);

const SpecsCard: React.FC<{ specs: { icon: JSX.Element; label: string; value: string | number }[] }> = ({ specs }) => (
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
);


const VehicleDetailPage: React.FC<VehicleDetailPageProps> = ({ vehicle, allVehicles }) => {
    const similarVehiclesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        trackEvent('view_vehicle', vehicle.id);
        
        // Add Vehicle JSON-LD structured data
        const schema = {
            '@context': 'https://schema.org',
            '@type': 'Vehicle',
            'name': `${vehicle.make} ${vehicle.model} ${vehicle.year}`,
            'url': window.location.href,
            'image': vehicle.images.map(img => optimizeUrl(img, { w: 1200, h: 800, fit: 'cover' })),
            'description': vehicle.description,
            'brand': {
                '@type': 'Brand',
                'name': vehicle.make
            },
            'model': vehicle.model,
            'vehicleModelDate': String(vehicle.year),
            'mileageFromOdometer': {
                '@type': 'QuantitativeValue',
                'value': vehicle.mileage,
                'unitCode': 'KMT'
            },
            'fuelType': vehicle.fuelType,
            'vehicleEngine': {
                '@type': 'EngineSpecification',
                'name': vehicle.engine
            },
            'vehicleTransmission': vehicle.transmission,
            'offers': {
                '@type': 'Offer',
                'price': vehicle.price,
                'priceCurrency': 'ARS',
                'availability': vehicle.is_sold ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
                'seller': {
                    '@type': 'AutoDealer',
                    'name': 'Rago Automotores',
                    'url': window.location.origin
                }
            }
        };

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = 'vehicle-json-ld';
        script.innerHTML = JSON.stringify(schema);

        const existingScript = document.getElementById('vehicle-json-ld');
        if (existingScript) {
            existingScript.remove();
        }
        document.head.appendChild(script);

        return () => {
            document.getElementById('vehicle-json-ld')?.remove();
        };

    }, [vehicle]);

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

        return uniqueVehicles.slice(0, 8);
    }, [vehicle, allVehicles]);

    const scrollSimilarVehicles = (direction: 'left' | 'right') => {
        if (similarVehiclesRef.current) {
            const scrollAmount = similarVehiclesRef.current.clientWidth * 0.9;
            similarVehiclesRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    return (
        <div className="max-w-screen-xl mx-auto">
            <div className="opacity-0 animate-fade-in-up">
                <Breadcrumb vehicle={vehicle} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 lg:gap-x-12">
                
                {/* --- Left Column: Image & Description --- */}
                <div className="lg:col-span-3 flex flex-col gap-y-8">
                    {/* Image Carousel */}
                    <div className="opacity-0 animate-fade-in-up">
                        <div className="-mx-4 md:-mx-6 lg:mx-0">
                            <div className="relative overflow-hidden lg:rounded-2xl lg:shadow-rago-lg aspect-[4/3] bg-gray-200 dark:bg-black">
                                <ImageCarousel images={vehicle.images} />
                                {vehicle.is_sold && (
                                    <div className="absolute top-0 left-0 w-64 h-64 overflow-hidden z-20 pointer-events-none">
                                        <div 
                                            className="absolute transform -rotate-45 bg-gradient-to-br from-red-600 to-red-700 text-center text-white font-black uppercase tracking-widest shadow-2xl" 
                                            style={{ width: '350px', left: '-80px', top: '80px', padding: '12px 0', fontSize: '2rem' }}
                                        >
                                            Vendido
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Content for Mobile */}
                    <div className="lg:hidden space-y-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                        <PriceCard vehicle={vehicle} whatsappLink={whatsappLink} onWhatsAppClick={handleWhatsAppClick} />
                        <SpecsCard specs={specs} />
                        <DescriptionCard description={vehicle.description} />
                    </div>
                    
                    {/* Description for Desktop */}
                    <div className="hidden lg:block opacity-0 animate-fade-in-up" style={{ animationDelay: '250ms' }}>
                        <DescriptionCard description={vehicle.description} />
                    </div>
                </div>

                {/* --- Right Column (Sticky on Desktop) --- */}
                <div className="hidden lg:block lg:col-span-2">
                    <div className="lg:sticky lg:top-28 space-y-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                        <PriceCard vehicle={vehicle} whatsappLink={whatsappLink} onWhatsAppClick={handleWhatsAppClick} />
                        <SpecsCard specs={specs} />
                    </div>
                </div>
            </div>

            {/* Similar Vehicles Section */}
            {relatedVehicles.length > 0 && (
                <section className="mt-12 lg:mt-16">
                     <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 shadow-xl border border-slate-200 dark:border-slate-800">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white">
                                Vehículos similares
                            </h2>
                        </div>
            
                        <div ref={similarVehiclesRef} className="flex gap-6 -m-4 p-4 overflow-x-auto pb-6 hide-scrollbar">
                            {relatedVehicles.map((relatedVehicle, index) => (
                                <div key={relatedVehicle.id} className="flex-shrink-0 w-[85%] sm:w-[45%] md:w-[40%] lg:w-[30%] xl:w-1/4 stagger-child" style={{ animationDelay: `${index * 80}ms` }}>
                                    <VehicleCard vehicle={relatedVehicle} />
                                </div>
                            ))}
                        </div>

                        {relatedVehicles.length > 3 && (
                            <>
                                <button 
                                    onClick={() => scrollSimilarVehicles('left')} 
                                    aria-label="Desplazar a la izquierda" 
                                    className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-14 h-14 bg-white/30 dark:bg-black/30 backdrop-blur-lg rounded-full border border-white/20 dark:border-white/10 text-slate-800 dark:text-white hover:bg-white/50 dark:hover:bg-black/50 hover:border-white/30 transition-all duration-300 transform hover:scale-105 shadow-lg"
                                >
                                    <ArrowLeftIcon className="h-7 w-7" />
                                </button>
                                <button 
                                    onClick={() => scrollSimilarVehicles('right')} 
                                    aria-label="Desplazar a la derecha" 
                                    className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-14 h-14 bg-white/30 dark:bg-black/30 backdrop-blur-lg rounded-full border border-white/20 dark:border-white/10 text-slate-800 dark:text-white hover:bg-white/50 dark:hover:bg-black/50 hover:border-white/30 transition-all duration-300 transform hover:scale-105 shadow-lg"
                                >
                                    <ArrowRightIcon className="h-7 w-7" />
                                </button>
                            </>
                        )}
                    </div>
                    <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
                </section>
            )}
        </div>
    );
};

export default VehicleDetailPage;