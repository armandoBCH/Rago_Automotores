
import React from 'react';
import { Vehicle } from '../types';
import { optimizeUrl, slugify } from '../utils/image';
import { ArrowLeftIcon, ArrowRightIcon } from '../constants';

const FeaturedVehicleCard: React.FC<{ vehicle: Vehicle }> = ({ vehicle }) => {
    const vehicleUrl = `/vehiculo/${slugify(`${vehicle.make} ${vehicle.model}`)}-${vehicle.id}`;
    const isNew = vehicle.mileage < 1000;

    return (
        <a href={vehicleUrl} className="block bg-white dark:bg-slate-900 rounded-2xl overflow-hidden group transition-all duration-300 ease-out shadow-subtle hover:shadow-rago-lg hover:-translate-y-2">
            <div className="aspect-[4/3] overflow-hidden">
                <img
                    src={optimizeUrl(vehicle.images[0], { w: 400, h: 300, fit: 'cover', output: 'webp' })}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                    loading="lazy"
                />
            </div>
            <div className="p-5 text-center">
                <p className="font-bold text-lg text-rago-burgundy mb-1">
                    {isNew ? 'OKM' : vehicle.make}
                </p>
                <h3 className="text-xl font-extrabold text-slate-800 dark:text-white truncate">
                    {isNew ? vehicle.make : vehicle.model} {isNew && vehicle.model}
                </h3>
                <p className="text-base text-slate-500 dark:text-slate-400 mt-1 truncate">
                    {vehicle.year} &middot; {vehicle.mileage.toLocaleString('es-AR')} km
                </p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-3">
                    ${vehicle.price.toLocaleString('es-AR')}
                </p>
            </div>
        </a>
    );
}

const FeaturedVehiclesSection: React.FC<{ vehicles: Vehicle[] }> = ({ vehicles }) => {
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    const featuredVehicles = React.useMemo(() => {
        return vehicles.filter(v => v.is_featured);
    }, [vehicles]);

    if (featuredVehicles.length === 0) {
        return null;
    }
    
    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    return (
        <section className="bg-slate-100 dark:bg-slate-900/50 py-16">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white text-center md:text-left">
                        Nuestros <span className="text-rago-burgundy">Destacados</span>
                    </h2>
                    <div className="hidden md:flex gap-3 mt-4 md:mt-0">
                        <button onClick={() => scroll('left')} aria-label="Desplazar a la izquierda" className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 shadow-md hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"><ArrowLeftIcon className="h-6 w-6" /></button>
                        <button onClick={() => scroll('right')} aria-label="Desplazar a la derecha" className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 shadow-md hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"><ArrowRightIcon className="h-6 w-6" /></button>
                    </div>
                </div>
                 <div ref={scrollContainerRef} className="flex gap-6 overflow-x-auto pb-6 -mx-4 px-4 md:-mx-6 md:px-6 hide-scrollbar">
                    {featuredVehicles.map((vehicle) => (
                        <div key={vehicle.id} className="flex-shrink-0 w-[80%] sm:w-[45%] md:w-[38%] lg:w-[28%] xl:w-[23%]">
                            <FeaturedVehicleCard vehicle={vehicle} />
                        </div>
                    ))}
                </div>
            </div>
            <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { scrollbar-width: none; }`}</style>
        </section>
    );
};

export default FeaturedVehiclesSection;
