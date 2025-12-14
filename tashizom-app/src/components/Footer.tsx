import Link from "next/link";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-brand-dark text-stone-300 py-12">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link href="/" className="flex flex-col items-start group">
                            <span className="font-serif text-2xl font-bold text-white tracking-tight">
                                TashiZom
                            </span>
                            <span className="text-[10px] uppercase tracking-widest text-brand-secondary">
                                Home Stay
                            </span>
                        </Link>
                        <p className="text-sm leading-relaxed max-w-xs">
                            A premium Himalayan retreat offering tailored experiences, authentic hospitality, and breathtaking views.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-serif text-lg font-bold text-white mb-4">Explore</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/rooms" className="hover:text-brand-secondary transition-colors">Our Rooms</Link></li>
                            <li><Link href="/about" className="hover:text-brand-secondary transition-colors">About Us</Link></li>
                            <li><Link href="/gallery" className="hover:text-brand-secondary transition-colors">Gallery</Link></li>
                            <li><Link href="/contact" className="hover:text-brand-secondary transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-serif text-lg font-bold text-white mb-4">Contact Us</h4>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start gap-3">
                                <MapPin size={18} className="text-brand-secondary shrink-0 mt-0.5" />
                                <span>
                                    Village TashiZom, Near Kaza,<br />
                                    Spiti Valley, Himachal Pradesh,<br />
                                    India - 172114
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone size={18} className="text-brand-secondary shrink-0" />
                                <span>+91 98765 43210</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={18} className="text-brand-secondary shrink-0" />
                                <span>stay@tashizom.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Social */}
                    <div>
                        <h4 className="font-serif text-lg font-bold text-white mb-4">Follow Us</h4>
                        <div className="flex space-x-4">
                            <a href="#" className="p-2 bg-stone-800 rounded-full hover:bg-brand-secondary hover:text-white transition-colors">
                                <Instagram size={20} />
                            </a>
                            <a href="#" className="p-2 bg-stone-800 rounded-full hover:bg-brand-secondary hover:text-white transition-colors">
                                <Facebook size={20} />
                            </a>
                            <a href="#" className="p-2 bg-stone-800 rounded-full hover:bg-brand-secondary hover:text-white transition-colors">
                                <Twitter size={20} />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-stone-800 mt-12 pt-8 text-center text-xs text-stone-500">
                    <p>© {new Date().getFullYear()} TashiZom Home Stay. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
