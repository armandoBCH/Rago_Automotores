
import React from 'react';
import { ArrowRightIcon, CheckIcon } from '../constants';
import { trackEvent } from '../lib/analytics';

const SellYourCarSection: React.FC = () => {
    const directSaleMessage = "Hola, quisiera cotizar mi auto para una venta directa.";
    const whatsappLink = `https://wa.me/5492284635692?text=${encodeURIComponent(directSaleMessage)}`;

    return (
        <section id="sell-car-section" className="bg-slate-100 dark:bg-slate-950 py-16 sm:py-24">
            <div className="container mx-auto px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center mb-12 animate-fade-in-up">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                        Vendé tu Auto con Nosotros
                    </h2>
                    <p className="mt-4 text-xl text-slate-500 dark:text-slate-400 leading-relaxed">
                        Elegí la opción que mejor se adapte a tus necesidades. Te ofrecemos un proceso rápido, seguro y transparente.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    {/* Card 1: Venta Directa */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 flex flex-col shadow-subtle dark:shadow-subtle-dark border border-slate-200 dark:border-slate-800 transition-transform duration-300 hover:-translate-y-2 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                        <div className="flex-shrink-0">
                            <h3 className="text-3xl font-bold text-slate-800 dark:text-white">Opción 1: Compra Directa</h3>
                            <p className="text-lg text-rago-burgundy font-semibold mt-1">¿Necesitás vender rápido?</p>
                        </div>
                        <p className="my-6 text-slate-600 dark:text-slate-400 flex-grow">
                            Si buscás una solución inmediata y sin complicaciones, te compramos el auto hoy. Tasación justa y pago en el acto.
                        </p>
                        <ul className="space-y-3 mb-8 text-slate-600 dark:text-slate-300">
                            <li className="flex items-center gap-3"><CheckIcon className="h-6 w-6 text-green-500" /><span>Pago inmediato y seguro.</span></li>
                            <li className="flex items-center gap-3"><CheckIcon className="h-6 w-6 text-green-500" /><span>Sin vueltas ni esperas.</span></li>
                            <li className="flex items-center gap-3"><CheckIcon className="h-6 w-6 text-green-500" /><span>Nos encargamos de todo el trámite.</span></li>
                        </ul>
                        <a 
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackEvent('click_cta_direct_buy')}
                            className="group mt-auto w-full inline-flex items-center justify-center gap-3 px-6 py-4 text-lg font-bold text-white bg-slate-800 dark:bg-slate-700 rounded-lg hover:bg-slate-950 dark:hover:bg-slate-600 focus:outline-none focus:ring-4 focus:ring-slate-400/50 transition-all"
                        >
                            <span>Contactar por Venta Directa</span>
                            <ArrowRightIcon className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                        </a>
                    </div>

                    {/* Card 2: Consignación */}
                    <div className="bg-rago-burgundy dark:bg-gradient-to-br dark:from-rago-burgundy dark:to-rago-burgundy-darker text-white rounded-2xl p-8 flex flex-col shadow-rago-lg transition-transform duration-300 hover:-translate-y-2 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                        <div className="flex-shrink-0">
                            <h3 className="text-3xl font-bold">Opción 2: Consignación</h3>
                            <p className="text-lg text-white/80 font-semibold mt-1">Maximizá el valor de tu vehículo.</p>
                        </div>
                        <p className="my-6 text-white/90 flex-grow">
                            Nos encargamos de todo el proceso de venta: preparación, publicación, negociación y transferencia. Vos solo esperás la mejor oferta.
                        </p>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-center gap-3"><CheckIcon className="h-6 w-6 text-white" /><span>Obtené el mejor precio de mercado.</span></li>
                            <li className="flex items-center gap-3"><CheckIcon className="h-6 w-6 text-white" /><span>Exposición en nuestro salón y redes.</span></li>
                            <li className="flex items-center gap-3"><CheckIcon className="h-6 w-6 text-white" /><span>Gestión profesional y segura.</span></li>
                        </ul>
                        <a 
                            href="/vender-mi-auto"
                            onClick={() => trackEvent('click_cta_consign')}
                            className="group mt-auto w-full inline-flex items-center justify-center gap-3 px-6 py-4 text-lg font-bold text-rago-burgundy bg-white rounded-lg hover:bg-slate-200 focus:outline-none focus:ring-4 focus:ring-white/50 transition-all"
                        >
                            <span>Comenzar Proceso</span>
                            <ArrowRightIcon className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SellYourCarSection;
