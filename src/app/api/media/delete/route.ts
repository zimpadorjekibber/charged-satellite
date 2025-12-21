
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
    try {
        const { filePath } = await request.json();

        if (!filePath) {
            return NextResponse.json({ error: 'File path required' }, { status: 400 });
        }

        // Security check: Ensure path is within public folder and not traversing up
        const publicDir = path.join(process.cwd(), 'public');
        // Remove leading slash if present to join correctly
        const safeFilePath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
        const absolutePath = path.join(publicDir, safeFilePath);

        // Normalize paths to check containment
        const normalizedPublic = path.normalize(publicDir);
        const normalizedTarget = path.normalize(absolutePath);

        if (!normalizedTarget.startsWith(normalizedPublic)) {
            return NextResponse.json({ error: 'Invalid path: Forbidden' }, { status: 403 });
        }

        // Delete File
        if (fs.existsSync(normalizedTarget)) {
            try {
                fs.unlinkSync(normalizedTarget);
                console.log('Deleted file:', normalizedTarget);
            } catch (err) {
                console.error('Error deleting file:', err);
                return NextResponse.json({ error: 'Failed to delete file from disk' }, { status: 500 });
            }
        } else {
            console.warn('File to delete not found on disk:', normalizedTarget);
            // We proceed to clean manifest anyway
        }

        // Update Manifest
        const manifestPath = path.join(process.cwd(), 'public', 'gallery-manifest.json');
        if (fs.existsSync(manifestPath)) {
            try {
                const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
                let manifest = JSON.parse(manifestContent);

                // Filter out the deleted file
                // Match exact path or path with leading slash
                const initialLength = manifest.length;
                manifest = manifest.filter((item: any) => {
                    const itemPath = item.path.startsWith('/') ? item.path : `/${item.path}`;
                    const targetPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
                    return itemPath !== targetPath;
                });

                if (manifest.length !== initialLength) {
                    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
                    console.log('Updated manifest');
                }
            } catch (err) {
                console.error('Error updating manifest:', err);
                // Non-critical if manifest update fails but file is gone, but good to report
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete API error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
