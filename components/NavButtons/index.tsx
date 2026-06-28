"use client"

import { useRouter } from "next/navigation"
import styles from "./styles.module.css"

export default function NavButtons() {
    const router = useRouter()

    return (
        <div className={styles["button-container"]}>
            <button
                className={styles["nav-button"]}
                onClick={() => router.back()}
            >
                Go Back
            </button>
        </div>
    )
}
