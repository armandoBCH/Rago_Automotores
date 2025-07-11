import React from 'react';
import { ChatBubbleIcon, InstagramIcon, SellCarIcon } from '../constants';
import { trackEvent } from '../lib/analytics';

const NavLink: React.FC<{ href: string; children: React.ReactNode; }> = ({ href, children }) => (
    <a
        href={href}
        className="relative group px-3 py-2 text-lg font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors duration-300"
    >
        <span>{children}</span>
        <span className="absolute bottom-1 left-0 w-full h-[2px] bg-rago-burgundy transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-center"></span>
    </a>
);

const Header: React.FC = () => {
    const headerClasses = `
        fixed top-0 left-0 right-0
        z-30
        transition-all duration-300 ease-in-out
        bg-white/80 dark:bg-rago-black/80 backdrop-blur-xl shadow-subtle dark:shadow-subtle-dark border-b border-slate-200/80 dark:border-slate-800/80
    `;

    const contactMessage = "Hola, estoy interesado en sus vehículos.";
    const whatsappLink = `https://wa.me/5492284635692?text=${encodeURIComponent(contactMessage)}`;
    const instagramUrl = "https://www.instagram.com/ragoautomotores?igsh=MWJuamF6ZXF5YjF4cw%3D%3D";

    return (
        <header className={headerClasses}>
            <div className="container mx-auto px-4 md:px-6 py-3 flex justify-between items-center">
                {/* Left: Logo */}
                <a href="/" className="flex items-center flex-shrink-0" aria-label="Rago Automotores Home">
                    <img src="https://i.imgur.com/zOGb0ay.jpeg" alt="Rago Automotores Logo" className="h-16 transition-transform duration-300 hover:scale-105" />
                </a>
                
                {/* Center: Desktop Navigation Links */}
                <nav className="hidden md:flex items-center gap-x-4">
                    <NavLink href="/">Inicio</NavLink>
                    <NavLink href="/#catalog">Catálogo</NavLink>
                    <NavLink href="/#featured-vehicles">Destacados</NavLink>
                </nav>

                {/* Right: Actions and Social */}
                <div className="hidden md:flex items-center gap-x-4">
                    <a href="/#sell-car-section"
                       onClick={() => trackEvent('click_sell_car_header')}
                       className="flex items-center gap-x-2 px-4 py-2 text-base font-semibold rounded-lg focus:outline-none focus:ring-4 transition-all duration-300 transform hover:-translate-y-px shadow-md hover:shadow-lg text-white bg-slate-800 dark:bg-rago-burgundy hover:bg-slate-950 dark:hover:bg-rago-burgundy-darker focus:ring-slate-400/50 dark:focus:ring-rago-burgundy/50 shimmer-effect"
                    >
                        <SellCarIcon className="h-5 w-5 flex-shrink-0" />
                        <span className="hidden xl:inline whitespace-nowrap">Vender mi Auto</span>
                    </a>
                    <a
                        href={whatsappLink}
                        onClick={() => trackEvent('click_whatsapp_general')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 text-base font-semibold text-white rounded-lg focus:outline-none focus:ring-4 focus:ring-rago-burgundy/50 transition-all duration-300 transform hover:-translate-y-px shadow-md hover:shadow-lg bg-rago-burgundy hover:bg-rago-burgundy-darker animate-pulse-burgundy"
                    >
                        <ChatBubbleIcon className="h-5 w-5 flex-shrink-0" />
                        <span className="hidden xl:inline">Contactar</span>
                    </a>
                     <div className="w-px h-6 bg-slate-300 dark:bg-slate-700"></div>
                     <a
                        href={instagramUrl}
                        onClick={() => trackEvent('click_instagram')}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram"
                        className="text-slate-500 dark:text-slate-400 hover:text-rago-burgundy dark:hover:text-white transition-all duration-300 hover:scale-110"
                    >
                        <InstagramIcon className="h-7 w-7" />
                    </a>
                </div>
            </div>
        </header>
    );
};

export default Header;