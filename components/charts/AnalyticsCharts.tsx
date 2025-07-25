import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

const useChartColors = () => {
    const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    return {
        gridColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        textColor: isDarkMode ? '#e2e8f0' : '#334155',
        tooltipBg: isDarkMode ? '#1e293b' : '#fff',
        tooltipTitle: isDarkMode ? '#fff' : '#334155',
        tooltipBody: isDarkMode ? '#cbd5e1' : '#475569',
        burgundy: '#6C1E27',
        burgundyMuted: 'rgba(108, 30, 39, 0.7)',
        accentColors: [
            'rgba(108, 30, 39, 0.8)',   // Burgundy
            'rgba(71, 85, 105, 0.8)',  // Slate
            'rgba(245, 158, 11, 0.8)',  // Amber
            'rgba(16, 185, 129, 0.8)', // Emerald
            'rgba(59, 130, 246, 0.8)', // Blue
        ],
    };
};

export const PageViewsChart: React.FC<{ data: { labels: string[], data: number[] }, total: number }> = ({ data, total }) => {
    const colors = useChartColors();
    const chartData = {
        labels: data.labels,
        datasets: [{
            label: 'Visitas',
            data: data.data,
            backgroundColor: colors.burgundyMuted,
            borderColor: colors.burgundy,
            borderWidth: 0,
            borderRadius: 4,
            barPercentage: 0.8,
            categoryPercentage: 0.8,
        }],
    };
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: colors.tooltipBg, titleColor: colors.tooltipTitle, bodyColor: colors.tooltipBody, displayColors: false, padding: 10, cornerRadius: 4 } },
        scales: {
            y: { ticks: { color: colors.textColor, precision: 0 }, grid: { color: colors.gridColor } },
            x: { ticks: { color: colors.textColor }, grid: { display: false } },
        },
    };
    
    return (
        <div>
            <div className="flex justify-between items-baseline mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Visitas a la Página</h3>
                <div className="text-right">
                    <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{total.toLocaleString('es-AR')}</p>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total en período</p>
                </div>
            </div>
            <div className="h-64 sm:h-72">
                <Bar options={options} data={chartData} />
            </div>
        </div>
    );
};

export const TopVehiclesChart: React.FC<{ data: { label: string, views: number }[] }> = ({ data }) => {
    const colors = useChartColors();
    const chartData = {
        labels: data.map(d => d.label),
        datasets: [{
            label: 'Vistas',
            data: data.map(d => d.views),
            backgroundColor: colors.accentColors,
            borderColor: colors.burgundy,
            borderWidth: 0,
        }],
    };
    const options = {
        indexAxis: 'y' as const,
        responsive: true,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: colors.tooltipBg, titleColor: colors.tooltipTitle, bodyColor: colors.tooltipBody } },
        scales: {
            y: { ticks: { color: colors.textColor }, grid: { color: colors.gridColor } },
            x: { ticks: { color: colors.textColor, precision: 0 }, grid: { color: colors.gridColor } },
        },
    };
    return <Bar options={options} data={chartData} />;
};

export const EventDistributionChart: React.FC<{ data: { [key: string]: number } }> = ({ data }) => {
    const colors = useChartColors();
    
    const eventLabels: {[key: string]: string} = {
        page_view: 'Vistas de Página',
        view_vehicle_detail: 'Vistas de Detalle',
        click_card_details: 'Clics en Tarjeta',
        click_whatsapp_vehicle: 'Contactos (Vehículo)',
        click_whatsapp_general: 'Contactos (General)',
        favorite_add: 'Añadido a Favoritos',
        favorite_remove: 'Quitado de Favoritos',
        click_share_vehicle: 'Compartir Vehículo',
        click_sell_car_header: 'Vender (Header)',
        view_sell_your_car: 'Vender (Visto)',
        click_whatsapp_sell: 'Vender (WhatsApp)',
        click_instagram: 'Clic Instagram',
        click_phone_footer: 'Clic Teléfono',
        click_test_drive_request: 'Solicitud Test Drive'
    }

    const labels = Object.keys(data).map(key => eventLabels[key] || key);
    const chartData = {
        labels,
        datasets: [{
            label: 'Eventos',
            data: Object.values(data),
            backgroundColor: colors.accentColors,
            borderColor: colors.gridColor,
            borderWidth: 2,
        }],
    };
    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'right' as const, labels: { color: colors.textColor } },
            tooltip: { backgroundColor: colors.tooltipBg, titleColor: colors.tooltipTitle, bodyColor: colors.tooltipBody }
        },
    };
    return <Doughnut options={options} data={chartData} />;
};