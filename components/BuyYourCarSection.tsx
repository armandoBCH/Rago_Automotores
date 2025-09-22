
import React from 'react';
import { CheckIcon, ArrowRightIcon } from '../constants';
import { trackEvent } from '../lib/analytics';

const BuyYourCarSection: React.FC = () => {
    const directSaleMessage = "Hola, quisiera cotizar mi auto para una venta directa.";
    const whatsappLink = `https://wa.me/5492284635692?text=${encodeURIComponent(directSaleMessage)}`;

    return (
        <section id="buy-car-section" className="bg-slate-100 dark:bg-slate-950 py-16 sm:py-24">
            <div className="container mx-auto px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white drop-shadow-sm">
                        ¿Necesitás vender rápido? <span className="text-rago-burgundy">Te lo compramos hoy.</span>
                    </h2>
                    <p className="mt-4 text-xl text-slate-500 dark:text-slate-400 leading-relaxed">
                        Si buscás una solución inmediata y sin complicaciones, nuestra opción de compra directa es para vos. Olvidate de la espera y los trámites.
                    </p>
                </div>
                
                <div className="mt-12 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="flex items-start gap-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                        <CheckIcon className="h-8 w-8 text-green-500 flex-shrink-0 mt-1" />
                        <div>
                            <h4 className="text-xl font-bold text-slate-800 dark:text-white">Pago Inmediato</h4>
                            <p className="text-lg text-slate-600 dark:text-slate-400">Recibí el dinero en el acto, una vez acordado el precio.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 animate-fade-in-up" style={{ animationDelay: '250ms' }}>
                        <CheckIcon className="h-8 w-8 text-green-500 flex-shrink-0 mt-1" />
                        <div>
                            <h4 className="text-xl font-bold text-slate-800 dark:text-white">Sin Vueltas</h4>
                            <p className="text-lg text-slate-600 dark:text-slate-400">Tasamos tu auto y si estás de acuerdo, cerramos la operación.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                        <CheckIcon className="h-8 w-8 text-green-500 flex-shrink-0 mt-1" />
                        <div>
                            <h4 className="text-xl font-bold text-slate-800 dark:text-white">Trámite Seguro</h4>
                            <p className="text-lg text-slate-600 dark:text-slate-400">Nos encargamos de toda la gestión de forma transparente.</p>
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-center animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                    <a 
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackEvent('click_cta_direct_buy')}
                        className="group inline-flex items-center justify-center gap-3 px-10 py-5 text-xl font-bold text-white bg-rago-burgundy rounded-lg hover:bg-rago-burgundy-darker focus:outline-none focus:ring-4 focus:ring-rago-burgundy/50 transition-all duration-300 shadow-lg hover:shadow-rago-lg transform hover:-translate-y-1"
                    >
                        <span>Contactar para Venta Directa</span>
                        <ArrowRightIcon className="h-6 w-6 transition-transform duration-300 group-hover:translate-x-1" />
                    </a>
                </div>
            </div>
        </section>
    );
};

export default BuyYourCarSection;
