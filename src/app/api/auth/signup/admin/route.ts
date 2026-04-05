import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    try {
        const body = await req.json();
        const { name, email, password } = body;
        if (!name || !email || !password) {
            return NextResponse.json(
                { success: false, error: "Name, email, and password are required" },
                { status: 400 }
            );
        }
        const existingAdmin = await prisma.admin.findUnique({ where: { email } });
        if (existingAdmin) {
            return NextResponse.json(
                { success: false, error: "Admin with this email already exists" },
                { status: 409 }
            );
        }
        const newAdmin = await prisma.admin.create({
            data: {
                name,
                email,
                password: await bcrypt.hash(password, 10),
            },
        });
        return NextResponse.json({ success: true, data: newAdmin }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: "Failed to create admin" },
            { status: 400 }
        );
    }


};
