'use client';

import React from 'react';
import { MapPin, Home } from 'lucide-react';
import { PhotoUploadSection } from '@/components/PhotoUpload';

interface CoreDocsSectionProps {
    landingPhotos: any;
    updateLandingPhotos: (key: string, url: string) => void;
}

export function CoreDocsSection({ landingPhotos, updateLandingPhotos }: CoreDocsSectionProps) {
    return (
        <div className="mb-12">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 border-b pb-2">Core Documents & Maps</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <PhotoUploadSection
                    title="Gateway Map"
                    description="Upload a map of the region or Spiti Valley"
                    icon={<MapPin size={20} className="text-amber-500" />}
                    aspectRatio="3/4"
                    currentImageUrl={landingPhotos?.customMap}
                    onUploadSuccess={(url) => updateLandingPhotos('customMap', url)}
                    placeholder="नक्शा अपलोड करें / Upload Map"
                />
                <PhotoUploadSection
                    title="Registration Certificate"
                    description="HP Tourism registration or safety certificate"
                    icon={<Home size={20} className="text-blue-500" />}
                    aspectRatio="3/4"
                    currentImageUrl={landingPhotos?.registrationDoc}
                    onUploadSuccess={(url) => updateLandingPhotos('registrationDoc', url)}
                    placeholder="सर्टिफिकेट / Certificate"
                />
            </div>
        </div>
    );
}
