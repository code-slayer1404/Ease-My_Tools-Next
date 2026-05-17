// import { NextResponse } from "next/server";

// import bcrypt from "bcryptjs";
// import { v4 as uuidv4 } from "uuid";

// import { prisma } from "@/lib/prisma";
// import { resend } from "@/lib/mail";

// export async function POST(req: Request) {
//     try {
//         const body = await req.json();

//         const { name, email, password } = body;

//         // Basic validation
//         if (!name || !email || !password) {
//             return NextResponse.json(
//                 { error: "Missing fields" },
//                 { status: 400 }
//             );
//         }

//         // Existing user check
//         const existingUser = await prisma.user.findUnique({
//             where: {
//                 email,
//             },
//         });

//         if (existingUser) {
//             return NextResponse.json(
//                 { error: "User already exists" },
//                 { status: 400 }
//             );
//         }

//         // Hash password
//         const hashedPassword = await bcrypt.hash(password, 12);

//         // Create user
//         const user = await prisma.user.create({
//             data: {
//                 name,
//                 email,
//                 password: hashedPassword,
//                 role: "USER",
//             },
//         });

//         // Generate verification token
//         const verificationToken = uuidv4();

//         // Token expiry (24 hours)
//         const expires = new Date(
//             Date.now() + 24 * 60 * 60 * 1000
//         );

//         // Store token in DB
//         await prisma.verificationToken.create({
//             data: {
//                 identifier: email,
//                 token: verificationToken,
//                 expires,
//             },
//         });

//         // Verification link
//         const verifyUrl =
//             `${process.env.NEXTAUTH_URL}` +
//             `/verify-email?token=${verificationToken}`;

//         // Send email
//         await resend.emails.send({
//             from: "noreply@easemytools.com",
//             to: email,
//             subject: "Verify your email",
//             html: `
//         <h2>Verify your email</h2>

//         <p>
//           Click the link below to verify your account:
//         </p>

//         <a href="${verifyUrl}">
//           Verify Email
//         </a>
//       `,
//         });

//         return NextResponse.json({
//             message:
//                 "Registration successful. Please verify your email.",
//         });
//     } catch (error) {
//         console.error(error);

//         return NextResponse.json(
//             { error: "Something went wrong" },
//             { status: 500 }
//         );
//     }
// }






import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/mail";

// Professional email template component
const getVerificationEmailTemplate = (name: string, verifyUrl: string) => {
  const currentYear = new Date().getFullYear();
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f4f4f5;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          padding: 30px 20px 20px;
          border-bottom: 2px solid #e4e4e7;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #3b82f6;
          margin-bottom: 10px;
        }
        .content {
          padding: 30px 20px;
        }
        .greeting {
          font-size: 24px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 20px;
        }
        .message {
          color: #4b5563;
          margin-bottom: 24px;
          font-size: 16px;
        }
        .button-container {
          text-align: center;
          margin: 32px 0;
        }
        .verify-button {
          display: inline-block;
          background-color: #3b82f6;
          color: #ffffff !important;
          text-decoration: none;
          padding: 12px 32px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          transition: background-color 0.3s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .verify-button:hover {
          background-color: #2563eb;
        }
        .fallback-link {
          margin-top: 24px;
          padding: 16px;
          background-color: #f9fafb;
          border-radius: 8px;
          font-size: 14px;
          color: #6b7280;
          word-break: break-all;
        }
        .footer {
          text-align: center;
          padding: 20px;
          border-top: 1px solid #e4e4e7;
          font-size: 12px;
          color: #9ca3af;
        }
        .footer a {
          color: #3b82f6;
          text-decoration: none;
        }
        @media only screen and (max-width: 600px) {
          .container {
            width: 100%;
            border-radius: 0;
          }
          .verify-button {
            display: block;
            text-align: center;
          }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 20px; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      <div class="container">
        <div class="header">
          <div class="logo">EaseMyTools</div>
        </div>
        
        <div class="content">
          <div class="greeting">
            Hello${name ? `, ${name}` : ''}!
          </div>
          
          <div class="message">
            Thank you for registering with <strong>EaseMyTools</strong>. Please verify your email address to complete your registration and access all features of our platform.
          </div>
          
          <div class="button-container">
            <a href="${verifyUrl}" class="verify-button">
              Verify Email Address
            </a>
          </div>
          
          <div class="message" style="font-size: 14px; color: #6b7280;">
            This verification link will expire in <strong>24 hours</strong>.
          </div>
          
          <div class="fallback-link">
            <strong>Having trouble clicking the button?</strong><br>
            Copy and paste this URL into your browser:<br>
            <a href="${verifyUrl}" style="color: #3b82f6; word-break: break-all;">${verifyUrl}</a>
          </div>
          
          <div class="message" style="font-size: 14px; margin-top: 24px; padding: 16px; background-color: #fef2f2; border-left: 4px solid #ef4444; color: #991b1b;">
            <strong>⚠️ Didn't request this?</strong><br>
            If you didn't create an account with EaseMyTools, please ignore this email. No further action is required.
          </div>
        </div>
        
        <div class="footer">
          <p>&copy; ${currentYear} EaseMyTools. All rights reserved.</p>
          <p>
            <a href="${process.env.NEXTAUTH_URL}/privacy">Privacy Policy</a> | 
            <a href="${process.env.NEXTAUTH_URL}/terms">Terms of Service</a> | 
            <a href="${process.env.NEXTAUTH_URL}/support">Support</a>
          </p>
          <p style="margin-top: 16px;">
            This email was sent to verify your account registration.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

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

        // Send email with professional template
        await resend.emails.send({
            from: "noreply@easemytools.com",
            to: email,
            subject: "Verify your email address - EaseMyTools",
            html: getVerificationEmailTemplate(name, verifyUrl),
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