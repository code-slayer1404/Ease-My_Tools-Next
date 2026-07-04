import Login from "@/components/Login"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "EaseMyTools - Login",
    description: "Login to your EaseMyTools account.",
}

export default function Page() {
    return <Login />
}
