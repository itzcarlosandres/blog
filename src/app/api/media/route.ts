import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat, unlink } from 'fs/promises';
import { join } from 'path';

export async function GET() {
    try {
        const uploadDir = join(process.cwd(), 'public', 'uploads');

        // Check if directory exists
        try {
            await readdir(uploadDir);
        } catch {
            return NextResponse.json([]);
        }

        const files = await readdir(uploadDir);

        const mediaFiles = await Promise.all(
            files.map(async (filename) => {
                const filePath = join(uploadDir, filename);
                const fileStat = await stat(filePath);

                return {
                    name: filename,
                    url: `/uploads/${filename}`,
                    size: fileStat.size,
                    createdAt: fileStat.birthtime,
                };
            })
        );

        // Sort by most recent
        mediaFiles.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        return NextResponse.json(mediaFiles);
    } catch (error) {
        console.error('Error fetching media:', error);
        return NextResponse.json({ error: 'Error fetching media' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { filename } = await request.json();
        if (!filename) {
            return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
        }

        const filePath = join(process.cwd(), 'public', 'uploads', filename);
        await unlink(filePath);

        return NextResponse.json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Error deleting media:', error);
        return NextResponse.json({ error: 'Error deleting media' }, { status: 500 });
    }
}
