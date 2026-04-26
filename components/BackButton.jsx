"use client";

import { useRouter } from "next/navigation";
import "../styles/BackButton.css"

export default function BackButton() {
    const router = useRouter();

    return (
        <div style={{textAlign: 'center'}}>
            <button className="back-button" onClick={() => router.push('/')}>
                ← Back to Home
            </button>
        </div>
    );
}
