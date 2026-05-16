import { prisma } from "@/lib/prisma";

interface VerifyEmailPageProps {
    searchParams: Promise<{
        token?: string;
    }>;
}

export default async function VerifyEmailPage({
    searchParams,
}: VerifyEmailPageProps) {
    const { token } = await searchParams;

    // Missing token
    if (!token) {
        return (
            <div>
                <h1>Invalid verification link</h1>
            </div>
        );
    }

    // Find token in DB
    const existingToken =
        await prisma.verificationToken.findUnique({
            where: {
                token,
            },
        });

    // Invalid token
    if (!existingToken) {
        return (
            <div>
                <h1>Invalid or expired token</h1>
            </div>
        );
    }

    // Expired token
    const hasExpired =
        new Date(existingToken.expires) < new Date();

    if (hasExpired) {
        return (
            <div>
                <h1>Token has expired</h1>
            </div>
        );
    }

    // Find user
    const user = await prisma.user.findUnique({
        where: {
            email: existingToken.identifier,
        },
    });

    // Missing user
    if (!user) {
        return (
            <div>
                <h1>User not found</h1>
            </div>
        );
    }

    // Mark email verified
    await prisma.user.update({
        where: {
            id: user.id,
        },
        data: {
            emailVerified: new Date(),
        },
    });

    // Delete token
    await prisma.verificationToken.delete({
        where: {
            token,
        },
    });

    return (
        <div>
            <h1>Email verified successfully</h1>

            <p>
                Your account is now verified.
            </p>
        </div>
    );
}