import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'TashiZom Digital Dining',
        short_name: 'TashiZom',
        description: 'Experience the taste of high altitude with our digital menu.',
        start_url: '/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#DAA520', // Tashi Accent Gold
        icons: [
            {
                src: '/tashi-corner.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/tashi-corner.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    };
}
