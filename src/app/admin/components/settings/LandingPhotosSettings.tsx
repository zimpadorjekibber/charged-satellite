'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { CoreDocsSection } from './photos/CoreDocsSection';
import { CulturalAssetsSection } from './photos/CulturalAssetsSection';
import { MusicSection } from './photos/MusicSection';
import { QuickUploadTool } from './photos/QuickUploadTool';
import { GalleryManager } from './photos/GalleryManager';

export function LandingPhotosSettings() {
    const landingPhotos = useStore((state) => state.landingPhotos);
    const updateLandingPhotos = useStore((state) => state.updateLandingPhotos);
    const updateLandingPhotoCaption = useStore((state) => state.updateLandingPhotoCaption);
    const updateBackgroundMusic = useStore((state: any) => state.updateBackgroundMusic);

    return (
        <div id="landing-photos" className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm scroll-mt-24 space-y-12">
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6 font-serif">Landing Page Contextual Photos</h2>

                <CoreDocsSection
                    landingPhotos={landingPhotos}
                    updateLandingPhotos={updateLandingPhotos}
                />

                <CulturalAssetsSection
                    landingPhotos={landingPhotos}
                    updateLandingPhotos={updateLandingPhotos}
                />

                <MusicSection
                    landingPhotos={landingPhotos}
                    updateBackgroundMusic={updateBackgroundMusic}
                />

                <QuickUploadTool />

                <div className="space-y-12">
                    <GalleryManager
                        title="Prime Location Photo Gallery (Kibber/Chicham/Key)"
                        path="location"
                        photos={landingPhotos?.location || []}
                        captions={landingPhotos?.locationCaptions || {}}
                        onUpdatePhotos={updateLandingPhotos}
                        onUpdateCaption={updateLandingPhotoCaption}
                    />

                    <GalleryManager
                        title="Winter Hardships & Survival Stories"
                        path="climate"
                        photos={landingPhotos?.climate || []}
                        captions={landingPhotos?.climateCaptions || {}}
                        onUpdatePhotos={updateLandingPhotos}
                        onUpdateCaption={updateLandingPhotoCaption}
                    />
                </div>
            </div>
        </div>
    );
}
