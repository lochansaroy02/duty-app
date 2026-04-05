import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    try {
        const body = await req.json();
        // role will be  passed by user-end 
        const { name, email, password, rank, stationName, type, adminId } = body;
        if (!name || !email || !password || !adminId) {
            return NextResponse.json(
                { success: false, error: "Name, email, password, and adminId are required" },
                { status: 400 }
            );
        }
        const existingPoliceStation = await prisma.station.findUnique({ where: { email } });
        if (existingPoliceStation) {
            return NextResponse.json(
                { success: false, error: "Police station with this email already exists" },
                { status: 409 }
            );
        }
        const newPoliceStation = await prisma.station.create({
            data: {
                name,
                email,
                password: await bcrypt.hash(password, 10),

                rank,
                stationName,
                type,
                adminId,
            },
        });
        return NextResponse.json({ success: true, data: newPoliceStation }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: "Failed to create police station" },
            { status: 400 }
        );
    }


};
