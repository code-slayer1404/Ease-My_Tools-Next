// // app/dashboard/page.tsx
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";        // your NextAuth config
// import { prisma } from "@/lib/prisma";          // singleton Prisma client
// import { notFound } from "next/navigation";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// export default async function DashboardPage() {
//   const session = await getServerSession(authOptions);

//   if (!session?.user?.id) {
//     notFound(); // or redirect to sign-in
//   }

//   // Fetch the real user with their linked accounts
//   const user = await prisma.user.findUnique({
//     where: { id: session.user.id },
//     include: {
//       accounts: {
//         select: {
//           provider: true,
//           providerAccountId: true,
//         },
//       },
//     },
//   });

//   if (!user) {
//     notFound();
//   }

//   // Derive display values
//   const initials = user.name
//     ? user.name
//         .split(" ")
//         .map((n) => n[0])
//         .join("")
//         .toUpperCase()
//     : user.email?.charAt(0).toUpperCase() ?? "?";

//   const isPremium =
//     user.role === "PREMIUM" ||
//     (user.premiumUntil && new Date(user.premiumUntil) > new Date());

//   return (
//     <div className="container max-w-4xl py-10">
//       <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

//       <div className="grid gap-6 md:grid-cols-2">
//         {/* Profile Card */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Profile</CardTitle>
//           </CardHeader>
//           <CardContent className="flex flex-col items-center space-y-4">
//             <Avatar className="h-24 w-24">
//               <AvatarImage src={user.image ?? ""} alt={user.name ?? ""} />
//               <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
//             </Avatar>
//             <div className="text-center">
//               <h2 className="text-xl font-semibold">{user.name ?? "No name set"}</h2>
//               <p className="text-muted-foreground">{user.email}</p>
//             </div>
//             <div className="flex gap-2">
//               <Badge variant={user.role === "ADMIN" ? "destructive" : "default"}>
//                 {user.role}
//               </Badge>
//               {isPremium && <Badge variant="secondary">Premium</Badge>}
//             </div>
//             {user.premiumUntil && (
//               <p className="text-sm text-muted-foreground">
//                 Premium until {new Date(user.premiumUntil).toLocaleDateString()}
//               </p>
//             )}
//           </CardContent>
//         </Card>

//         {/* Connected Accounts Card */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Connected Accounts</CardTitle>
//           </CardHeader>
//           <CardContent>
//             {user.accounts.length === 0 ? (
//               <p className="text-muted-foreground">No linked accounts yet.</p>
//             ) : (
//               <ul className="space-y-2">
//                 {user.accounts.map((acc) => (
//                   <li
//                     key={acc.provider + acc.providerAccountId}
//                     className="flex items-center gap-2 rounded-md border p-2"
//                   >
//                     <span className="capitalize font-medium">{acc.provider}</span>
//                     <span className="text-sm text-muted-foreground truncate">
//                       {acc.providerAccountId}
//                     </span>
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </CardContent>
//         </Card>

//         {/* Subscription Card (spans both columns) */}
//         <Card className="md:col-span-2">
//           <CardHeader>
//             <CardTitle>Subscription</CardTitle>
//           </CardHeader>
//           <CardContent>
//             {isPremium ? (
//               <div className="flex items-center gap-2">
//                 <Badge variant="secondary">Active</Badge>
//                 <span>
//                   Your premium membership is active until{" "}
//                   {user.premiumUntil
//                     ? new Date(user.premiumUntil).toLocaleDateString()
//                     : "indefinitely"}
//                   .
//                 </span>
//               </div>
//             ) : (
//               <div className="flex items-center gap-2">
//                 <Badge variant="outline">Free</Badge>
//                 <span>
//                   You are on the free tier.{" "}
//                   <a href="/pricing" className="underline text-primary">
//                     Upgrade to Premium
//                   </a>
//                 </span>
//               </div>
//             )}
//             {user.razorpayCustomerId && (
//               <p className="text-sm text-muted-foreground mt-2">
//                 Razorpay Customer ID: {user.razorpayCustomerId}
//               </p>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }






// app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    notFound();
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      accounts: {
        select: {
          provider: true,
          providerAccountId: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user.email?.charAt(0).toUpperCase() ?? "?";

  const isPremium =
    user.role === "PREMIUM" ||
    (user.premiumUntil && new Date(user.premiumUntil) > new Date());

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Section */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.image ?? ""} alt={user.name ?? ""} />
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h2 className="text-xl font-semibold">
                {user.name ?? "No name set"}
              </h2>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
            <div className="flex gap-2">
              <Badge
                variant={user.role === "ADMIN" ? "destructive" : "default"}
              >
                {user.role}
              </Badge>
              {isPremium && <Badge variant="secondary">Premium</Badge>}
            </div>
            {user.premiumUntil && (
              <p className="text-sm text-muted-foreground">
                Premium until{" "}
                {new Date(user.premiumUntil).toLocaleDateString()}
              </p>
            )}
          </div>

          <hr className="border-gray-200 dark:border-gray-700" />

          {/* Connected Accounts */}
          <div>
            <h3 className="font-medium mb-2">Connected Accounts</h3>
            {user.accounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No linked accounts yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {user.accounts.map((acc) => (
                  <li
                    key={acc.provider + acc.providerAccountId}
                    className="flex items-center gap-2 rounded-md border p-2 text-sm"
                  >
                    <span className="capitalize font-medium">
                      {acc.provider}
                    </span>
                    <span className="text-muted-foreground truncate">
                      {acc.providerAccountId}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <hr className="border-gray-200 dark:border-gray-700" />

          {/* Subscription */}
          <div>
            <h3 className="font-medium mb-2">Subscription</h3>
            {isPremium ? (
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="secondary">Active</Badge>
                <span>
                  Premium until{" "}
                  {user.premiumUntil
                    ? new Date(user.premiumUntil).toLocaleDateString()
                    : "indefinitely"}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline">Free</Badge>
                <span>
                  <a href="/pricing" className="underline text-primary">
                    Upgrade to Premium
                  </a>
                </span>
              </div>
            )}
            {user.razorpayCustomerId && (
              <p className="text-xs text-muted-foreground mt-1">
                Razorpay Customer ID: {user.razorpayCustomerId}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


