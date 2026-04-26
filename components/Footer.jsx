"use client";

// import "../styles/Footer.css";
// import { useTheme } from "../contexts/ThemeContext";

// const Footer = () => {
//   const { theme } = useTheme();

//   return (
//     <footer className={`footer ${theme}`}>
//       <div className="footer-container">
//         <div className="footer-column">
//           <h4>PRODUCT</h4>
//           <Link href="/home">Home</Link>
//           <Link href="/features">Features</Link>
//           <Link href="/pricing">Pricing</Link>
//           <Link href="/tools">Tools</Link>
//           <Link href="/faq">FAQ</Link>
//         </div>

//         <div className="footer-column">
//           <h4>RESOURCES</h4>
//           <Link href="/desktop">EaseMyTools Desktop</Link>
//           <Link href="/mobile">EaseMyTools Mobile</Link>
//           <Link href="/api">API</Link>
//           <Link href="/docs">Documentation</Link>
//         </div>

//         <div className="footer-column">
//           <h4>SOLUTIONS</h4>
//           <Link href="/business">Business</Link>
//           <Link href="/education">Education</Link>
//         </div>

//         <div className="footer-column">
//           <h4>LEGAL</h4>
//           <Link href="/security">Security</Link>
//           <Link href="/privacy">Privacy Policy</Link>
//           <Link href="/terms">Terms & Conditions</Link>
//           <Link href="/cookies">Cookies</Link>
//         </div>

//         <div className="footer-column">
//           <h4>COMPANY</h4>
//           <Link href="/about">About Us</Link>
//           <Link href="/contact">Contact Us</Link>
//           <Link href="/blog">Blog</Link>
//           <Link href="/press">Press</Link>
//         </div>
//       </div>

//       <hr className="footer-divider" />

//       <div className="footer-bottom">
//         <div className="footer-lang">
//           <select>
//             <option>English</option>
//             <option>हिंदी</option>
//           </select>
//         </div>

//         <div className="footer-social">
//           <Link href="/twitter">✖</Link>
//           <Link href="/facebook">📘</Link>
//           <Link href="/linkedin">💼</Link>
//           <Link href="/instagram">📸</Link>
//           <Link href="/tiktok">🎵</Link>
//         </div>

//         <div className="footer-copy">
//           © {new Date().getFullYear()} EaseMyTools — All Rights Reserved
//         </div>
//       </div>
//     </footer>
//   );
// };

// export default Footer;




// import "../styles/Footer.css";
// import { useTheme } from "../contexts/ThemeContext";
// 
// const Footer = () => {
//   const { theme } = useTheme();

//   return (
//     <footer className={`footer ${theme}`}>
//       <div className="footer-container">
//         <div className="footer-column">
//           <h4>PRODUCT</h4>
//           <Link href="/home">Home</Link>
//           <Link href="/features">Features</Link>
//           <Link href="/pricing">Pricing</Link>
//           <Link href="/tools">Tools</Link>
//           <Link href="/faq">FAQ</Link>
//         </div>

//         <div className="footer-column">
//           <h4>RESOURCES</h4>
//           <Link href="/desktop">EaseMyTools Desktop</Link>
//           <Link href="/mobile">EaseMyTools Mobile</Link>
//           <Link href="/api">API</Link>
//           <Link href="/docs">Documentation</Link>
//         </div>

//         <div className="footer-column">
//           <h4>SOLUTIONS</h4>
//           <Link href="/business">Business</Link>
//           <Link href="/education">Education</Link>
//         </div>

//         <div className="footer-column">
//           <h4>LEGAL</h4>
//           <Link href="/security">Security</Link>
//           <Link href="/privacy">Privacy Policy</Link>
//           <Link href="/terms">Terms & Conditions</Link>
//           <Link href="/cookies">Cookies</Link>
//         </div>

