
import React, { useState, useEffect, useRef } from 'react';
import { ChatBubbleIcon, InstagramIcon } from '../constants';

const NavLink: React.FC<{ href: string; children: React.ReactNode; }> = ({ href, children }) => (
    <a
        href={href}
        className="relative px-1 py-2 text-lg font-medium text-slate-700 dark:text-slate-300 hover:text-rago-burgundy dark:hover:text-white transition-colors duration-300 after:absolute after:bottom-1 after:left-0 after:h-0.5 after:w-full after:bg-rago-burgundy after:scale-x-0 after:origin-left hover:after:scale-x-100 after:transition-transform after:duration-300 after:ease-out"
    >
        {children}
    </a>
);

const Header: React.FC = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [isScrolled, setIsScrolled] = useState(false);
    const lastScrollY = useRef(0);

    // Scroll detection for header visibility and style
    useEffect(() => {
        const controlHeader = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
                setIsVisible(false);
            } else if (currentScrollY < lastScrollY.current) {
                setIsVisible(true);
            }
            lastScrollY.current = currentScrollY;
            setIsScrolled(currentScrollY > 10);
        };
        window.addEventListener('scroll', controlHeader, { passive: true });
        return () => window.removeEventListener('scroll', controlHeader);
    }, []);

    const headerClasses = `
        bg-white/70 dark:bg-rago-black/70 backdrop-blur-xl
        sticky top-0
        z-30
        transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-y-0' : '-translate-y-full'}
        ${isScrolled ? 'shadow-subtle dark:shadow-subtle-dark border-b border-slate-200/80 dark:border-slate-800/80' : 'border-b border-transparent'}
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
                <nav className="hidden md:flex items-center gap-x-8">
                    <NavLink href="/">Inicio</NavLink>
                    <NavLink href="/#catalog">Catálogo</NavLink>
                </nav>

                {/* Right: Actions and Social */}
                <div className="hidden md:flex items-center gap-x-4">
                    <a href="/#sell-car-section"
                       className="shimmer-effect px-4 py-2 text-base font-semibold text-white bg-slate-800 dark:bg-rago-burgundy rounded-lg hover:bg-slate-950 dark:hover:bg-rago-burgundy-darker focus:outline-none focus:ring-4 focus:ring-slate-400/50 dark:focus:ring-rago-burgundy/50 transition-all duration-300 transform hover:-translate-y-px shadow-md hover:shadow-lg">
                        <span>Vender mi Auto</span>
                    </a>
                    <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 text-base font-semibold text-white bg-rago-burgundy rounded-lg hover:bg-rago-burgundy-darker focus:outline-none focus:ring-4 focus:ring-rago-burgundy/50 transition-all duration-300 transform hover:-translate-y-px shadow-md hover:shadow-lg animate-pulse-burgundy"
                    >
                        <ChatBubbleIcon className="h-5 w-5" />
                        <span>Contactar</span>
                    </a>
                     <div className="w-px h-6 bg-slate-300 dark:bg-slate-700"></div>
                     <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-slate-500 dark:text-slate-400 hover:text-rago-burgundy dark:hover:text-white transition-transform duration-300 hover:scale-110">
                        <InstagramIcon className="h-7 w-7" />
                    </a>
                </div>
            </div>
        </header>
    );
};

export default Header;
