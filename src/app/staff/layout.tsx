import { Metadata } from 'next';
import StaffShell from './StaffShell';

export const metadata: Metadata = {
    title: 'TashiZom Staff Portal',
    manifest: '/staff-manifest.json',
};

export default function StaffLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <StaffShell>{children}</StaffShell>;
}
