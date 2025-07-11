

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
            className={`relative bg-white dark:bg-slate-900 rounded-xl flex flex-col transition-all duration-300 ease-out shadow-subtle dark:shadow-subtle-dark border border-slate-200 dark:border-slate-800 ${vehicle.is_sold ? '' : 'hover:shadow-rago-lg dark:hover:shadow-rago-glow hover:border-rago-burgundy/20 hover:-translate-y-1.5'} group`}
        >
             {vehicle.is_sold && (
                <div className="absolute inset-0 bg-white/20 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-20 rounded-xl pointer-events-none">
                    <img src="https://res.cloudinary.com/dbq5jp6jn/image/upload/v1752208124/toppng.com-vendido-carimbo-la-96-nike-missile-site-432x152_1_ybxv6w.png" alt="Vendido" className="w-3/4 opacity-90 transform -rotate-[15deg] drop-shadow-lg" />
                </div>
            )}
            {vehicle.is_featured && !vehicle.is_sold && (
                <div className="absolute top-3 left-3 bg-rago-burgundy text-white text-sm font-extrabold px-4 py-2 rounded-lg z-10 shadow-lg flex items-center gap-2 transition-transform duration-300 group-hover:scale-105">
                    <StarIcon className="h-4 w-4" filled={true} />
                    <span className="tracking-wide">DESTACADO</span>
                </div>
            )}
            <a href={vehicle.is_sold ? undefined : vehicleUrl} className={`block aspect-[4/3] overflow-hidden rounded-t-xl ${vehicle.is_sold ? 'pointer-events-none' : ''}`}>
                <div 
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${placeholderUrl})` }}
                >
                    <img 
                        className={`w-full h-full object-cover transition-all duration-500 ${!vehicle.is_sold && 'group-hover:scale-105'} ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
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
            <div className={`p-5 flex flex-col flex-grow ${vehicle.is_sold ? 'opacity-60' : ''}`}>
                <div className="flex items-baseline justify-between gap-x-3">
                     <a href={vehicle.is_sold ? undefined : vehicleUrl} className={`min-w-0 ${vehicle.is_sold ? 'pointer-events-none' : ''}`}>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate group-hover:text-rago-burgundy transition-colors">{vehicle.make} {vehicle.model}</h3>
                    </a>
                    <span className="text-sm font-semibold inline-block py-1 px-3 uppercase rounded-full text-rago-burgundy bg-rago-burgundy/10 dark:bg-slate-700/50 dark:text-slate-300 flex-shrink-0">
                        {vehicle.year}
                    </span>
                </div>
                
                <div className="flex-grow my-4">
                    <p className="text-2xl lg:text-3xl font-black text-rago-burgundy">
                        ${vehicle.price.toLocaleString('es-AR')}
                    </p>
                </div>
                <div className="flex justify-between items-center text-base text-slate-600 dark:text-slate-400">
                    <span>{vehicle.mileage.toLocaleString('es-AR')} km</span>
                    <span>{vehicle.transmission}</span>
                </div>
                 <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-700/50">
                    {vehicle.is_sold ? (
                        <div className="flex w-full items-center justify-center rounded-lg bg-slate-400 dark:bg-slate-700 px-4 py-3 text-center text-lg font-semibold text-white cursor-not-allowed">
                            Vendido
                        </div>
                    ) : (
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
                    )}
                </div>
            </div>
        </div>
    );
};

export default VehicleCard;