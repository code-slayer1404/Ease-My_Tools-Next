'use client'

import AuthLayout from '@/components/auth/AuthLayout'
import SignupForm from '@/components/auth/SignupForm'
import SocialButtons from '@/components/auth/SocialButtons'

export default function SignupPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start your free trial. No credit card required."
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLinkHref="/login"
    >
      <SocialButtons />

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-background text-foreground">or continue with email</span>
        </div>
      </div>

      <SignupForm />
    </AuthLayout>
  )
}