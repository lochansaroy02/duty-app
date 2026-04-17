import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const dutiesArray = Array.isArray(body) ? body : [body];

        if (dutiesArray.length === 0) {
            return NextResponse.json(
                { error: 'No duty data provided' },
                { status: 400 }
            );
        }

        const isValid = dutiesArray.every(item =>
            item.dutyName && item.dutyType && item.location && item.stationId
        );

        if (!isValid) {
            return NextResponse.json(
                { error: 'One or more objects are missing required fields (dutyName, dutyType, location, stationId)' },
                { status: 400 }
            );
        }

        const result = await prisma.duty.createMany({
            data: dutiesArray.map((duty: any) => ({
                dutyName: duty.dutyName,
                dutyType: duty.dutyType,
                location: duty.location,
                stationId: duty.stationId,
            })),
            skipDuplicates: true,
        });

        return NextResponse.json({
            message: `Successfully processed ${dutiesArray.length} entries.`,
            count: result.count
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating duties:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error.message },
            { status: 500 }
        );
    }
}

// FIXED: Removed 'res' parameter and added error handling return
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const stationId = searchParams.get("stationId");

        const duties = await prisma.duty.findMany({
            where: {
                stationId: stationId || undefined // Handles null cases
            }
        });

        return NextResponse.json(
            { data: duties },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('Error fetching duties:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error.message },
            { status: 500 }
        );
    }
}