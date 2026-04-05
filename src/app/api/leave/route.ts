import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            leaveType,
            fromDate,
            approvedBy,
            staffId
        } = body;


        if (!leaveType || !fromDate || !approvedBy || !staffId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await prisma.staff.update({
            data: {
                status: "LEAVE",
            }, where: {
                id: staffId
            }
        })
        const newDuty = await prisma.leave.create({
            data: {
                leaveType,
                fromDate,
                approvedBy,
                staffId
            }
        })


        return NextResponse.json(newDuty, {
            status: 201
        })

    } catch (error: any) {
        console.error('Error creating leave details:', error);

        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}



export const PUT = async (request: Request) => {
    try {

        // search paramas me hm duty id fetch krnge 
        const { searchParams } = new URL(request.url);
        const leaveId = searchParams.get("leaveId");

        const body = await request.json();
        const {
            toDate,
            staffId
        } = body;
        console.log(body);

        if (!staffId || !toDate || !leaveId) {
            return NextResponse.json({
                message: "please provide all requiered details"
            })
        }
        await prisma.staff.update({
            data: {
                status: "AVAILABLE",
            }, where: {
                id: staffId
            }
        })

        await prisma.leave.update({
            data: {
                toDate: toDate
            },
            where: {
                id: leaveId
            }
        })

        return NextResponse.json({
            message: "Leave changed"
        }, {
            status: 200
        })

    } catch (error) {
        console.error('Error creating leave:', error);

        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}