
'use client';

import Link from 'next/link';
import { ChefHat, List, BellRing, LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function StaffLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-neutral-900 flex flex-col md:flex-row">
            {/* Sidebar for Desktop / Bottom bar for mobile */}
            <aside className="md:w-64 bg-neutral-950 border-r border-white/5 flex flex-col justify-between">
                <div className="p-6">
                    <div className="flex items-center gap-3 text-tashi-accent mb-8">
                        <ChefHat size={32} />
                        <span className="font-bold font-serif text-xl">Staff Portal</span>
                    </div>

                    <nav className="space-y-2">
                        <NavLink href="/staff/dashboard" icon={<List size={20} />} active={pathname.includes('dashboard')}>
                            Orders Board
                        </NavLink>
                        <NavLink href="/staff/notifications" icon={<BellRing size={20} />} active={pathname.includes('notifications')}>
                            Notifications
                        </NavLink>
                    </nav>
                </div>

                <div className="p-6">
                    <Link href="/" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                        <LogOut size={20} />
                        <span>Exit</span>
                    </Link>
                </div>
            </aside>

            <main className="flex-1 p-6 md:p-10 overflow-auto">
                {children}
            </main>
        </div>
    );
}

function NavLink({ href, icon, children, active }: any) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-tashi-primary text-white font-medium' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
        >
            {icon}
            <span>{children}</span>
        </Link>
    );
}
