// 'use client'

// import Link from 'next/link'
// import { motion } from 'framer-motion'
// import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'

// export default function ForgotPasswordPage() {
//   return (
//     <div className="min-h-screen flex">
//       {/* Left Side - Branding */}
//       <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-900">
//         {/* Animated background */}
//         <div className="absolute inset-0">
//           <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
//           <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
//           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-white/10 to-transparent rounded-full blur-2xl" />
//         </div>

//         {/* Content */}
//         <div className="relative z-10 flex flex-col justify-center px-12 lg:px-16 xl:px-20">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6 }}
//           >
//             <Link href="/" className="inline-block mb-12">
//               <span className="text-3xl font-bold text-white">LinguaAI</span>
//             </Link>

//             <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
//               Secure Account
//               <br />
//               <span className="text-indigo-200">Recovery</span>
//             </h1>

//             <p className="text-lg text-indigo-200 mb-12 leading-relaxed max-w-md">
//               We'll help you get back into your account quickly and securely. 
//               Your data remains protected throughout the process.
//             </p>

//             {/* Security Features */}
//             <div className="grid grid-cols-1 gap-4 max-w-sm">
//               <div className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
//                 <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
//                   <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
//                   </svg>
//                 </div>
//                 <div>
//                   <p className="text-white text-sm font-medium">Encrypted Recovery</p>
//                   <p className="text-indigo-200 text-xs">End-to-end encrypted verification process</p>
//                 </div>
//               </div>

//               <div className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
//                 <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
//                   <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//                   </svg>
//                 </div>
//                 <div>
//                   <p className="text-white text-sm font-medium">Secure Verification</p>
//                   <p className="text-indigo-200 text-xs">Multi-step verification to protect your account</p>
//                 </div>
//               </div>

//               <div className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
//                 <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
//                   <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
//                   </svg>
//                 </div>
//                 <div>
//                   <p className="text-white text-sm font-medium">Quick Recovery</p>
//                   <p className="text-indigo-200 text-xs">Get back to work in under 2 minutes</p>
//                 </div>
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       </div>

//       {/* Right Side - Form */}
//       <div className="flex-1 flex items-center justify-center px-6 py-12">
//         <motion.div
//           initial={{ opacity: 0, x: 20 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.6 }}
//           className="w-full max-w-md"
//         >
//           {/* Mobile Logo */}
//           <div className="lg:hidden mb-8">
//             <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
//               LinguaAI
//             </Link>
//           </div>

//           <ForgotPasswordForm />
//         </motion.div>
//       </div>
//     </div>
//   )
// }




'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-900">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-white/10 to-transparent rounded-full blur-2xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-16 xl:px-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >

            <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
              Account Access
              <br />
              <span className="text-indigo-200">Recovery</span>
            </h1>

            <p className="text-lg text-indigo-200 mb-12 leading-relaxed max-w-md">
              Forgot your password? Don’t worry — EaseMyTools ensures a quick and 
              secure recovery process so you can get back to using free tools instantly.
            </p>

            {/* Security Features */}
            <div className="grid grid-cols-1 gap-4 max-w-sm">
              <div className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Encrypted Recovery</p>
                  <p className="text-indigo-200 text-xs">Your reset link is fully encrypted</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Secure Verification</p>
                  <p className="text-indigo-200 text-xs">Multi-step verification keeps your account safe</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Quick Recovery</p>
                  <p className="text-indigo-200 text-xs">Reset your password in under 2 minutes</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              EaseMyTools
            </Link>
          </div>

          <ForgotPasswordForm />
        </motion.div>
      </div>
    </div>
  )
}
