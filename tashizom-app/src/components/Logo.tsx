import React from 'react';

interface LogoProps {
    type?: 'restaurant' | 'homestay';
    className?: string;
}

export default function Logo({ type = 'homestay', className = "" }: LogoProps) {
    return (
        <div className={`relative inline-flex flex-col items-center justify-center ${className}`}>
            {/* Container SVG */}
            <svg
                viewBox="0 0 200 200"
                className="w-full h-full drop-shadow-md"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Background Circle */}
                <circle cx="100" cy="100" r="95" fill="#F8F3E8" stroke="black" strokeWidth="3" />

                {/* Top Symbol (Stylized Buddhist Emblem - Parasol/Wheel) */}
                <g transform="translate(75, 25) scale(0.5)">
                    {/* Parasol Top */}
                    <path d="M50 0 C20 10, 20 40, 50 40 C80 40, 80 10, 50 0" fill="#2E8B57" />
                    <path d="M50 0 L50 40" stroke="#FFD700" strokeWidth="2" />
                    {/* Wheel/Knot Body */}
                    <circle cx="50" cy="60" r="15" fill="#FFD700" stroke="#8B0000" strokeWidth="2" />
                    <path d="M50 75 L30 100 H70 Z" fill="#4B0082" />
                    {/* Ribbons */}
                    <path d="M30 40 Q10 60, 20 90" stroke="#D2691E" strokeWidth="3" fill="none" />
                    <path d="M70 40 Q90 60, 80 90" stroke="#D2691E" strokeWidth="3" fill="none" />
                </g>

                {/* TZ Monogram Background */}
                <text
                    x="100"
                    y="150"
                    textAnchor="middle"
                    fontFamily="serif"
                    fontSize="120"
                    fontWeight="bold"
                    fill="#8B2635" // Tibetan Maroon
                    opacity="0.2"
                    className="select-none"
                >
                    TZ
                </text>

                {/* TashiZom Text */}
                <text
                    x="100"
                    y="135"
                    textAnchor="middle"
                    fontFamily="sans-serif"
                    fontSize="28"
                    fontWeight="900"
                    fill="#2C5F2D" // Brand Green
                    className="drop-shadow-sm select-none"
                    letterSpacing="1"
                >
                    TashiZom
                </text>

                {/* Bottom Text (Restaurant / Home Stay) */}
                <path id="curve" d="M 40 150 Q 100 190 160 150" fill="transparent" />
                <text width="200" className="select-none">
                    <textPath
                        href="#curve"
                        startOffset="50%"
                        textAnchor="middle"
                        fontFamily="serif"
                        fontSize="16"
                        fontWeight="bold"
                        fill="#8B2635"
                        letterSpacing="2"
                    >
                        {type === 'restaurant' ? 'RESTAURANT' : 'HOME STAY'}
                    </textPath>
                </text>
            </svg>
        </div>
    );
}
