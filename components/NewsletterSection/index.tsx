"use client"

import React, { useState } from "react"
import styles from "./styles.module.css"
import NoPreflightWrapper from "../NoPreflightWrapper"

const NewsletterSection = () => {
    const [email, setEmail] = useState("")

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        // Handle newsletter subscription
        console.log("Newsletter subscription:", email)
        alert("Thank you for subscribing!")
        setEmail("")
    }

    return (
        <NoPreflightWrapper>
            <section className={styles["newsletter-section"]}>
                <div className={`container`}>
                    <div className={styles["newsletter-content"]}>
                        <h3>{"Stay Updated"}</h3>
                        <p>{"Get notified about new tools and features"}</p>
                        <form
                            onSubmit={handleSubmit}
                            className={styles["newsletter-form"]}
                        >
                            <input
                                type="email"
                                placeholder={"Enter your email"}
                                value={email}
                                // className="md:ml-5"
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                ) => setEmail(e.target.value)}
                                required
                            />
                            <button type="submit">{"Subscribe"}</button>
                        </form>
                        <small>
                            {
                                "We respect your privacy. Unsubscribe at any time."
                            }
                        </small>
                    </div>
                </div>
            </section>
        </NoPreflightWrapper>
    )
}

export default NewsletterSection
