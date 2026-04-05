import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
export const POST = async (req: NextRequest) => {
    try {

        const body = await req.json();
        const { email, password, role } = body;
        if (!email || !password || !role) {
            return NextResponse.json({ success: false, error: "Required fields missing" }, { status: 400 });
        }
        let user
        if (role === "ADMIN") {
            user = await prisma.admin.findUnique({ where: { email } });
        } else if (role === "STATION") {
            user = await prisma.station.findUnique({ where: { email } });
            console.log(user);
        } else {
            return NextResponse.json({ success: false, error: "Invalid role" }, { status: 400 });
        }
        if (!user) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ success: false, error: "Invalid password" }, { status: 400 });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name,

                // stationName: user.stationName

            },
            process.env.JWT_TOKEN as string,
            { expiresIn: "7d" }
        );

        const userResponse = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            //here
            ...(role === "STATION" && "stationName" in user ? {
                stationName: user.stationName,

            } : {})
        };
        return NextResponse.json({ success: true, token, user: userResponse });
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ success: false, error: "Internal Error" }, { status: 500 });
    }
};