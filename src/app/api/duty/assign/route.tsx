import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const pnoNo = searchParams.get("pnoNo");
        const body = await request.json();
        const { reportingTime, assignedBy } = body;

        // 1. Validation
        if (!pnoNo || !reportingTime) {
            return NextResponse.json({ error: 'Staff ID and Reporting Time are required' }, { status: 400 });
        }

        // 2. Fetch Staff and check capability
        const user = await prisma.staff.findUnique({
            where: { pnoNo: pnoNo }
        });

        if (!user) {
            return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
        }

        // Use the correct spelling (check your schema if it's 'capablity' or 'capability')
        const capability = user.capablity ?? (user as any).capablity;

        if (capability === undefined || capability === null) {
            return NextResponse.json({ error: 'This user does not have a defined capability level' }, { status: 400 });
        }

        // 3. Map Capability to Duty Type
        let requiredType: 'EASY' | 'MEDIUM' | 'HARD';
        if (capability <= 2) requiredType = 'EASY';
        else if (capability === 3) requiredType = 'MEDIUM';
        else requiredType = 'HARD';

        // 4. Find Available Duty (excluding the one they just did)
        const duty = await prisma.duty.findFirst({
            where: {
                dutyType: requiredType,
                NOT: {
                    id: user.lastDutyId || undefined
                }
            },
        });

        if (!duty) {
            return NextResponse.json({
                error: `No ${requiredType} duty available that differs from the last assigned duty.`
            }, { status: 404 });
        }

        // 5. Execute Assignment in a Transaction
        const result = await prisma.$transaction(async (tx) => {
            const assignment = await tx.dutyAssign.create({
                data: {
                    dutyId: duty.id,
                    staffId: user.id,
                    reportingTime: new Date(reportingTime),
                    assignedBy,
                }
            });

            await tx.staff.update({
                where: { pnoNo: pnoNo },
                data: {
                    lastDutyId: duty.id,
                    status: "DUTY"
                }
            });

            return assignment;
        });

        return NextResponse.json(result, { status: 201 });

    } catch (error: any) {
        console.error("DUTY_ASSIGNMENT_ERROR:", error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}