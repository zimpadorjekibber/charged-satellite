import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RoomCard from "@/components/RoomCard";
import { rooms } from "@/data/rooms";

export const metadata = {
    title: "Our Rooms | TashiZom Home Stay",
    description: "Explore our range of premium rooms and suites in Spiti Valley.",
};

export default function RoomsPage() {
    return (
        <main className="min-h-screen bg-stone-50 flex flex-col">
            <Navbar />

            <div className="bg-brand-dark pt-32 pb-16 px-4">
                <div className="container mx-auto text-center">
                    <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">Our Accommodations</h1>
                    <p className="text-stone-400 max-w-2xl mx-auto">
                        Find your perfect sanctuary amidst the mountains. From cozy wooden rooms to panoramic suites.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16 flex-grow">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {rooms.map((room) => (
                        <RoomCard key={room.id} room={room} />
                    ))}
                </div>
            </div>

            <Footer />
        </main>
    );
}
