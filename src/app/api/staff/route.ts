import { prisma } from '@/lib/prisma'; // Adjust path based on your setup
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const {
            name,
            forceNo,
            rank,
            mobileNumber,
            stationId
        } = body;

        // 1. Basic Validation
        if (!name || !forceNo || !rank) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newStaff = await prisma.staff.create({
            data: {
                name, forceNo, rank, mobileNumber, stationId
            }
        });

        return NextResponse.json(newStaff, { status: 201 });
    } catch (error: any) {
        console.error('Error creating staff:', error);

        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'A staff  with this force number already exists.' },
                { status: 409 }
            );
        }
        if (error.code === 'P2003') {
            return NextResponse.json(
                { error: 'The police station id doesnt exist in database' },
                { status: 409 }
            );
        }



        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export const GET = async (req: NextRequest) => {
    try {
        const { searchParams } = new URL(req.url);
        const stationId = searchParams.get("stationId");

        if (!stationId) {
            return NextResponse.json({ message: " Please provide station Id " })
        }
        const data = await prisma.staff.findMany({

            include: {
                duties: true,
                leaves: true,
            },
            where: {
                stationId: stationId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Correct syntax: pass the object directly, status 200 for successful fetch
        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        console.error("Failed to fetch staff:", error);

        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
};