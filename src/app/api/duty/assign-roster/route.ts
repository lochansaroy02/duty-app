import { prisma } from '@/lib/prisma';
import { addDays } from 'date-fns';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { assignments, durationDays, assignedBy } = await request.json();

        if (!assignments || !Array.isArray(assignments)) {
            return NextResponse.json({ error: "Invalid roster format" }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
            const createdAssignments = [];

            for (const item of assignments) {
                // 1. Fetch Staff (Excel pnNo maps to DB forceNo)
                const staff = await tx.staff.findUnique({
                    where: { pnoNo: String(item.pnNo) }
                });

                // 2. Fetch Duty
                const duty = await tx.duty.findFirst({
                    where: { dutyName: item.dutyName }
                });

                if (!staff) throw new Error(`Staff with Force No ${item.pnNo} not found.`);
                if (!duty) throw new Error(`Duty '${item.dutyName}' not found in database.`);

                // 3. Capability Logic Check
                const cap = staff.capablity || 0;
                const type = duty.dutyType;

                let isValid = false;
                if (cap <= 2 && type === 'EASY') isValid = true;
                else if (cap === 3 && type === 'MEDIUM') isValid = true;
                else if (cap >= 4 && type === 'HARD') isValid = true;

                if (!isValid) {
                    throw new Error(
                        `Assignment Rejected: ${staff.name} (Cap: ${cap}) is not eligible for ${type} duty (${duty.dutyName}).`
                    );
                }

                // 4. Create Assignment
                const start = new Date();
                const end = addDays(start, durationDays || 1);

                const assignment = await tx.dutyAssign.create({
                    data: {
                        staffId: staff.id,
                        dutyId: duty.id,
                        reportingTime: start,
                        relievingTime: end,
                        assignedBy: assignedBy || "Admin"
                    }
                });

                // 5. Update Staff Status to BUSY/DUTY
                await tx.staff.update({
                    where: { id: staff.id },
                    data: { status: 'DUTY' }
                });

                createdAssignments.push(assignment);
            }
            return createdAssignments;
        });

        return NextResponse.json({ count: result.length }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}