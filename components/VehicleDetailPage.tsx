import React, { useMemo, useEffect } from 'react';
import { Vehicle } from '../types';
import ImageCarousel from './ImageCarousel';
import VehicleCard from './VehicleCard';
import SocialShareButtons from './SocialShareButtons';
import DescriptionCard from './DescriptionCard';
import { ShieldIcon, TagIcon, CalendarIcon, GaugeIcon, CogIcon, SlidersIcon, GasPumpIcon, ChatBubbleIcon, ArrowRightIcon } from '../constants';
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

        const priceRangeVehicles = allVehicles.filter(v => {
            if (v.id === vehicle.id) return false;
            if (vehicle.price === 0) return false;
            const priceDiff = Math.abs(v.price - vehicle.price) / vehicle.price;
            return priceDiff <= 0.25;
        });

        const sameMake = allVehicles.filter(v => v.id !== vehicle.id && v.make === vehicle.make);
        
        const combined = [...priceRangeVehicles, ...sameMake];
        const uniqueIds = new Set();
        const uniqueVehicles = combined.filter(v => {
            if (uniqueIds.has(v.id)) {
                return false;
            }
            uniqueIds.add(v.id);
            return true;
        });

        return uniqueVehicles.slice(0, 4);
    }, [vehicle, allVehicles]);

    return (
        <div className="max-w-screen-xl mx-auto">
            <div className="mb-8">
                <Breadcrumb vehicle={vehicle} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 lg:gap-x-12">
                {/* --- Left Column --- */}
                <div className="lg:col-span-3 space-y-8">
                    {/* Image Carousel */}
                     <div className="opacity-0 animate-fade-in-up">
                        <div className="-mx-4 md:-mx-6 lg:mx-0">
                            <div className="lg:rounded-2xl lg:overflow-hidden lg:shadow-rago-lg aspect-[4/3] bg-gray-200 dark:bg-black">
                                <ImageCarousel images={vehicle.images} />
                            </div>
                        </div>
                    </div>
                    {/* Description Card */}
                    <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '250ms' }}>
                        <DescriptionCard description={vehicle.description} />
                    </div>
                </div>

                {/* --- Right Column (Sticky) --- */}
                <div className="lg:col-span-2 mt-8 lg:mt-0">
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
                                <p className="text-5xl md:text-6xl font-extrabold text-rago-burgundy break-words">
                                    ${vehicle.price.toLocaleString('es-AR')}
                                </p>
                            </div>
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
                <section className="mt-16 lg:mt-20 pt-16 border-t border-slate-200 dark:border-slate-800 opacity-0 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                    <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 dark:text-white text-center mb-10">
                        Vehículos Similares
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {relatedVehicles.map((relatedVehicle, index) => (
                            <div key={relatedVehicle.id} className="stagger-child" style={{ animationDelay: `${index * 80}ms` }}>
                                <VehicleCard vehicle={relatedVehicle} />
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default VehicleDetailPage;