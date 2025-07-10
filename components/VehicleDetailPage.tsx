
import React from 'react';
import { Vehicle } from '../types';
import ImageCarousel from './ImageCarousel';
import { ShieldIcon, TagIcon, CalendarIcon, GaugeIcon, CogIcon, SlidersIcon, GasPumpIcon, ChatBubbleIcon, ArrowRightIcon } from '../constants';

interface VehicleDetailPageProps {
    vehicle: Vehicle;
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
    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl py-3 px-5 mb-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-base font-medium text-slate-500 dark:text-slate-400 flex-wrap">
            <a href="/" className="hover:text-rago-burgundy transition-colors">Inicio</a>
            <ArrowRightIcon className="h-4 w-4 text-slate-400" />
            <a href="/#catalog" className="hover:text-rago-burgundy transition-colors">Catálogo</a>
            <ArrowRightIcon className="h-4 w-4 text-slate-400" />
            <span className="text-slate-800 dark:text-slate-200 font-bold">{vehicle.make} {vehicle.model}</span>
        </nav>
    </div>
);

const VehicleDetailPage: React.FC<VehicleDetailPageProps> = ({ vehicle }) => {
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

    return (
        <div className="max-w-screen-xl mx-auto">
            <Breadcrumb vehicle={vehicle} />
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-y-8 lg:gap-x-12">
                
                {/* Image Carousel (Item 1 in mobile, Left column on desktop) */}
                <div className="lg:col-span-3 opacity-0 animate-fade-in-up">
                    <div className="-mx-4 md:-mx-6 lg:mx-0">
                        <div className="lg:rounded-2xl lg:overflow-hidden lg:shadow-rago-lg aspect-[4/3] bg-gray-200 dark:bg-black">
                            <ImageCarousel images={vehicle.images} />
                        </div>
                    </div>
                </div>

                {/* Right Column: Sticky Info (Items 2 & 3 in mobile, Right column on desktop) */}
                <div className="lg:col-span-2 lg:row-span-2 opacity-0 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                    <div className="lg:sticky lg:top-28 flex flex-col gap-y-8">
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
                                className="group w-full flex items-center justify-center gap-3 text-center bg-gradient-to-r from-rago-burgundy to-rago-burgundy-darker hover:shadow-rago-glow text-white font-bold py-4 px-4 rounded-lg transition-all duration-300 text-xl transform hover:-translate-y-0.5 animate-pulse-burgundy"
                            >
                                <ChatBubbleIcon className="h-7 w-7 transition-transform duration-300 group-hover:scale-110" />
                                <span>Contactar por WhatsApp</span>
                            </a>
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
                
                {/* Description (Item 4 in mobile, Left column below image on desktop) */}
                <div className="lg:col-span-3 opacity-0 animate-fade-in-up" style={{ animationDelay: '250ms' }}>
                    <section>
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-subtle dark:shadow-subtle-dark overflow-hidden border border-gray-200 dark:border-gray-800">
                            <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Descripción</h3>
                            </div>
                            <div className="p-6">
                                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{vehicle.description}</p>
                            </div>
                        </div>
                    </section>
                </div>

            </div>
        </div>
    );
};

export default VehicleDetailPage;
