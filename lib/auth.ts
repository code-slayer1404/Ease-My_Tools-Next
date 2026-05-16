import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth-options";

export async function getAuthSession() {
    return await getServerSession(authOptions);
}

export async function requireAdmin() {
    const session = await getAuthSession();

    if (session?.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    return session;
}

export async function requirePremium() {
    const session = await getAuthSession();

    if (
        session?.user.role !== "PREMIUM" &&
        session?.user.role !== "ADMIN"
    ) {
        throw new Error("Premium required");
    }

    return session;
}