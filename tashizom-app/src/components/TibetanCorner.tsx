import Image from "next/image";

export default function TibetanCorner({
    position = "top-left",
    size = 64,
    className = ""
}: {
    position?: "top-left" | "top-right" | "bottom-left" | "bottom-right",
    size?: number,
    className?: string
}) {
    const rotation = {
        "top-left": "rotate-0",
        "top-right": "rotate-90",
        "bottom-right": "rotate-180",
        "bottom-left": "-rotate-90",
    };

    const positioning = {
        "top-left": "top-0 left-0",
        "top-right": "top-0 right-0",
        "bottom-right": "bottom-0 right-0",
        "bottom-left": "bottom-0 left-0",
    };

    return (
        <div className={`absolute ${positioning[position]} pointer-events-none z-10 ${className}`}>
            <div className={`relative ${rotation[position]}`} style={{ width: size, height: size }}>
                <Image
                    src="/assets/tibetan-corner.png"
                    alt="decoration"
                    fill
                    className="object-contain opacity-80"
                />
            </div>
        </div>
    );
}
