export interface Room {
    id: string;
    name: string;
    slug: string;
    description: string;
    shortDescription: string;
    size: string;
    style: string;
    capacity: number;
    amenities: string[];
    mainImage: string;
    gallery: string[];
    pricing: {
        base: number;
        summer: number; // April - September
        winter: number; // October - March
    };
}

export const rooms: Room[] = [
    {
        id: "1",
        name: "Himalayan Panic Suite",
        slug: "himalayan-panoramic-suite",
        description: "Our flagship suite offering 180-degree views of the snow-capped peaks. Featuring traditional wood carvings, a private balcony, and a luxurious seating area. Perfect for couples seeking a romantic getaway.",
        shortDescription: "Luxurious suite with 180° mountain views and private balcony.",
        size: "450 sq ft",
        style: "Modern Himalayan Luxury",
        capacity: 2,
        amenities: ["King Size Bed", "Private Balcony", "Heater", "Mountain View", "Tea/Coffee Maker", "Bathtub"],
        mainImage: "https://images.unsplash.com/photo-1590490360182-f33dbd9313d6?q=80&w=2670&auto=format&fit=crop",
        gallery: [
            "https://images.unsplash.com/photo-1590490360182-f33dbd9313d6?q=80&w=2670&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=2574&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=2670&auto=format&fit=crop"
        ],
        pricing: {
            base: 4500,
            summer: 5500,
            winter: 3500
        }
    },
    {
        id: "2",
        name: "Heritage Wood Room",
        slug: "heritage-wood-room",
        description: "Experience the authentic charm of a traditional Himachali home. This room features intricate wooden architecture, warm lighting, and cozy interiors perfect for winter stays.",
        shortDescription: "Authentic traditional room with intricate woodwork.",
        size: "300 sq ft",
        style: "Traditional & Cozy",
        capacity: 2,
        amenities: ["Queen Size Bed", "Wood Paneling", "Heater", "Garden View", "Work Desk"],
        mainImage: "https://images.unsplash.com/photo-1618245318763-a15156d6b23c?q=80&w=2670&auto=format&fit=crop",
        gallery: [
            "https://images.unsplash.com/photo-1618245318763-a15156d6b23c?q=80&w=2670&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=2670&auto=format&fit=crop"
        ],
        pricing: {
            base: 3000,
            summer: 3800,
            winter: 2500
        }
    },
    {
        id: "3",
        name: "Garden Family Cottage",
        slug: "garden-family-cottage",
        description: "A spacious separate cottage nestled in our apple orchard. Features two bedrooms, a small kitchenette, and direct access to the garden. Ideal for families or small groups.",
        shortDescription: "Spacious cottage in the orchard, perfect for families.",
        size: "600 sq ft",
        style: "Rustic Cottage",
        capacity: 4,
        amenities: ["2 Bedrooms", "Kitchenette", "Garden Access", "Bonfire Area", "Dining Table"],
        mainImage: "https://images.unsplash.com/photo-1587061949409-02df41d5e562?q=80&w=2670&auto=format&fit=crop",
        gallery: [
            "https://images.unsplash.com/photo-1587061949409-02df41d5e562?q=80&w=2670&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=2574&auto=format&fit=crop"
        ],
        pricing: {
            base: 6000,
            summer: 7500,
            winter: 5000
        }
    }
];
