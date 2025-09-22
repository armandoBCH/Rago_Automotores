

import React, { useEffect, useRef } from 'react';
import { CheckIcon, ArrowRightIcon, FileCheckIcon, CogIcon, ShieldIcon } from '../constants';
import { trackEvent } from '../lib/analytics';

const QualityCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; delay: number; }> = ({ icon, title, children, delay }) => (
    <div 
        className="bg-white/5 dark:bg-black/20 p-8 rounded-2xl text-center flex flex-col items-center animate-fade-in-up backdrop-blur-sm border border-white/10 transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-rago-glow"
        style={{ animationDelay: `${delay}ms`}}
    >
        <div className="bg-rago-burgundy-darker/80 rounded-full p-4 mb-6 inline-block shadow-lg">
            {icon}
        </div>
        <h4 className="text-2xl font-bold text-white mb-3">{title}</h4>
        <p className="text-lg text-slate-200 leading-relaxed">{children}</p>
    </div>
);

const SellYourCarSection: React.FC = () => {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    trackEvent('view_sell_your_car');
                    if (sectionRef.current) {
                        observer.unobserve(sectionRef.current);
                    }
                }
            },
            { root: null, rootMargin: '0px', threshold: 0.5 }
        );

        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => { if (sectionRef.current) observer.unobserve(sectionRef.current); };
    }, []);

    return (
        <section ref={sectionRef} id="sell-car-section" className="relative text-white overflow-hidden bg-gradient-to-br from-rago-burgundy via-rago-burgundy-darker to-rago-black">
            <div className="absolute top-0 left-0 w-full h-24 overflow-hidden leading-[0]" style={{ transform: 'rotate(180deg) translateY(1px)' }}>
                <svg viewBox="0 0 960 100" preserveAspectRatio="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 45 L32 49.3 C64 53.7 128 62.3 192 61.2 C256 60 320 49 384 46.7 C448 44.3 512 50.7 576 57.7 C640 64.7 704 72.3 768 70.3 C832 68.3 896 56.7 928 50.8 L960 45 L960 101 L0 101Z" className="fill-slate-100 dark:fill-slate-950" />
                </svg>
            </div>
            <div className="container mx-auto px-6 lg:px-8 pt-20 md:pt-28 pb-16 md:pb-24">
                <div className="text-center mb-12 animate-fade-in-up">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-lg">
                        ¿Querés vender tu auto?
                    </h2>
                    <p className="mt-4 text-xl md:text-2xl text-slate-200 leading-relaxed max-w-4xl mx-auto">
                        Te lo compramos, lo aceptamos como parte de pago, o lo gestionamos por vos. Elegí la opción que más te convenga.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    {/* Card 1: Venta Directa */}
                    <div className="group relative bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-8 flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-rago-glow animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                        <div className="relative z-10 flex flex-col h-full">
                            <div>
                                <h3 className="text-3xl font-bold text-white">Opción 1: Compra Directa</h3>
                                <p className="text-lg text-slate-200 font-semibold mt-1">¿Necesitás vender rápido?</p>
                            </div>
                            <p className="my-6 text-slate-300 flex-grow">
                                Si buscás una solución inmediata y sin complicaciones, te compramos el auto hoy. Tasación justa y pago en el acto.
                            </p>
                            <ul className="space-y-3 mb-8 text-slate-200">
                                <li className="flex items-center gap-3"><CheckIcon className="h-6 w-6 text-green-400" /><span>Pago inmediato y seguro.</span></li>
                                <li className="flex items-center gap-3"><CheckIcon className="h-6 w-6 text-green-400" /><span>Sin vueltas ni esperas.</span></li>
                                <li className="flex items-center gap-3"><CheckIcon className="h-6 w-6 text-green-400" /><span>Nos encargamos de todo el trámite.</span></li>
                            </ul>
                            <a 
                                href="/venta-directa"
                                onClick={() => trackEvent('click_cta_direct_buy')}
                                className="group/button mt-auto w-full inline-flex items-center justify-center gap-3 px-6 py-4 text-lg font-bold text-rago-burgundy bg-white rounded-lg hover:bg-slate-200 focus:outline-none focus:ring-4 focus:ring-white/50 transition-all"
                            >
                                <span>Comenzar Venta Directa</span>
                                <ArrowRightIcon className="h-5 w-5 transition-transform duration-300 group-hover/button:translate-x-1" />
                            </a>
                        </div>
                    </div>

                    {/* Card 2: Consignación */}
                    <div className="group relative bg-rago-burgundy/80 backdrop-blur-md border border-white/20 text-white rounded-2xl p-8 flex flex-col shadow-rago-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-rago-glow animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                        <div className="relative z-10 flex flex-col h-full">
                            <div>
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
                                className="group/button mt-auto w-full inline-flex items-center justify-center gap-3 px-6 py-4 text-lg font-bold text-rago-burgundy bg-white rounded-lg hover:bg-slate-200 focus:outline-none focus:ring-4 focus:ring-white/50 transition-all"
                            >
                                <span>Comenzar Proceso de Consignación</span>
                                <ArrowRightIcon className="h-5 w-5 transition-transform duration-300 group-hover/button:translate-x-1" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-20 pt-16 border-t border-white/10">
                    <div className="text-center mb-12 animate-fade-in-up">
                        <h3 className="text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-lg">
                            Nuestro Estándar de Calidad
                        </h3>
                        <p className="mt-4 text-xl text-slate-200 leading-relaxed max-w-3xl mx-auto">
                            Cada vehículo en consignación pasa por una rigurosa inspección de 3 puntos clave para garantizar tu tranquilidad y la nuestra.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <QualityCard 
                            icon={<CogIcon className="h-12 w-12 text-green-400" />}
                            title="Mecánica General"
                            delay={100}
                        >
                            Revisión completa del motor, transmisión y componentes vitales.
                        </QualityCard>
                        <QualityCard
                            icon={<ShieldIcon className="h-12 w-12 text-green-400" />}
                            title="Chasis y Seguridad"
                            delay={250}
                        >
                            Inspección de tren delantero, frenos y estado de neumáticos.
                        </QualityCard>
                        <QualityCard
                            icon={<FileCheckIcon className="h-12 w-12 text-green-400" />}
                            title="Documentación al Día"
                            delay={400}
                        >
                            Chequeo de deudas, multas y verificación policial.
                        </QualityCard>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SellYourCarSection;