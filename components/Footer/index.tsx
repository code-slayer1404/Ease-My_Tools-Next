// "use client"

// import Link from "next/link"
// import styles from "./styles.module.css"

// const Footer = () => {
//   console.log("Footer was rendered")

//   return (
//     <footer className={styles["footer"]}>
//       <div className={styles["footer-container"]}>
//         <div className={styles["footer-column"]}>
//           <h4>PRODUCT</h4>
//           <Link href={"/" as any}>{"Home"}</Link>
//           <Link href={"/features" as any}>{"Features"}</Link>
//           {/* <Link href={"/pricing" as any} >{"Pricing"}</Link> */}
//           <Link href={"/tools" as any}>{"Tools"}</Link>
//           <Link href={"/faq" as any}>{"FAQ"}</Link>
//         </div>

//         <div className={styles["footer-column"]}>
//           <h4>RESOURCES</h4>
//           <Link href={"/desktop" as any}>{"EaseMyTools Desktop"}</Link>
//           <Link href={"/mobile" as any}>{"EaseMyTools Mobile"}</Link>
//           {/* <Link href={"/api" as any} >{"API"}</Link> */}
//           <Link href={"/docs" as any}>{"Documentation"}</Link>
//         </div>

//         <div className={styles["footer-column"]}>
//           <h4>SOLUTIONS</h4>
//           <Link href={"/business" as any}>{"Business"}</Link>
//           <Link
//             href={"/education" as any}
//             onClick={() => {
//               window.scrollTo({ top: 0, behavior: "smooth" })
//             }}
//           >
//             {"Education"}
//           </Link>
//         </div>

//         <div className={styles["footer-column"]}>
//           <h4>LEGAL</h4>
//           <Link href={"/security" as any}>{"Security"}</Link>
//           <Link href={"/privacy-policy" as any}>{"Privacy Policy"}</Link>
//           <Link href={"/terms-conditions" as any}>{"Terms & Conditions"}</Link>
//           <Link href={"/cookie-policy" as any}>{"Cookie Policy"}</Link>
//         </div>

//         <div className={styles["footer-column"]}>
//           <h4>COMPANY</h4>
//           <Link href={"/about" as any}>{"About Us"}</Link>
//           <Link href={"/contact" as any}>{"Contact Us"}</Link>
//           <Link href={"/blog" as any}>{"Blog"}</Link>
//           {/* <Link href={"/press" as any} >{"Press"}</Link> */}
//         </div>
//       </div>

//       <hr className={styles["footer-divider"]} />

//       <div className={styles["footer-bottom"]}>
//         <div className={styles["footer-social"]}>
//           <Link
//             href={"https://twitter.com/easemytools" as any}
//             target="_blank"
//             rel="noopener noreferrer"
//             title="Twitter"
//           >
//             ✖
//           </Link>
//           <Link
//             href={"https://facebook.com/easemytools" as any}
//             target="_blank"
//             rel="noopener noreferrer"
//             title="Facebook"
//           >
//             📘
//           </Link>
//           <Link
//             href={"https://linkedin.com/company/easemytools" as any}
//             target="_blank"
//             rel="noopener noreferrer"
//             title="LinkedIn"
//           >
//             💼
//           </Link>
//           <Link
//             href={"https://instagram.com/easemytools" as any}
//             target="_blank"
//             rel="noopener noreferrer"
//             title="Instagram"
//           >
//             📸
//           </Link>
//           <Link
//             href={"https://tiktok.com/@easemytools" as any}
//             target="_blank"
//             rel="noopener noreferrer"
//             title="TikTok"
//           >
//             🎵
//           </Link>
//         </div>

//         <div className={styles["footer-copy"]}>
//           © {new Date().getFullYear()} EaseMyTools — {"All Rights Reserved"}
//         </div>
//       </div>
//     </footer>
//   )
// }

// export default Footer










"use client"

import Link from "next/link"
import {
    FaTwitter,
    FaFacebook,
    FaLinkedinIn,
    FaInstagram,
} from "react-icons/fa"
import { FaTiktok } from "react-icons/fa6"

