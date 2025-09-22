

import React, { useState } from 'react';
import { ConsignmentInsert } from '../types';
import { CheckIcon } from '../constants';
import ImageUploader, { ImageFile } from './ImageUploader';
import { supabase } from '../lib/supabaseClient';
import { compressImage } from '../utils/image';

interface DirectSalePageProps {
    brands: string[];
}

type FormData = {
    owner_name: string; owner_phone: string; owner_email: string;
    make: string; model: string; year: string; mileage: string; engine: string;
    transmission: 'Manual' | 'Automática'; price_requested: string; extra_info: string; honeypot: string;
};

const FloatingLabelInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string, error?: string }> = ({ label, error, ...props }) => (
    <div className="relative">
        <input 
            id={props.name} 
            placeholder=" "
            {...props} 
            className={`peer block w-full appearance-none rounded-lg border bg-transparent px-4 pb-2.5 pt-5 text-base text-slate-900 dark:text-white focus:outline-none focus:ring-0 ${error ? 'border-red-500 focus:border-red-500' : 'border-slate-300 dark:border-slate-700 focus:border-rago-burgundy'}`}
            aria-invalid={!!error}
            aria-describedby={error ? `${props.name}-error` : undefined}
        />
        <label 
            htmlFor={props.name} 
            className={`absolute left-4 top-4 z-10 origin-[0] -translate-y-4 scale-75 transform text-base duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75 ${error ? 'text-red-600 dark:text-red-500' : 'text-slate-500 dark:text-slate-400 peer-focus:text-rago-burgundy'}`}
        >
            {label}
        </label>
        {error && <p id={`${props.name}-error`} className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
);

const FloatingLabelSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string, error?: string, children: React.ReactNode }> = ({ label, error, children, ...props }) => (
    <div className="relative">
        <select
            id={props.name}
            {...props}
            className={`peer block w-full appearance-none rounded-lg border bg-transparent px-4 pb-2.5 pt-5 text-base text-slate-900 dark:text-white focus:outline-none focus:ring-0 invalid:text-transparent focus:invalid:text-slate-900 dark:focus:invalid:text-white ${error ? 'border-red-500 focus:border-red-500' : 'border-slate-300 dark:border-slate-700 focus:border-rago-burgundy'}`}
        >
            {children}
        </select>
        <label
            htmlFor={props.name}
            className={`absolute left-4 top-4 z-10 origin-[0] -translate-y-4 scale-75 transform text-base duration-300 peer-invalid:translate-y-0 peer-invalid:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75 ${error ? 'text-red-600 dark:text-red-500' : 'text-slate-500 dark:text-slate-400 peer-focus:text-rago-burgundy'}`}
        >
            {label}
        </label>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 dark:text-slate-400">
             <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 8l4 4 4-4"/></svg>
        </div>
        {error && <p id={`${props.name}-error`} className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
);


const DirectSalePage: React.FC<DirectSalePageProps> = ({ brands }) => {
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
        const MAX_PRICE = 2147483647;
        
        if (!formData.make) newErrors.make = 'La marca es requerida.';
        if (!formData.model.trim()) newErrors.model = 'El modelo es requerido.';
        if (!formData.year) newErrors.year = 'El año es requerido.';
        else if (parseInt(formData.year) < 1950 || parseInt(formData.year) > new Date().getFullYear() + 1) newErrors.year = 'Año inválido.';
        if (!formData.mileage) newErrors.mileage = 'El kilometraje es requerido.';
        if (!formData.engine.trim()) newErrors.engine = 'El motor es requerido.';
        if (!formData.price_requested) newErrors.price_requested = 'El precio es requerido.';
        else if (parseInt(formData.price_requested, 10) > MAX_PRICE) newErrors.price_requested = `El precio no puede exceder $${MAX_PRICE.toLocaleString('es-AR')}.`;
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

        if (errors[name]) {
            setErrors(prev => ({...prev, [name]: undefined}));
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        
        if (!validate()) {
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
                body: JSON.stringify({ action: 'submit_direct_sale', honeypot, ...consignmentPayload }),
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
                <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">Venta Directa de tu Auto</h1>
                <p className="mt-3 text-lg text-slate-500 dark:text-slate-400">Completá los datos de tu vehículo y te enviaremos una oferta de compra a la brevedad.</p>
            </div>
            
            <form onSubmit={handleSubmit} noValidate className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-subtle dark:shadow-subtle-dark border border-slate-200 dark:border-slate-800 space-y-10">
                <fieldset className="space-y-6">
                    <legend className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3 w-full border-b border-slate-200 dark:border-slate-700 pb-3 mb-6">
                        <span className="bg-rago-burgundy text-white rounded-full h-8 w-8 flex items-center justify-center font-bold text-base flex-shrink-0">1</span>
                        <span>Datos del Vehículo</span>
                    </legend>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FloatingLabelSelect label="Marca" name="make" value={formData.make} onChange={handleChange} required error={errors.make}>
                            <option value="" disabled>Seleccionar</option>
                            {brands.map(b => <option key={b} value={b}>{b}</option>)}
                        </FloatingLabelSelect>
                        <FloatingLabelInput label="Modelo" name="model" value={formData.model} onChange={handleChange} required error={errors.model} />
                        <FloatingLabelInput label="Año" name="year" type="text" inputMode="numeric" value={formData.year} onChange={handleChange} required error={errors.year} />
                        <FloatingLabelInput label="Kilometraje" name="mileage" type="text" inputMode="numeric" value={formData.mileage} onChange={handleChange} required error={errors.mileage} />
                        <FloatingLabelInput label="Motor" name="engine" value={formData.engine} onChange={handleChange} required error={errors.engine} />
                        <FloatingLabelSelect label="Transmisión" name="transmission" value={formData.transmission} onChange={handleChange} required>
                            <option value="Manual">Manual</option>
                            <option value="Automática">Automática</option>
                        </FloatingLabelSelect>
                        <FloatingLabelInput label="Precio deseado (ARS)" name="price_requested" type="text" inputMode="numeric" value={formData.price_requested} onChange={handleChange} required error={errors.price_requested} />
                    </div>
                     <div>
                        <label htmlFor="extra_info" className="block text-base font-medium text-slate-700 dark:text-slate-400 mb-2">Información extra</label>
                        <textarea id="extra_info" name="extra_info" value={formData.extra_info} onChange={handleChange} rows={4} className="block w-full rounded-lg border bg-white dark:bg-slate-900 px-4 py-4 text-base text-slate-900 dark:text-white focus:outline-none focus:ring-0 border-slate-300 dark:border-slate-700 focus:border-rago-burgundy" placeholder="Ej: Único dueño, service oficial, cubiertas nuevas, detalles a mencionar..."></textarea>
                    </div>
                </fieldset>
                
                 <fieldset className="space-y-6">
                    <legend className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3 w-full border-b border-slate-200 dark:border-slate-700 pb-3 mb-6">
                        <span className="bg-rago-burgundy text-white rounded-full h-8 w-8 flex items-center justify-center font-bold text-base flex-shrink-0">2</span>
                        <span>Fotos del Vehículo</span>
                    </legend>
                    <ImageUploader files={imageFiles} setFiles={setImageFiles} disabled={status === 'submitting'} />
                </fieldset>

                <fieldset className="space-y-6">
                    <legend className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3 w-full border-b border-slate-200 dark:border-slate-700 pb-3 mb-6">
                        <span className="bg-rago-burgundy text-white rounded-full h-8 w-8 flex items-center justify-center font-bold text-base flex-shrink-0">3</span>
                        <span>Datos de Contacto</span>
                    </legend>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FloatingLabelInput label="Nombre Completo" name="owner_name" value={formData.owner_name} onChange={handleChange} required error={errors.owner_name} />
                        <FloatingLabelInput label="Teléfono" name="owner_phone" type="tel" value={formData.owner_phone} onChange={handleChange} required error={errors.owner_phone} />
                        <FloatingLabelInput label="Email" name="owner_email" type="email" value={formData.owner_email} onChange={handleChange} required error={errors.owner_email} />
                    </div>
                </fieldset>

                <input type="text" name="honeypot" value={formData.honeypot} onChange={handleChange} className="hidden" aria-hidden="true" tabIndex={-1} autoComplete="off" />
                
                {status === 'error' && <p className="text-red-500 text-center font-semibold animate-shake">{message}</p>}

                <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                    <button type="submit" disabled={status === 'submitting'} className="w-full flex items-center justify-center gap-2 px-5 py-4 text-xl font-bold text-white bg-rago-burgundy rounded-lg hover:bg-rago-burgundy-darker disabled:opacity-60 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-rago-lg">
                        {status === 'submitting' 
                            ? `Enviando... ${submitProgress.completed}/${submitProgress.total} imágenes`
                            : 'Enviar para Cotización'
                        }
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DirectSalePage;