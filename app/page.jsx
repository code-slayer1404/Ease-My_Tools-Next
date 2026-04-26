import ToolsPage from "@/components/ToolsPage";
import HomePage from "@/components/HomePage";

export const metadata = {
  title: "EaseMyTools - Home",
  description: "Explore tools and featured sections on EaseMyTools.",
};

export default function Page() {
  return (
    <>
      <ToolsPage />
      <HomePage />
    </>
  );
}
