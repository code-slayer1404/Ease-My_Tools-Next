import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
    try {
        const data = await resend.emails.send({
            from: "noreply@easemytools.com",
            to: "easemytools@gmail.com",
            subject: "Resend Test Email",
            html: `
        <h1>Resend is working</h1>
        <p>Your domain and API are configured correctly.</p>
      `,
        });

        return NextResponse.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                error,
            },
            { status: 500 }
        );
    }
}