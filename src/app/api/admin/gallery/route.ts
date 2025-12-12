
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DIRS = [
    { path: 'public/gallery', urlPrefix: '/gallery' },
    { path: 'public/gallery-uploads', urlPrefix: '/gallery-uploads' },
    { path: 'public/images/placeholders', urlPrefix: '/images/placeholders' }
];

export async function GET() {
    try {
        const projectRoot = process.cwd();
        let allImages: any[] = [];

        DIRS.forEach(dirInfo => {
            const fullDir = path.join(projectRoot, dirInfo.path);

            if (fs.existsSync(fullDir)) {
                const files = fs.readdirSync(fullDir);
                const images = files.filter(file => {
                    const ext = path.extname(file).toLowerCase();
                    return ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'].includes(ext);
                }).map(file => ({
                    name: file,
                    path: `${dirInfo.urlPrefix}/${file}`,
                    size: fs.statSync(path.join(fullDir, file)).size,
                    source: dirInfo.urlPrefix.replace('/', ''),
                    absolutePath: path.join(dirInfo.path, file) // Relative to project root
                }));
                allImages = allImages.concat(images);
            }
        });

        return NextResponse.json(allImages);
    } catch (error) {
        console.error('Error reading gallery:', error);
        return NextResponse.json({ error: 'Failed to read gallery' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { filePath } = await request.json();

        if (!filePath) {
            return NextResponse.json({ error: 'File path required' }, { status: 400 });
        }

        // Security check: Ensure path is within public folder
        const normalizedPath = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, '');
        const fullPath = path.join(process.cwd(), 'public', normalizedPath); // Assumes filePath is like 'gallery/foo.png' or '/gallery/foo.png'

        // Handle the leading slash if present in the stored path e.g. "/gallery/foo.png"
        const cleanRelativePath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
        const targetPath = path.join(process.cwd(), 'public', cleanRelativePath);

        if (!fs.existsSync(targetPath)) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        fs.unlinkSync(targetPath);

        return NextResponse.json({ success: true, deleted: cleanRelativePath });

    } catch (error) {
        console.error('Error deleting file:', error);
        return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
    }
}
