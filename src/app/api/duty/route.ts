import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            date,
            dutyType,
            location,
            reportingTime,
            assignedBy,
            staffId
        } = body;


        if (!date || !dutyType || !location) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // const staff = prisma.staff.findFirst({
        //     where: {
        //         id: staffId
        //     }
        // })
        // if (!staff) {
        //     return NextResponse.json({ error: "Staff not found" }, {
        //         status: 404
        //     })
        // }



        await prisma.staff.update({
            data: {
                status: "DUTY",
            }, where: {
                id: staffId
            }
        })
        const newDuty = await prisma.duty.create({
            data: {
                date,
                dutyType,
                location,
                reportingTime,
                assignedBy,
                staffId
            }
        })


        return NextResponse.json(newDuty, {
            status: 201
        })

    } catch (error: any) {
        console.error('Error creating duty:', error);

        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

// reliveeing time update;

//  jab tk reiveing time ni add hota staff duty pe hi rahega

export const PUT = async (request: Request) => {
    try {

        // search paramas me hm duty id fetch krnge 
        const { searchParams } = new URL(request.url);
        const dutyId = searchParams.get("dutyId");

        const body = await request.json();
        const {
            relievingTime,
            staffId
        } = body;

        if (!staffId || !relievingTime || !dutyId) {
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

        await prisma.duty.update({
            data: {
                relievingTime: relievingTime
            },
            where: {
                id: dutyId
            }
        })

        return NextResponse.json({
            message: "Duty changed"
        }, {
            status: 200
        })

    } catch (error) {
        console.error('Error creating Duty :', error);

        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}