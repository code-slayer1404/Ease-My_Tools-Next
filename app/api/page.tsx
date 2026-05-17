import API from "@/components/API";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EaseMyTools - Api",
  description: "Use the Api tool on EaseMyTools.",
};

export default function Page() {
  return <API />;
}
