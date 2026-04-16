import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // 1. Normalize input to an array
        const staffData = Array.isArray(body) ? body : [body];

        if (staffData.length === 0) {
            return NextResponse.json({ error: 'No staff data provided' }, { status: 400 });
        }

        // 2. Validation: Check required fields for every entry
        const isValid = staffData.every(s => s.name && s.forceNo && s.rank && s.stationId);
        if (!isValid) {
            return NextResponse.json({
                error: 'Missing required fields (name, forceNo, rank, stationId) in one or more entries'
            }, { status: 400 });
        }

        // 3. Bulk Insert
        const result = await prisma.staff.createMany({
            data: staffData.map(s => ({
                name: s.name,
                pnoNo: s.forceNo,
                rank: s.rank,
                mobileNumber: s.mobileNumber,
                stationId: s.stationId,
                capablity: s.capablity ? parseInt(s.capablity) : null,
                condition: s.condition || 'NORMAL',
            })),
            skipDuplicates: true, // Prevents crash if a forceNo already exists
        });

        return NextResponse.json({
            message: `Successfully processed ${staffData.length} staff records.`,
            count: result.count
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating staff:', error);

        // Prisma Error Handling
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'One or more Force Numbers already exist.' }, { status: 409 });
        }
        if (error.code === 'P2003') {
            return NextResponse.json({ error: 'One or more Station IDs do not exist.' }, { status: 400 });
        }

        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export const GET = async (req: NextRequest) => {
    try {
        const { searchParams } = new URL(req.url);
        const stationId = searchParams.get("stationId");

        if (!stationId) {
            return NextResponse.json({ message: "Please provide stationId" }, { status: 400 });
        }

        const data = await prisma.staff.findMany({
            where: { stationId },
            include: {
                // If you used the DutyAssign model we created earlier, 
                // the relation name in Staff was 'assignments'
                assignments: true,
                leaves: true,
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        console.error("Failed to fetch staff:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};