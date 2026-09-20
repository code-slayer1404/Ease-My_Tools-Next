// "use client"

// import React, { useState } from "react"
// import styles from "./styles.module.css"
// import NoPreflightWrapper from "../NoPreflightWrapper"

// const NewsletterSection = () => {
//     const [email, setEmail] = useState("")

//     const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//         e.preventDefault()
//         // Handle newsletter subscription
//         console.log("Newsletter subscription:", email)
//         alert("Thank you for subscribing!")
//         setEmail("")
//     }

//     return (
//         <NoPreflightWrapper>
//             <section className={styles["newsletter-section"]}>
//                 <div className={`container`}>
//                     <div className={styles["newsletter-content"]}>
//                         <h3>{"Stay Updated"}</h3>
//                         <p>{"Get notified about new tools and features"}</p>
//                         <form
//                             onSubmit={handleSubmit}
//                             className={styles["newsletter-form"]}
//                         >
//                             <input
//                                 type="email"
//                                 placeholder={"Enter your email"}
//                                 value={email}
//                                 // className="md:ml-5"
//                                 onChange={(
//                                     e: React.ChangeEvent<HTMLInputElement>
//                                 ) => setEmail(e.target.value)}
//                                 required
//                             />
//                             <button type="submit">{"Subscribe"}</button>
//                         </form>
//                         <small>
//                             {
//                                 "We respect your privacy. Unsubscribe at any time."
//                             }
//                         </small>
//                     </div>
//                 </div>
//             </section>
//         </NoPreflightWrapper>
//     )
// }

// export default NewsletterSection



// "use client"

// import React, { useState } from "react"
// import styles from "./styles.module.css"
// import NoPreflightWrapper from "../NoPreflightWrapper"

// const NewsletterSection = () => {
//     const [email, setEmail] = useState("")

//     const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//         e.preventDefault()
//         console.log("Newsletter subscription:", email)
//         alert("Thank you for subscribing!")
//         setEmail("")
//     }

//     return (
//         <NoPreflightWrapper>
//             <section className={styles["newsletter-section"]}>
//                 <div className="mx-auto max-w-4xl px-4 text-center text-white">
//                     <h3 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
//                         Stay Updated
//                     </h3>
//                     <p className="mt-2 text-sm text-white/90 sm:mt-3 sm:text-base">
//                         Get notified about new tools and features
//                     </p>

//                     {/* Image ke mutabiq Styled Form */}
//                     <form
//                         onSubmit={handleSubmit}
//                         className="mx-auto mt-6 flex max-w-lg flex-col items-center justify-center gap-3 sm:mt-8 sm:flex-row"
//                     >
//                         <input
//                             type="email"
//                             placeholder="Enter your email"
//                             value={email}
//                             onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//                                 setEmail(e.target.value)
//                             }
//                             required
//                             className="h-11 w-full rounded-xl bg-black/40 px-4 text-sm text-white placeholder-white/60 outline-none backdrop-blur-sm transition-all focus:ring-2 focus:ring-white/50 sm:w-80"
//                         />
//                         <button
//                             type="submit"
//                             className="h-11 w-full rounded-xl bg-white px-7 text-sm font-semibold text-gray-900 shadow-md transition-all hover:bg-white/90 sm:w-auto"
//                         >
//                             Subscribe
//                         </button>
//                     </form>

//                     <small className="mt-4 block text-xs text-white/80">
//                         We respect your privacy. Unsubscribe at any time.
//                     </small>
//                 </div>
//             </section>
//         </NoPreflightWrapper>
//     )
// }

// export default NewsletterSection







"use client"

import React, { useState } from "react"
import styles from "./styles.module.css"
import NoPreflightWrapper from "../NoPreflightWrapper"

const NewsletterSection = () => {
    const [email, setEmail] = useState("")

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        console.log("Newsletter subscription:", email)
        alert("Thank you for subscribing!")
        setEmail("")
    }

    return (
        <NoPreflightWrapper>
            <section className={styles["newsletter-section"]}>
                <div className="mx-auto max-w-4xl px-4 text-center text-white">
                    <h3 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        Stay Updated
                    </h3>
                    <p className="mt-2 text-sm text-white/90 sm:mt-3 sm:text-base">
                        Get notified about new tools and features
                    </p>

                    {/* Form */}
                    <form
                        onSubmit={handleSubmit}
                        className="mx-auto mt-6 flex max-w-lg flex-col items-center justify-center gap-3 sm:mt-8 sm:flex-row"
                    >
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setEmail(e.target.value)
                            }
                            required
                            className="h-11 w-full rounded-xl !border-0 !bg-black/35 px-4 text-sm !text-white !placeholder-white/70 outline-none backdrop-blur-sm transition-all focus:!ring-2 focus:!ring-white/50 sm:w-80"
                        />
                        <button
                            type="submit"
                            className="h-11 w-full rounded-xl !border-0 !bg-white px-7 text-sm font-semibold !text-gray-900 shadow-md transition-all hover:!bg-white/90 sm:w-auto"
                        >
                            Subscribe
                        </button>
                    </form>

                    <small className="mt-4 block text-xs text-white/80">
                        We respect your privacy. Unsubscribe at any time.
                    </small>
                </div>
            </section>
        </NoPreflightWrapper>
    )
}

export default NewsletterSection