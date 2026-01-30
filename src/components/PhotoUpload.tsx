// Photo Upload Component for Admin Panel
// Usage: Import in admin page and use for map & registration document uploads

import { useState, useEffect } from 'react';
import { Upload, X, Check, Loader2, MapPin, Clock } from 'lucide-react';
import { useStore } from '@/lib/store';

interface PhotoUploadProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    aspectRatio: string;
    currentImageUrl?: string;
    onUploadSuccess: (url: string) => void;
    placeholder: string;
}

export function PhotoUploadSection({
    title,
    description,
    icon,
    aspectRatio,
    currentImageUrl,
    onUploadSuccess,
    placeholder
}: PhotoUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
    const uploadImage = useStore((state: any) => state.uploadImage);

    useEffect(() => {
        console.log(`✅ PhotoUploadSection mounted: "${title}"`);
        console.log('📦 uploadImage function available:', !!uploadImage);
        console.log('🖼️ Current image URL:', currentImageUrl || 'None');
    }, [title, uploadImage, currentImageUrl]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            console.log('No file selected');
            return;
        }

        console.log('📸 Starting upload for:', file.name, 'Size:', (file.size / 1024).toFixed(2), 'KB');

        // Reset states
        setUploadError(null);
        setUploadSuccess(false);
        setIsUploading(true);

        try {
            // Create preview
            console.log('Creating preview...');
            const reader = new FileReader();
            reader.onloadend = () => {
                console.log('Preview created successfully');
                setPreviewUrl(reader.result as string);
            };
            reader.onerror = () => {
                console.error('Failed to read file for preview');
            };
            reader.readAsDataURL(file);

            // Upload to Firebase
            console.log('Starting Firebase upload...');
            if (!uploadImage) {
                throw new Error('Upload function not available. Please refresh the page and try again.');
            }

            const url = await uploadImage(file, false);
            console.log('✅ Upload successful! URL:', url);

            // Success!
            setUploadSuccess(true);
            onUploadSuccess(url);

            setTimeout(() => setUploadSuccess(false), 3000);
        } catch (error: any) {
            console.error('❌ Upload failed:', error);
            const errorMessage = error.message || 'Upload failed. Please try again.';
            setUploadError(errorMessage);
            setPreviewUrl(currentImageUrl || null);
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemove = () => {
        setPreviewUrl(null);
        onUploadSuccess('');
        setUploadError(null);
        setUploadSuccess(false);
    };

    return (
        <div>
            <div className="flex items-center gap-3 mb-4">
                {icon}
                <div>
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest">{title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Upload Area */}
                <div className="w-full md:w-1/2">
                    <label
                        onClick={() => {
                            console.log('🖱️ Upload area clicked!');
                        }}
                        className={`block border-2 border-dashed rounded-2xl overflow-hidden cursor-pointer transition-all hover:border-amber-400 hover:bg-amber-50/50 group relative ${previewUrl ? 'border-green-300' : 'border-gray-300'
                            }`}
                        style={{ aspectRatio }}
                    >
                        <input
                            key={previewUrl || 'empty'}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            onClick={(e) => {
                                console.log('📁 File input clicked!');
                            }}
                            className="hidden"
                            disabled={isUploading}
                        />

                        {previewUrl ? (
                            <>
                                <img
                                    src={previewUrl}
                                    alt={title}
                                    className="w-full h-full object-cover"
                                    onError={() => {
                                        console.error('Image preview failed for:', previewUrl);
                                        setUploadError('Failed to load image preview. The file might be corrupted.');
                                    }}
                                />
                                {!isUploading && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleRemove();
                                        }}
                                        className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg z-20"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-amber-50 group-hover:to-orange-50 transition-all">
                                <div className="p-4 bg-white rounded-full shadow-lg mb-4 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-amber-400/20 animate-pulse" />
                                    <Upload className="relative z-10 text-amber-600" size={32} />
                                </div>
                                <p className="text-sm font-bold text-gray-700 text-center mb-2">{placeholder}</p>
                                <p className="text-xs text-gray-500 text-center max-w-xs">
                                    Click to upload • Max 10MB • JPG, PNG, WEBP
                                </p>
                            </div>
                        )}

                        {/* Loading Overlay */}
                        {isUploading && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-30">
                                <Loader2 className="animate-spin text-white mb-3" size={40} />
                                <p className="text-white font-bold">Uploading...</p>
                                <p className="text-white/70 text-xs">Compressing & optimizing</p>
                            </div>
                        )}

                        {/* Success Overlay */}
                        {uploadSuccess && (
                            <div className="absolute inset-0 bg-green-500/90 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in z-30">
                                <div className="p-4 bg-white rounded-full mb-3">
                                    <Check className="text-green-600" size={40} />
                                </div>
                                <p className="text-white font-bold text-lg">Upload Successful!</p>
                            </div>
                        )}
                    </label>
                </div>

                {/* Preview/Info */}
                <div className="w-full md:w-1/2 space-y-4">
                    {uploadError && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                            <p className="text-red-600 font-bold text-sm mb-1">❌ Upload Failed</p>
                            <p className="text-red-500 text-xs">{uploadError}</p>
                            <button
                                onClick={() => setUploadError(null)}
                                className="mt-3 text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-lg transition-colors"
                            >
                                Dismiss
                            </button>
                        </div>
                    )}

                    {uploadSuccess && !uploadError && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                            <p className="text-green-600 font-bold text-sm">✅ Image uploaded successfully!</p>
                            <p className="text-green-700 text-xs mt-1">Visible on home page now</p>
                        </div>
                    )}

                    {!previewUrl && !isUploading && (
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                            <p className="text-gray-700 font-bold text-sm mb-2">📸 Tips for best results:</p>
                            <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                                <li>Use good lighting (natural daylight preferred)</li>
                                <li>Keep image clear and focused</li>
                                <li>For documents: ensure text is readable</li>
                                <li>Portrait orientation recommended</li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
