"use client";

import Link from "next/link";
import styles from './styles.module.css';

const Footer = () => {
  console.log("Footer was rendered");

  return (
    <footer className={styles["footer"]}>
      <div className={styles["footer-container"]}>
        <div className={styles["footer-column"]}>
          <h4>PRODUCT</h4>
          <Link href={"/" as any} >{"Home"}</Link>
          <Link href={"/features" as any} >{"Features"}</Link>
          {/* <Link href={"/pricing" as any} >{"Pricing"}</Link> */}
          <Link href={"/tools" as any} >{"Tools"}</Link>
          <Link href={"/faq" as any} >{"FAQ"}</Link>
        </div>

        <div className={styles["footer-column"]}>
          <h4>RESOURCES</h4>
          <Link href={"/desktop" as any} >{"EaseMyTools Desktop"}</Link>
          <Link href={"/mobile" as any} >{"EaseMyTools Mobile"}</Link>
          {/* <Link href={"/api" as any} >{"API"}</Link> */}
          <Link href={"/docs" as any} >{"Documentation"}</Link>
        </div>

        <div className={styles["footer-column"]}>
          <h4>SOLUTIONS</h4>
          <Link href={"/business" as any} >{"Business"}</Link>
          <Link href={"/education" as any} onClick={()=>{window.scrollTo({top:0, behavior:"smooth"})}}>{"Education"}</Link>
        </div>

        <div className={styles["footer-column"]}>
          <h4>LEGAL</h4>
          <Link href={"/security" as any} >{"Security"}</Link>
          <Link href={"/privacy-policy" as any} >{"Privacy Policy"}</Link>
          <Link href={"/terms-conditions" as any} >{"Terms & Conditions"}</Link>
          <Link href={"/cookie-policy" as any} >{"Cookie Policy"}</Link>
        </div>

        <div className={styles["footer-column"]}>
          <h4>COMPANY</h4>
          <Link href={"/about" as any} >{"About Us"}</Link>
          <Link href={"/contact" as any} >{"Contact Us"}</Link>
          <Link href={"/blog" as any} >{"Blog"}</Link>
          {/* <Link href={"/press" as any} >{"Press"}</Link> */}
        </div>
      </div>

      <hr className={styles["footer-divider"]} />

      <div className={styles["footer-bottom"]}>

        <div className={styles["footer-social"]}>
          <Link href={"https://twitter.com/easemytools" as any} target="_blank" rel="noopener noreferrer" title="Twitter">
            ✖
          </Link>
          <Link href={"https://facebook.com/easemytools" as any} target="_blank" rel="noopener noreferrer" title="Facebook">
            📘
          </Link>
          <Link href={"https://linkedin.com/company/easemytools" as any} target="_blank" rel="noopener noreferrer" title="LinkedIn">
            💼
          </Link>
          <Link href={"https://instagram.com/easemytools" as any} target="_blank" rel="noopener noreferrer" title="Instagram">
            📸
          </Link>
          <Link href={"https://tiktok.com/@easemytools" as any} target="_blank" rel="noopener noreferrer" title="TikTok">
            🎵
          </Link>
        </div>

        <div className={styles["footer-copy"]}>
          © {new Date().getFullYear()} EaseMyTools — {"All Rights Reserved"}
        </div>
      </div>
    </footer>
  );
};

export default Footer;