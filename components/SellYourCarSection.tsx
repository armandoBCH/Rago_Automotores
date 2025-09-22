
import React from 'react';
import { ArrowRightIcon, FileCheckIcon, CogIcon, ShieldIcon } from '../constants';
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
    return (
        <section id="consign-car-section" className="relative text-white overflow-hidden bg-gradient-to-br from-rago-burgundy via-rago-burgundy-darker to-rago-black bg-[size:200%_200%] animate-bg-pan">
            <div className="container mx-auto px-6 lg:px-8 pt-20 md:pt-28 pb-16 md:pb-24">

                <div className="text-center mb-12 animate-fade-in-up">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-lg">
                        Opción 2: Dejalo en Consignación
                    </h2>
                    <p className="mt-4 text-xl md:text-2xl text-slate-200 leading-relaxed max-w-4xl mx-auto">
                        Maximizá el valor de tu vehículo. Nos encargamos de todo el proceso de venta, desde la preparación y publicación hasta la negociación final y la transferencia.
                    </p>
                </div>
                
                <div className="mt-20">
                    <div className="text-center mb-12 animate-fade-in-up">
                        <h3 className="text-3xl font-bold tracking-tight text-white drop-shadow-lg">
                            Nuestro Estándar de Calidad
                        </h3>
                        <p className="mt-2 text-lg text-slate-200 leading-relaxed max-w-3xl mx-auto">
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

                <div className="mt-16 text-center animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                    <a 
                        href="/vender-mi-auto"
                        onClick={() => trackEvent('click_cta_consign')}
                        className="group inline-flex items-center justify-center gap-3 px-10 py-5 text-xl font-bold text-rago-burgundy bg-white rounded-lg hover:bg-slate-200 focus:outline-none focus:ring-4 focus:ring-white/50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 animate-pulse-light"
                    >
                        <span>Comenzar Proceso de Consignación</span>
                        <ArrowRightIcon className="h-6 w-6 transition-transform duration-300 group-hover:translate-x-1" />
                    </a>
                </div>
            </div>
        </section>
    );
};

export default SellYourCarSection;
