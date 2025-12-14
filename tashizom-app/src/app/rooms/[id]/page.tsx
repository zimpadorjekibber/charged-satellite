import { rooms } from "@/data/rooms";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RoomDetailsClient from "./RoomDetailsClient";
import { notFound } from "next/navigation";

export function generateStaticParams() {
    return rooms.map((room) => ({
        id: room.id,
    }));
}

export default async function RoomPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const room = rooms.find((r) => r.id === id);

    if (!room) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-white">
            <Navbar />
            <RoomDetailsClient room={room} />
            <Footer />
        </main>
    );
}
