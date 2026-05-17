import Link from "next/link";
import { prisma } from "@/lib/prisma";
import styles from "./page.module.css";

interface VerifyEmailPageProps {
    searchParams: Promise<{
        token?: string;
    }>;
}

type VerifyState = "success" | "invalid" | "expired" | "alreadyVerified" | "userMissing";

const stateMeta: Record<
    VerifyState,
    {
        title: string;
        description: string;
        iconClassName: string;
        iconSymbol: string;
    }
> = {
    success: {
        title: "Email verified successfully",
        description:
            "Welcome to EaseMyTools — your email is confirmed and your account is ready. Continue to sign in and start exploring your tools.",
        iconClassName: styles.success,
        iconSymbol: "✓",
    },
    alreadyVerified: {
        title: "You’re already verified",
        description:
            "Your email address has already been confirmed. You can continue to your account anytime.",
        iconClassName: styles.info,
        iconSymbol: "✓",
    },
    expired: {
        title: "Verification link expired",
        description:
            "This verification link is no longer valid. Please request a new verification email to complete setup.",
        iconClassName: styles.warning,
        iconSymbol: "!",
    },
    invalid: {
        title: "Invalid verification link",
        description:
            "The link appears invalid or has already been used. Please check your latest email or request a new verification message.",
        iconClassName: styles.error,
        iconSymbol: "×",
    },
    userMissing: {
        title: "Unable to verify account",
        description:
            "We couldn’t find a matching account for this token. Please sign in or create a new account.",
        iconClassName: styles.error,
        iconSymbol: "×",
    },
};

function VerificationCard({ state }: { state: VerifyState }) {
    const meta = stateMeta[state];

    return (
        <main className={styles.container}>
            <section className={styles.card}>
                <div className={`${styles.icon} ${meta.iconClassName}`} aria-hidden="true">
                    {meta.iconSymbol}
                </div>
                <h1 className={styles.title}>{meta.title}</h1>
                <p className={styles.description}>{meta.description}</p>

                <div className={styles.actions}>
                    <Link href="/login" className={styles.primaryBtn}>
                        Continue to Login
                    </Link>
                    <Link href="/" className={styles.secondaryBtn}>
                        Go to Dashboard/Home
                    </Link>
                </div>
            </section>
        </main>
    );
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
    const { token } = await searchParams;

    if (!token) {
        return <VerificationCard state="invalid" />;
    }

    const existingToken = await prisma.verificationToken.findUnique({
        where: {
            token,
        },
    });

    if (!existingToken) {
        return <VerificationCard state="invalid" />;
    }

    const hasExpired = new Date(existingToken.expires) < new Date();

    if (hasExpired) {
        return <VerificationCard state="expired" />;
    }

    const user = await prisma.user.findUnique({
        where: {
            email: existingToken.identifier,
        },
    });

    if (!user) {
        return <VerificationCard state="userMissing" />;
    }

    if (user.emailVerified) {
        await prisma.verificationToken.delete({
            where: {
                token,
            },
        });

        return <VerificationCard state="alreadyVerified" />;
    }

    await prisma.user.update({
        where: {
            id: user.id,
        },
        data: {
            emailVerified: new Date(),
        },
    });

    await prisma.verificationToken.delete({
        where: {
            token,
        },
    });

    return <VerificationCard state="success" />;
}
