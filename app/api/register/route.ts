import { NextResponse } from "next/server";

import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/mail";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const { name, email, password } = body;

        // Basic validation
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Missing fields" },
                { status: 400 }
            );
        }

        // Existing user check
        const existingUser = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "User already exists" },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "USER",
            },
        });

        // Generate verification token
        const verificationToken = uuidv4();

        // Token expiry (24 hours)
        const expires = new Date(
            Date.now() + 24 * 60 * 60 * 1000
        );

        // Store token in DB
        await prisma.verificationToken.create({
            data: {
                identifier: email,
                token: verificationToken,
                expires,
            },
        });

        // Verification link
        const verifyUrl =
            `${process.env.NEXTAUTH_URL}` +
            `/verify-email?token=${verificationToken}`;

        // Send email
        await resend.emails.send({
            from: "noreply@easemytools.com",
            to: email,
            subject: "Verify your email",
            html: `
        <h2>Verify your email</h2>

        <p>
          Click the link below to verify your account:
        </p>

        <a href="${verifyUrl}">
          Verify Email
        </a>
      `,
        });

        return NextResponse.json({
            message:
                "Registration successful. Please verify your email.",
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}