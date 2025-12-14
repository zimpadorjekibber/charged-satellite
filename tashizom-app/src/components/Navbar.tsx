"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/Button";



import Image from "next/image";

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Our Rooms", href: "/rooms" },
        { name: "Amenities", href: "/#amenities" },
        { name: "Gallery", href: "/gallery" },
        { name: "Contact", href: "/contact" },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 flex flex-col ${isScrolled
                ? "bg-[#1C1917] shadow-lg py-2"
                : "bg-transparent py-4"
                }`}
        >
            <div className="w-full flex-grow">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="relative h-16 w-16 md:h-20 md:w-20 transition-transform hover:scale-105">
                            <Image
                                src="/logo.png"
                                alt="TashiZom Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center space-x-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`text-sm font-medium transition-colors hover:text-brand-secondary ${isScrolled ? "text-stone-300" : "text-white/90"
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <Button
                                size="sm"
                                variant={isScrolled ? "secondary" : "secondary"}
                                className={!isScrolled ? "bg-white text-brand-primary hover:bg-stone-100" : ""}
                            >
                                Book Now
                            </Button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? (
                                <X className="text-white" />
                            ) : (
                                <Menu className="text-white" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Decorative Border Bottom */}

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-[#1C1917] border-t border-stone-800 p-6 md:hidden animate-in slide-in-from-top-5">
                    <div className="flex flex-col space-y-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-stone-200 font-medium text-lg hover:text-brand-secondary"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <Button className="w-full" variant="secondary">Book Your Stay</Button>
                    </div>
                </div>
            )}
        </nav>
    );
}
