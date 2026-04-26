import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "./providers";

export const metadata = {
  title: "EaseMyTools",
  description: "EaseMyTools utility platform",
};

export default function RootLayout({ children }) {
  const themeInitializerScript = `
    (function () {
      try {
        var savedTheme = localStorage.getItem("theme");
        var theme = savedTheme === "light" ? "light" : "dark";
        var root = document.documentElement;
        var body = document.body;

        root.classList.remove("light", "dark");
        root.classList.add(theme);

        if (body) {
          body.classList.remove("light", "dark");
          body.classList.add(theme);
        }
      } catch (error) {
        // Ignore localStorage and DOM access issues to keep hydration safe.
      }
    })();
  `;

  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: themeInitializerScript }} />
        <Providers>
          <div className="App">
            <Navbar />
            <main className="main-content">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