const Footer = () => {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="border-t border-border bg-background py-12">
            <div className="mx-auto max-w-[340px] px-3 sm:max-w-screen-2xl sm:px-6 lg:px-8">
                {/* Links Grid */}
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                    {/* Removed sm:text-left and sm:items-start to keep it perfectly centered on all screen sizes */}
                    <div className="flex flex-col items-center gap-3 text-center">
                        <h4 className="text-sm font-semibold tracking-wider text-foreground uppercase">
                            Product
                        </h4>
                        <ul className="flex flex-col gap-2.5">
                            <li>
                                <Link
                                    href="/"
                                    className="text-base text-muted-foreground transition-colors hover:text-primary"
                                >
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/features"
                                    className="text-base text-muted-foreground transition-colors hover:text-primary"
                                >
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/tools"
                                    className="text-base text-muted-foreground transition-colors hover:text-primary"
                                >
                                    Tools
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/faq"
                                    className="text-base text-muted-foreground transition-colors hover:text-primary"
                                >
                                    FAQ
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="flex flex-col items-center gap-3 text-center">
                        <h4 className="text-sm font-semibold tracking-wider text-foreground uppercase">
                            Resources
                        </h4>
                        <ul className="flex flex-col gap-2.5">
                            <li>
                                <Link
                                    href="/desktop"
                                    className="text-base text-muted-foreground transition-colors hover:text-primary"
                                >
                                    EaseMyTools Desktop
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/mobile"
                                    className="text-base text-muted-foreground transition-colors hover:text-primary"
                                >
                                    EaseMyTools Mobile
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/docs"
                                    className="text-base text-muted-foreground transition-colors hover:text-primary"
                                >
                                    Documentation
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="flex flex-col items-center gap-3 text-center">
                        <h4 className="text-sm font-semibold tracking-wider text-foreground uppercase">
                            Solutions
                        </h4>
                        <ul className="flex flex-col gap-2.5">
                            <li>
                                <Link
                                    href="/business"
                                    className="text-base text-muted-foreground transition-colors hover:text-primary"
                                >
                                    Business
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/education"
                                    onClick={() =>
                                        window.scrollTo({
                                            top: 0,
                                            behavior: "smooth",
                                        })
                                    }
                                    className="text-base text-muted-foreground transition-colors hover:text-primary"
                                >
                                    Education
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="flex flex-col items-center gap-3 text-center">
                        <h4 className="text-sm font-semibold tracking-wider text-foreground uppercase">
                            Legal
                        </h4>
                        <ul className="flex flex-col gap-2.5">
                            <li>
                                <Link
                                    href="/security"
                                    className="text-base text-muted-foreground transition-colors hover:text-primary"
                                >
                                    Security
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/privacy-policy"
                                    className="text-base text-muted-foreground transition-colors hover:text-primary"
                                >
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/terms-conditions"
                                    className="text-base text-muted-foreground transition-colors hover:text-primary"
                                >
                                    Terms &amp; Conditions
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/cookie-policy"
                                    className="text-base text-muted-foreground transition-colors hover:text-primary"
                                >
                                    Cookie Policy
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="flex flex-col items-center gap-3 text-center">
                        <h4 className="text-sm font-semibold tracking-wider text-foreground uppercase">
                            Company
                        </h4>
                        <ul className="flex flex-col gap-2.5">
                            <li>
                                <Link
                                    href="/about"
                                    className="text-base text-muted-foreground transition-colors hover:text-primary"
                                >
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/contact"
                                    className="text-base text-muted-foreground transition-colors hover:text-primary"
                                >
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/blog"
                                    className="text-base text-muted-foreground transition-colors hover:text-primary"
                                >
                                    Blog
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Lean Tailwind divider */}
                <div className="my-10 h-px w-full bg-border" />

                {/* Bottom Section - Now fully centered on desktop as well */}
                <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
                    <div className="flex gap-4">
                        <Link
                            href="https://twitter.com/easemytools"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Twitter"
                        >
                            <FaTwitter className="h-5 w-5 text-muted-foreground transition-colors hover:-translate-y-0.5 hover:text-primary" />
                        </Link>
                        <Link
                            href="https://facebook.com/easemytools"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Facebook"
                        >
                            <FaFacebook className="h-5 w-5 text-muted-foreground transition-colors hover:-translate-y-0.5 hover:text-primary" />
                        </Link>
                        <Link
                            href="https://linkedin.com/company/easemytools"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="LinkedIn"
                        >
                            <FaLinkedinIn className="h-5 w-5 text-muted-foreground transition-colors hover:-translate-y-0.5 hover:text-primary" />
                        </Link>
                        <Link
                            href="https://instagram.com/easemytools"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Instagram"
                        >
                            <FaInstagram className="h-5 w-5 text-muted-foreground transition-colors hover:-translate-y-0.5 hover:text-primary" />
                        </Link>
                        {/* <Link
                            href="https://tiktok.com/@easemytools"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="TikTok"
                        >
                            <FaTiktok className="h-5 w-5 text-muted-foreground transition-colors hover:-translate-y-0.5 hover:text-primary" />
                        </Link> */}
                    </div>

                    <p className="text-sm text-muted-foreground">
                        &copy; {currentYear} EaseMyTools &mdash; All Rights
                        Reserved
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
