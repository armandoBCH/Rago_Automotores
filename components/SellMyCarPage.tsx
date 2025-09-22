import React, { useState, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { Vehicle, ConsignmentInsert } from '../types';
import { XIcon, CheckIcon, ArrowRightIcon, SellCarIcon, FileCheckIcon, CogIcon, ShieldIcon, PlusIcon } from '../constants';
import ImageUploader, { ImageFile } from './ImageUploader';
import { supabase } from '../lib/supabaseClient';
import { compressImage } from '../utils/image';

const VEHICLE_TYPES = [
    'Furgón mixto utilitario', 'Furgón utilitario', 'Hatchback compacto', 'Monovolumen compacto',
    'Moto', 'Pick up chica', 'Pick up grande', 'Pick up mediana', 'Rural chica',
    'Sedan compacto', 'Sedan mediano', 'SUV',
].sort();

interface SellMyCarPageProps {
    brands: string[];
    vehicleTypes: string[];
}

type FormData = {
    owner_name: string; owner_phone: string; owner_email: string;
    make: string; model: string; year: string; mileage: string; engine: string;
    transmission: 'Manual' | 'Automática'; price_requested: string; extra_info: string; honeypot: string;
};

const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> & { label: string, error?: string }> = ({ label, error, ...props }) => (
    <div>
        <label htmlFor={props.name} className="block text-base font-medium text-slate-700 dark:text-slate-300">{label}</label>
        <input 
            id={props.name} 
            {...props} 
            className={`mt-1 form-input ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : ''}`}
            aria-invalid={!!error}
            aria-describedby={error ? `${props.name}-error` : undefined}
        />
        {error && <p id={`${props.name}-error`} className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
);


const SellMyCarPage: React.FC<SellMyCarPageProps> = ({ brands, vehicleTypes }) => {
    const [formData, setFormData] = useState<FormData>({
        owner_name: '', owner_phone: '', owner_email: '',
        make: '', model: '', year: '', mileage: '', engine: '',
        transmission: 'Manual', price_requested: '', extra_info: '', honeypot: ''
    });
    const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
    const [submitProgress, setSubmitProgress] = useState({ total: 0, completed: 0 });

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof FormData, string>> = {};
        
        // Vehicle Data
        if (!formData.make) newErrors.make = 'La marca es requerida.';
        if (!formData.model.trim()) newErrors.model = 'El modelo es requerido.';
        if (!formData.year) newErrors.year = 'El año es requerido.';
        else if (parseInt(formData.year) < 1950 || parseInt(formData.year) > new Date().getFullYear() + 1) newErrors.year = 'Año inválido.';
        if (!formData.mileage) newErrors.mileage = 'El kilometraje es requerido.';
        if (!formData.engine.trim()) newErrors.engine = 'El motor es requerido.';
        if (!formData.price_requested) newErrors.price_requested = 'El precio es requerido.';
        
        // Contact Data
        if (!formData.owner_name.trim()) newErrors.owner_name = 'Tu nombre es requerido.';
        if (!formData.owner_phone.trim()) newErrors.owner_phone = 'Tu teléfono es requerido.';
        else if (!/^\+?[0-9\s-]{7,}$/.test(formData.owner_phone)) newErrors.owner_phone = 'Formato de teléfono inválido.';
        if (!formData.owner_email.trim()) newErrors.owner_email = 'Tu email es requerido.';
        else if (!/\S+@\S+\.\S+/.test(formData.owner_email)) newErrors.owner_email = 'Formato de email inválido.';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target as { name: keyof FormData; value: string };
        
        if (['year', 'price_requested', 'mileage'].includes(name)) {
            setFormData(prev => ({ ...prev, [name]: value.replace(/\D/g, '') }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        // Clear error on change
        if (errors[name]) {
            setErrors(prev => ({...prev, [name]: undefined}));
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        
        const isFormValid = validate();

        if (!isFormValid) {
            setStatus('error');
            setMessage('Por favor, corrige los errores en el formulario.');
            return;
        }

        if (imageFiles.length === 0) {
            setStatus('error');
            setMessage('Por favor, sube al menos una imagen de tu vehículo.');
            return;
        }

        setStatus('submitting');
        
        try {
            const newFilesToUpload = imageFiles.filter(f => f.file && f.status !== 'complete');
            setSubmitProgress({ total: newFilesToUpload.length, completed: 0 });

            const uploadPromises = newFilesToUpload.map(async (imageFile) => {
                if (!imageFile.file) return null;
                const compressedFile = await compressImage(imageFile.file);
                const signedUrlResponse = await fetch('/api/admin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'createSignedUploadUrl', payload: { fileName: compressedFile.name, fileType: compressedFile.type } }),
                });
                if (!signedUrlResponse.ok) throw new Error('Falló al preparar la subida de imagen.');
                const { token, path } = await signedUrlResponse.json();
                const { error: uploadError } = await supabase.storage.from('vehicle-images').uploadToSignedUrl(path, token, compressedFile);
                if (uploadError) throw uploadError;
                setSubmitProgress(prev => ({ ...prev, completed: prev.completed + 1 }));
                const { data: { publicUrl } } = supabase.storage.from('vehicle-images').getPublicUrl(path);
                return publicUrl;
            });
            const uploadedUrls = (await Promise.all(uploadPromises)).filter((url): url is string => !!url);
            
            const { honeypot, ...consignmentData } = formData;
            const consignmentPayload: Omit<ConsignmentInsert, 'id' | 'created_at' | 'status' | 'internal_notes' | 'vehicle_id'> = {
                ...consignmentData,
                year: parseInt(consignmentData.year),
                mileage: parseInt(consignmentData.mileage),
                price_requested: parseInt(consignmentData.price_requested),
                images: uploadedUrls,
            };

            const response = await fetch('/api/public', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'submit_consignment', honeypot, ...consignmentPayload }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Ocurrió un error al enviar tu solicitud.');

            setStatus('success');
            setMessage(data.message);
            window.scrollTo(0,0);
        } catch (error: any) {
            console.error("Submission failed:", error);
            setStatus('error');
            setMessage(error.message || 'Ocurrió un error inesperado. Por favor, intente de nuevo más tarde.');
        }
    };

    if (status === 'success') {
        return (
            <div className="text-center py-20 md:py-28 animate-fade-in-up">
                <CheckIcon className="h-20 w-20 text-green-500 mx-auto" />
                <h1 className="mt-8 text-4xl font-black text-slate-800 dark:text-white tracking-tight">¡Solicitud Enviada!</h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 mt-4 max-w-xl mx-auto">{message}</p>
                <a href="/" className="group inline-flex items-center justify-center gap-3 mt-10 px-8 py-4 text-xl font-bold text-white bg-rago-burgundy rounded-lg hover:bg-rago-burgundy-darker">
                    Volver al inicio
                </a>
            </div>
        );
    }
    
    return (
        <div className="max-w-4xl mx-auto py-12 animate-fade-in">
            <div className="text-center mb-10">
                <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">Vendé tu auto con nosotros</h1>
                <p className="mt-3 text-lg text-slate-500 dark:text-slate-400">Completá los datos y te contactaremos a la brevedad para darte una cotización y coordinar los siguientes pasos.</p>
            </div>
            
            <form onSubmit={handleSubmit} noValidate className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-subtle dark:shadow-subtle-dark border border-slate-200 dark:border-slate-800 space-y-8">
                <fieldset className="space-y-6">
                    <legend className="text-2xl font-bold text-rago-burgundy border-b-2 border-rago-burgundy/30 pb-2 mb-4">1. Datos del Vehículo</legend>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="make" className="block text-base font-medium">Marca</label>
                            <select id="make" name="make" value={formData.make} onChange={handleChange} required className={`mt-1 form-input ${errors.make ? 'border-red-500' : ''}`}>
                                <option value="" disabled>Seleccionar</option>
                                {brands.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                            {errors.make && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.make}</p>}
                        </div>
                        <InputField label="Modelo" name="model" value={formData.model} onChange={handleChange} required error={errors.model} />
                        <InputField label="Año" name="year" type="text" inputMode="numeric" value={formData.year} onChange={handleChange} required error={errors.year} />
                        <InputField label="Kilometraje" name="mileage" type="text" inputMode="numeric" value={formData.mileage} onChange={handleChange} required error={errors.mileage} />
                        <InputField label="Motor" name="engine" value={formData.engine} onChange={handleChange} required error={errors.engine} />
                        <div>
                            <label htmlFor="transmission" className="block text-base font-medium">Transmisión</label>
                            <select id="transmission" name="transmission" value={formData.transmission} onChange={handleChange} required className="mt-1 form-input">
                                <option value="Manual">Manual</option>
                                <option value="Automática">Automática</option>
                            </select>
                        </div>
                        <InputField label="Precio deseado (ARS)" name="price_requested" type="text" inputMode="numeric" value={formData.price_requested} onChange={handleChange} required error={errors.price_requested} />
                    </div>
                     <div>
                        <label htmlFor="extra_info" className="block text-base font-medium">Información extra</label>
                        <textarea id="extra_info" name="extra_info" value={formData.extra_info} onChange={handleChange} rows={4} className="mt-1 form-input" placeholder="Ej: Único dueño, service oficial, cubiertas nuevas, detalles a mencionar..."></textarea>
                    </div>
                </fieldset>
                
                 <fieldset className="space-y-6">
                    <legend className="text-2xl font-bold text-rago-burgundy border-b-2 border-rago-burgundy/30 pb-2 mb-4">2. Fotos del Vehículo</legend>
                    <ImageUploader files={imageFiles} setFiles={setImageFiles} disabled={status === 'submitting'} />
                </fieldset>

                <fieldset className="space-y-6">
                    <legend className="text-2xl font-bold text-rago-burgundy border-b-2 border-rago-burgundy/30 pb-2 mb-4">3. Datos de Contacto</legend>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <InputField label="Nombre Completo" name="owner_name" value={formData.owner_name} onChange={handleChange} required error={errors.owner_name} />
                        <InputField label="Teléfono" name="owner_phone" type="tel" value={formData.owner_phone} onChange={handleChange} required error={errors.owner_phone} />
                        <InputField label="Email" name="owner_email" type="email" value={formData.owner_email} onChange={handleChange} required error={errors.owner_email} />
                    </div>
                </fieldset>

                <input type="text" name="honeypot" value={formData.honeypot} onChange={handleChange} className="hidden" aria-hidden="true" tabIndex={-1} autoComplete="off" />
                
                {status === 'error' && <p className="text-red-500 text-center font-semibold animate-shake">{message}</p>}

                <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                    <button type="submit" disabled={status === 'submitting'} className="w-full flex items-center justify-center gap-2 px-5 py-4 text-xl font-bold text-white bg-rago-burgundy rounded-lg hover:bg-rago-burgundy-darker disabled:opacity-60 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-rago-lg">
                        {status === 'submitting' 
                            ? `Enviando... ${submitProgress.completed}/${submitProgress.total} imágenes`
                            : 'Enviar para Tasación'
                        }
                    </button>
                </div>
            </form>
            <style>{`.form-input{display:block;width:100%;padding:0.75rem 1rem;background-color:#fff;border:1px solid #d1d5db;border-radius:0.5rem;box-shadow:0 1px 2px 0 rgba(0,0,0,0.05);transition:border-color .2s,box-shadow .2s;font-size:1rem;line-height:1.5rem}.dark .form-input{background-color:#1f2937;border-color:#4b5563;color:#e5e7eb}.form-input:focus{outline:0;box-shadow:0 0 0 2px rgba(108,30,39,.5);border-color:#6c1e27}`}</style>
        </div>
    );
};

export default SellMyCarPage;
