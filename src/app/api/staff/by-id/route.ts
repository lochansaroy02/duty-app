import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const staffId = searchParams.get('staffId');

        if (!staffId) {
            return NextResponse.json({ error: 'Staff ID is required' }, { status: 400 });
        }


        const staff = await prisma.staff.findUnique({
            where: { id: staffId },
            include: {
                assignments: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                leaves: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            },
        });

        if (!staff) {
            return NextResponse.json({ error: 'staff not found' }, { status: 404 });
        }

        return NextResponse.json(staff);
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}