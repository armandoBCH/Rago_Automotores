
import React, { useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { TrashIcon, UpIcon, DownIcon, PlusIcon } from '../constants';

export type ImageFile = {
    id: string;
    file: File | null;
    preview: string;
    url?: string;
    status: 'pending' | 'uploading' | 'complete' | 'error';
    error?: string;
};

interface ImageUploaderProps {
    files: ImageFile[];
    setFiles: React.Dispatch<React.SetStateAction<ImageFile[]>>;
    disabled?: boolean;
}

const baseStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    borderWidth: 2,
    borderRadius: '0.5rem',
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    backgroundColor: '#fafafa',
    color: '#6b7281',
    outline: 'none',
    transition: 'border .24s ease-in-out',
    minHeight: '120px',
    cursor: 'pointer'
};

const focusedStyle: React.CSSProperties = { borderColor: '#6C1E27' };
const acceptStyle: React.CSSProperties = { borderColor: '#16a34a' };
const rejectStyle: React.CSSProperties = { borderColor: '#dc2626' };
const disabledStyle: React.CSSProperties = { opacity: 0.5, cursor: 'not-allowed' };

const darkBaseStyle: React.CSSProperties = {
    ...baseStyle,
    borderColor: '#4b5563',
    backgroundColor: '#1f2937',
    color: '#9ca3af',
};

const ImageUploader: React.FC<ImageUploaderProps> = ({ files, setFiles, disabled }) => {

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newImageFiles: ImageFile[] = acceptedFiles.map(file => ({
            id: `${file.name}-${file.lastModified}`,
            file,
            preview: URL.createObjectURL(file),
            status: 'pending'
        }));
        setFiles(prev => [...prev, ...newImageFiles]);
    }, [setFiles]);

    const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
        disabled
    });

    const style = useMemo(() => {
        const isDark = document.documentElement.classList.contains('dark');
        const currentBaseStyle = isDark ? darkBaseStyle : baseStyle;
        return {
            ...currentBaseStyle,
            ...(isFocused ? focusedStyle : {}),
            ...(isDragAccept ? acceptStyle : {}),
            ...(isDragReject ? rejectStyle : {}),
            ...(disabled ? disabledStyle : {}),
        };
    }, [isFocused, isDragAccept, isDragReject, disabled]);

    const removeFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const moveFile = (index: number, direction: 'up' | 'down') => {
        const newFiles = [...files];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex >= 0 && targetIndex < newFiles.length) {
            [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]];
            setFiles(newFiles);
        }
    };
    
    return (
        <div className="space-y-4">
            <div {...getRootProps({ style })}>
                <input {...getInputProps()} />
                <PlusIcon className="h-10 w-10 text-gray-400 mb-2" />
                <p>Arrastra imágenes o haz clic para seleccionar</p>
                <em className="text-sm">(Imágenes .jpeg, .png, .webp)</em>
            </div>
            
            <div className="space-y-3">
                {files.map((imageFile, index) => (
                    <div key={imageFile.id} className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border dark:border-slate-700/50">
                        <div className="relative w-20 h-16 rounded flex-shrink-0">
                             {index === 0 && <span className="absolute -top-1.5 -left-1.5 bg-rago-burgundy text-white text-xs font-bold px-2 py-0.5 rounded-full z-10 select-none">Principal</span>}
                            <img src={imageFile.preview} alt={`Previsualización de ${imageFile.file?.name || 'imagen'}`} className="w-full h-full object-cover rounded" onLoad={() => { if (imageFile.file) URL.revokeObjectURL(imageFile.preview) }} />
                        </div>
                        <div className="flex-grow min-w-0">
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{imageFile.file?.name || new URL(imageFile.url || '').pathname.split('/').pop()}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{imageFile.file ? `${(imageFile.file.size / 1024).toFixed(1)} KB` : 'Subida'}</p>
                        </div>
                        <div className="flex items-center flex-shrink-0">
                            <button type="button" onClick={() => moveFile(index, 'up')} disabled={index === 0 || disabled} className="p-1.5 disabled:opacity-50 text-slate-500 hover:text-slate-800 dark:hover:text-white"><UpIcon /></button>
                            <button type="button" onClick={() => moveFile(index, 'down')} disabled={index === files.length - 1 || disabled} className="p-1.5 disabled:opacity-50 text-slate-500 hover:text-slate-800 dark:hover:text-white"><DownIcon /></button>
                            <button type="button" onClick={() => removeFile(imageFile.id)} disabled={disabled} className="p-1.5 disabled:opacity-50 text-red-500 hover:text-red-700"><TrashIcon /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ImageUploader;
