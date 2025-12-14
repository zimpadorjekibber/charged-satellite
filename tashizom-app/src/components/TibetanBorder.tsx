export default function TibetanBorder({ className }: { className?: string }) {
    return (
        <div className={`h-2 w-full flex ${className}`}>
            {/* 5-color Tibetan pattern repeating */}
            <div className="flex-1 bg-[#0033CC]" /> {/* Blue - Space */}
            <div className="flex-1 bg-[#FFFFFF]" /> {/* White - Air/Clouds */}
            <div className="flex-1 bg-[#CC0000]" /> {/* Red - Fire */}
            <div className="flex-1 bg-[#00CC00]" /> {/* Green - Water */}
            <div className="flex-1 bg-[#FFCC00]" /> {/* Yellow - Earth */}

            <div className="flex-1 bg-[#0033CC]" />
            <div className="flex-1 bg-[#FFFFFF]" />
            <div className="flex-1 bg-[#CC0000]" />
            <div className="flex-1 bg-[#00CC00]" />
            <div className="flex-1 bg-[#FFCC00]" />
        </div>
    );
}

export function InfiniteTibetanBorder() {
    return (
        <div className="h-3 w-full flex bg-stone-900 border-t border-b border-stone-800">
            {Array.from({ length: 40 }).map((_, i) => (
                <div key={i} className="flex flex-1 w-full h-full">
                    <div className="w-1/5 h-full bg-[#1a4595]" />
                    <div className="w-1/5 h-full bg-[#f0f0f0]" />
                    <div className="w-1/5 h-full bg-[#b92b27]" />
                    <div className="w-1/5 h-full bg-[#2e8b57]" />
                    <div className="w-1/5 h-full bg-[#e8bc3d]" />
                </div>
            ))}
        </div>
    );
}
