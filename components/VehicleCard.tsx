

import React, { useState } from 'react';
import { Vehicle } from '../types';
import { optimizeUrl, slugify } from '../utils/image';
import { ArrowRightIcon, StarIcon } from '../constants';

interface VehicleCardProps {
    vehicle: Vehicle;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const imageSrc = vehicle.images?.[0] || '';

    const placeholderUrl = optimizeUrl(imageSrc, { w: 20, h: 15, fit: 'cover', blur: 2, output: 'webp' });
    const srcSet = [400, 600, 800, 1200]
        .map(w => `${optimizeUrl(imageSrc, { w, h: Math.round(w * 0.75), fit: 'cover', output: 'webp', q: 75 })} ${w}w`)
        .join(', ');
        
    const vehicleUrl = `/vehiculo/${slugify(`${vehicle.make} ${vehicle.model}`)}-${vehicle.id}`;

    return (
        <div 
            className="relative bg-white dark:bg-slate-900 rounded-xl overflow-hidden flex flex-col transition-all duration-300 ease-out shadow-subtle dark:shadow-subtle-dark border border-slate-200 dark:border-slate-800 hover:shadow-rago-lg dark:hover:shadow-rago-glow hover:border-rago-burgundy/20 hover:-translate-y-1.5 group"
        >
            {vehicle.is_featured && (
                <div className="absolute top-0 left-0 bg-rago-burgundy text-white text-xs font-bold px-3 py-1 rounded-br-lg z-10 shadow-md flex items-center gap-1">
                    <StarIcon className="h-3 w-3" filled={true} />
                    <span>Destacado</span>
                </div>
            )}
            <a href={vehicleUrl} className="block aspect-[4/3] overflow-hidden">
                <div 
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${placeholderUrl})` }}
                >
                    <img 
                        className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                        src={optimizeUrl(imageSrc, { w: 800, h: 600, fit: 'cover', output: 'webp', q: 75 })}
                        srcSet={srcSet}
                        sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw"
                        alt={`${vehicle.make} ${vehicle.model}`} 
                        loading="lazy"
                        decoding="async"
                        onLoad={() => setIsLoaded(true)}
                    />
                </div>
            </a>
            <div className="p-5 flex flex-col flex-grow">
                <div className="flex items-baseline justify-between gap-x-3">
                     <a href={vehicleUrl} className="min-w-0">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate group-hover:text-rago-burgundy transition-colors">{vehicle.make} {vehicle.model}</h3>
                    </a>
                    <span className="text-sm font-semibold inline-block py-1 px-3 uppercase rounded-full text-rago-burgundy bg-rago-burgundy/10 dark:bg-slate-700/50 dark:text-slate-300 flex-shrink-0">
                        {vehicle.year}
                    </span>
                </div>
                
                <div className="flex-grow my-4">
                    <p className="text-3xl font-black text-rago-burgundy break-words">
                        ${vehicle.price.toLocaleString('es-AR')}
                    </p>
                </div>
                <div className="flex justify-between items-center text-base text-slate-600 dark:text-slate-400">
                    <span>{vehicle.mileage.toLocaleString('es-AR')} km</span>
                    <span>{vehicle.transmission}</span>
                </div>
                 <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-700/50">
                    <a 
                        href={vehicleUrl}
                        className="group flex w-full items-center justify-center gap-x-2 overflow-hidden rounded-lg bg-rago-burgundy px-4 py-3 text-center text-lg font-semibold text-white transition-all duration-300 hover:bg-rago-burgundy-darker focus:outline-none focus:ring-4 focus:ring-rago-burgundy/50"
                    >
                        <span className="transition-transform duration-300 ease-out group-hover:-translate-x-2">
                            Ver detalles
                        </span>
                        <div className="transform-gpu opacity-0 -translate-x-4 transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-100">
                            <ArrowRightIcon className="h-5 w-5" />
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default VehicleCard;