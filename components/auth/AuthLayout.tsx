'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
  footerText: string
  footerLinkText: string
  footerLinkHref: string
}

export default function AuthLayout({
  children,
  title,
  subtitle,
  footerText,
  footerLinkText,
  footerLinkHref,
}: AuthLayoutProps) {
  return (
    // Pura section screen height le iske liye min-h-screen add kiya hai
    <div className="flex bg-background mt-1">
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
              Free Tools to Simplify
              <br />
              <span className="text-indigo-200">Your Work</span>
            </h1>

            <p className="text-lg text-indigo-200 mb-12 leading-relaxed max-w-md">
              Join 100k+ users using EaseMyTools to edit, convert, and compress 
              PDFs, images, and text instantly — completely free.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-8 max-w-sm">
              <div>
                <div className="text-3xl font-bold text-white mb-1">30+</div>
                <div className="text-indigo-200 text-sm">Tools Available</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-1">100k+</div>
                <div className="text-indigo-200 text-sm">Active Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-1">Lightning</div>
                <div className="text-indigo-200 text-sm">Fast Performance</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-1">100%</div>
                <div className="text-indigo-200 text-sm">Free & Secure</div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="mt-12 p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <p className="text-white/90 text-sm italic mb-3">
                "EaseMyTools is a lifesaver for students and professionals. The 
                tools are fast, reliable, and completely free."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white">
                  GA
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Govt Exam Aspirant</p>
                  <p className="text-indigo-200 text-xs">Verified User</p>
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
          <div className="mb-8 text-center sm:text-left">
            {/* FIX: Changed text-white to text-foreground */}
            <h2 className="text-3xl font-bold text-foreground mb-2">{title}</h2>
            {/* Thoda subdued look ke liye text-foreground/80 use kar sakte ho */}
            <p className="text-foreground/80">{subtitle}</p>
          </div>

          {children}

          <p className="mt-8 text-center text-sm text-foreground/80">
            {footerText}{' '}
            {/* Light mode me dark blue aur dark mode me light blue ke liye class adapt kari hai */}
            <Link 
              href={footerLinkHref} 
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium transition-colors"
            >
              {footerLinkText}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}