import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { rooms } from "@/data/rooms";

export const metadata = {
    title: "Gallery | TashiZom Home Stay",
};

export default function GalleryPage() {
    // Collect all images from rooms
    const allImages = rooms.flatMap(r => [r.mainImage, ...r.gallery]);

    return (
        <main className="min-h-screen bg-stone-50 flex flex-col">
            <Navbar />

            <div className="bg-brand-dark pt-32 pb-16 px-4">
                <div className="container mx-auto text-center">
                    <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">Gallery</h1>
                    <p className="text-stone-400 max-w-2xl mx-auto">
                        Glimpses of life at TashiZom.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16 flex-grow">
                <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
                    {allImages.map((src, idx) => (
                        <div key={idx} className="relative break-inside-avoid rounded-lg overflow-hidden group">
                            <Image
                                src={src}
                                alt={`TashiZom Gallery ${idx}`}
                                width={800}
                                height={600}
                                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        </div>
                    ))}
                </div>
            </div>

            <Footer />
        </main>
    );
}
