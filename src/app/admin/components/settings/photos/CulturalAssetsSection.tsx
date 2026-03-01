'use client';

import React from 'react';
import { ImageIcon, Plus } from 'lucide-react';
import { PhotoUploadSection } from '@/components/PhotoUpload';

interface CulturalAssetsSectionProps {
    landingPhotos: any;
    updateLandingPhotos: (key: string, url: string) => void;
}

export function CulturalAssetsSection({ landingPhotos, updateLandingPhotos }: CulturalAssetsSectionProps) {
    return (
        <div className="mb-12">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 border-b pb-2">Spiritual & Cultural Assets (GIFs)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <PhotoUploadSection
                    title="Prayer Flags (Animated GIF)"
                    description="Long strip of repeating prayer flags (GIF recommended)"
                    icon={<ImageIcon size={20} className="text-indigo-500" />}
                    aspectRatio="video"
                    currentImageUrl={landingPhotos?.prayerFlags}
                    onUploadSuccess={(url) => updateLandingPhotos('prayerFlags', url)}
                    placeholder="Flag GIF Upload"
                />
                <PhotoUploadSection
                    title="Prayer Wheel (Animated GIF)"
                    description="Spinning wheel for the footer/transitions"
                    icon={<ImageIcon size={20} className="text-orange-500" />}
                    aspectRatio="square"
                    currentImageUrl={landingPhotos?.prayerWheel}
                    onUploadSuccess={(url) => updateLandingPhotos('prayerWheel', url)}
                    placeholder="Wheel GIF Upload"
                />
                <PhotoUploadSection
                    title="Animated Logo / Loader"
                    description="Animated brand logo for the global loader"
                    icon={<Plus size={20} className="text-red-500" />}
                    aspectRatio="square"
                    currentImageUrl={landingPhotos?.logoGif}
                    onUploadSuccess={(url) => updateLandingPhotos('logoGif', url)}
                    placeholder="Logo Animation Upload"
                />
            </div>
        </div>
    );
}