//         <div className="footer-column">
//           <h4>COMPANY</h4>
//           <Link href="/about">About Us</Link>
//           <Link href="/contact">Contact Us</Link>
//           <Link href="/blog">Blog</Link>
//           <Link href="/press">Press</Link>
//         </div>
//       </div>

//       <hr className="footer-divider" />

//       <div className="footer-bottom">
//         {/* <div className="footer-lang">
//           <select>
//             <option>English</option>
//             <option>हिंदी</option>
//           </select>
//         </div> */}

//         <LanguageSelector/>

//         <div className="footer-social">
//           <Link href="/twitter">✖</Link>
//           <Link href="/facebook">📘</Link>
//           <Link href="/linkedin">💼</Link>
//           <Link href="/instagram">📸</Link>
//           <Link href="/tiktok">🎵</Link>
//         </div>

//         <div className="footer-copy">
//           © {new Date().getFullYear()} EaseMyTools — All Rights Reserved
//         </div>
//       </div>
//     </footer>
//   );
// };

// export default Footer;


import Link from "next/link";
import "../styles/Footer.css";
import { useTheme } from "../contexts/ThemeContext";

const Footer = () => {
  console.log("Footer was rendered");
  
  const { theme } = useTheme();

  return (
    <footer className={`footer ${theme}`}>
      <div className="footer-container">
        <div className="footer-column">
          <h4>PRODUCT</h4>
          <Link href="/" >{"Home"}</Link>
          <Link href="/features" >{"Features"}</Link>
          <Link href="/pricing" >{"Pricing"}</Link>
          <Link href="/tools" >{"Tools"}</Link>
          <Link href="/faq" >{"FAQ"}</Link>
        </div>

        <div className="footer-column">
          <h4>RESOURCES</h4>
          <Link href="/desktop" >{"EaseMyTools Desktop"}</Link>
          <Link href="/mobile" >{"EaseMyTools Mobile"}</Link>
          <Link href="/api" >{"API"}</Link>
          <Link href="/docs" >{"Documentation"}</Link>
        </div>

        <div className="footer-column">
          <h4>SOLUTIONS</h4>
          <Link href="/business" >{"Business"}</Link>
          <Link href="/education" onClick={()=>{window.scrollTo({top:0, behavior:"smooth"})}}>{"Education"}</Link>
        </div>

        <div className="footer-column">
          <h4>LEGAL</h4>
          <Link href="/security" >{"Security"}</Link>
          <Link href="/privacy-policy" >{"Privacy Policy"}</Link>
          <Link href="/terms-conditions" >{"Terms & Conditions"}</Link>
          <Link href="/cookie-policy" >{"Cookie Policy"}</Link>
        </div>

        <div className="footer-column">
          <h4>COMPANY</h4>
          <Link href="/about" >{"About Us"}</Link>
          <Link href="/contact" >{"Contact Us"}</Link>
          <Link href="/blog" >{"Blog"}</Link>
          <Link href="/press" >{"Press"}</Link>
        </div>
      </div>

      <hr className="footer-divider" />

      <div className="footer-bottom">

        <div className="footer-social">
          <Link href="https://twitter.com/easemytools" target="_blank" rel="noopener noreferrer" title="Twitter">
            ✖
          </Link>
          <Link href="https://facebook.com/easemytools" target="_blank" rel="noopener noreferrer" title="Facebook">
            📘
          </Link>
          <Link href="https://linkedin.com/company/easemytools" target="_blank" rel="noopener noreferrer" title="LinkedIn">
            💼
          </Link>
          <Link href="https://instagram.com/easemytools" target="_blank" rel="noopener noreferrer" title="Instagram">
            📸
          </Link>
          <Link href="https://tiktok.com/@easemytools" target="_blank" rel="noopener noreferrer" title="TikTok">
            🎵
          </Link>
        </div>

        <div className="footer-copy">
          © {new Date().getFullYear()} EaseMyTools — {"All Rights Reserved"}
        </div>
      </div>
    </footer>
  );
};

export default Footer;