import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { MapPin, Phone, Mail } from "lucide-react";

export const metadata = {
    title: "Contact Us | TashiZom Home Stay",
};

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-stone-50 flex flex-col">
            <Navbar />

            <div className="bg-brand-dark pt-32 pb-16 px-4">
                <div className="container mx-auto text-center">
                    <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">Contact Us</h1>
                    <p className="text-stone-400 max-w-2xl mx-auto">
                        We are here to help you plan your perfect Himalayan getaway.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16 flex-grow">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="font-serif text-2xl font-bold text-stone-900 mb-6">Get in Touch</h2>
                            <p className="text-stone-600 mb-8">
                                Have questions about the weather, road conditions, or customization of your stay?
                                Feel free to reach out to us directly.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="bg-brand-primary/10 p-3 rounded-full text-brand-primary">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-stone-900">Our Location</h3>
                                    <p className="text-stone-600">
                                        Village TashiZom, Near Kaza,<br />
                                        Spiti Valley, Himachal Pradesh, 172114
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-brand-primary/10 p-3 rounded-full text-brand-primary">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-stone-900">Phone & WhatsApp</h3>
                                    <p className="text-stone-600">+91 98765 43210</p>
                                    <p className="text-stone-500 text-xs mt-1">Available 9 AM - 8 PM</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-brand-primary/10 p-3 rounded-full text-brand-primary">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-stone-900">Email</h3>
                                    <p className="text-stone-600">stay@tashizom.com</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100">
                        <h3 className="font-serif text-xl font-bold text-stone-900 mb-6">Send a Message</h3>
                        <form className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" placeholder="Name" className="w-full px-4 py-3 border border-stone-200 rounded-md outline-none focus:border-brand-secondary" />
                                <input type="email" placeholder="Email" className="w-full px-4 py-3 border border-stone-200 rounded-md outline-none focus:border-brand-secondary" />
                            </div>
                            <input type="tel" placeholder="Phone" className="w-full px-4 py-3 border border-stone-200 rounded-md outline-none focus:border-brand-secondary" />
                            <textarea placeholder="Message" rows={4} className="w-full px-4 py-3 border border-stone-200 rounded-md outline-none focus:border-brand-secondary"></textarea>
                            <Button className="w-full py-3">SendMessage</Button>
                        </form>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
