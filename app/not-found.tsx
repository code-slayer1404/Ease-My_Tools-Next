import NavButtons from "../components/NavButtons"

export const metadata = {
    title: "404 - Page Not Found",
    description: "The page you are looking for does not exist.",
}

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center bg-background px-4 py-20">
            {/* Big 404 */}
            <h1 className="mb-2 text-5xl font-extrabold text-primary">404</h1>

            {/* Subheading */}
            <h2 className="mb-3 text-xl font-semibold text-foreground">
                Page Not Found
            </h2>

            {/* Description */}
            <p className="mb-6 max-w-sm text-center text-muted-foreground">
                The page you're looking for doesn't exist or may have been
                moved.
            </p>

            {/* Navigation Buttons */}
            <NavButtons />
        </div>
    )
}
