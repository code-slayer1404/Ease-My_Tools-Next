'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordForm() {
  const [step, setStep] = useState(1) // 1: Email, 2: Verification, 3: New Password
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [isSuccess, setIsSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    email: '',
    verificationCode: ['', '', '', '', '', ''],
    password: '',
    confirmPassword: '',
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const validateEmail = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateVerificationCode = () => {
    const newErrors: Record<string, string> = {}
    const code = formData.verificationCode.join('')
    
    if (code.length < 6) {
      newErrors.verificationCode = 'Please enter the complete 6-digit code'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateNewPassword = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must include uppercase, lowercase, and number'
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (password.match(/[a-z]/)) strength++
    if (password.match(/[A-Z]/)) strength++
    if (password.match(/\d/)) strength++
    if (password.match(/[^a-zA-Z\d]/)) strength++
    return strength
  }

  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-400', 'bg-emerald-500']
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateEmail()) return

    setIsLoading(true)
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsLoading(false)
    setStep(2)
    setCountdown(60) // Start 60 second countdown
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateVerificationCode()) return

    setIsLoading(true)
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsLoading(false)
    setStep(3)
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateNewPassword()) return

    setIsLoading(true)
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsLoading(false)
    setIsSuccess(true)
  }

  const handleResendCode = async () => {
    setIsLoading(true)
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsLoading(false)
    setCountdown(60)
  }

  const handleVerificationCodeChange = (index: number, value: string) => {
    if (value.length > 1) return
    
    const newCode = [...formData.verificationCode]
    newCode[index] = value
    setFormData({ ...formData, verificationCode: newCode })

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleVerificationCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !formData.verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`)
      prevInput?.focus()
    }
  }

  // Success State
  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-8 w-8 text-emerald-500 dark:text-emerald-400" />
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-2">Password Reset Successful!</h3>
        <p className="text-muted-foreground mb-8">
          Your password has been successfully reset. You can now sign in with your new password.
        </p>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link
            href="/login"
            className="inline-block w-full py-3 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition-all duration-300 text-center"
          >
            Sign in to your account
          </Link>
        </motion.div>
        <p className="mt-4 text-sm">
          <Link href="/" className="text-blue-600 dark:text-indigo-400 hover:underline transition-colors">
            ← Back to Home
          </Link>
        </p>
      </motion.div>
    )
  }

  return (
    <div>
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
              s <= step 
                ? 'bg-primary text-white' 
                : 'bg-input text-muted-foreground border border-border'
            }`}>
              {s < step ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                s
              )}
            </div>
            {s < 3 && (
              <div className={`w-12 h-0.5 transition-all duration-300 ${
                s < step ? 'bg-primary' : 'bg-border'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Labels */}
      <div className="flex justify-between text-xs text-muted-foreground mb-8 px-2">
        <span className={step >= 1 ? 'text-primary font-medium' : ''}>Email</span>
        <span className={step >= 2 ? 'text-primary font-medium' : ''}>Verify</span>
        <span className={step >= 3 ? 'text-primary font-medium' : ''}>Reset</span>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Email Input */}
        {step === 1 && (
          <motion.form
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onSubmit={handleSendCode}
            className="space-y-5"
          >
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Forgot your password?</h3>
              <p className="text-muted-foreground text-sm">
                No worries! Enter your email address and we'll send you a verification code to reset your password.
              </p>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground/90 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full pl-10 pr-4 py-3 bg-input border ${
                    errors.email ? 'border-destructive/50' : 'border-border'
                  } rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-colors`}
                  placeholder="you@company.com"
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending code...
                </div>
              ) : (
                'Send verification code'
              )}
            </motion.button>

            <div className="text-center">
              <Link 
                href="/login" 
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </Link>
            </div>
          </motion.form>
        )}

        {/* Step 2: Verification Code */}
        {step === 2 && (
          <motion.form
            key="step2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onSubmit={handleVerifyCode}
            className="space-y-5"
          >
            <div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <h3 className="text-xl font-semibold text-foreground mb-2">Check your email</h3>
              <p className="text-muted-foreground text-sm">
                We've sent a 6-digit verification code to{' '}
                <span className="text-foreground font-semibold">{formData.email}</span>
              </p>
            </div>

            {/* Verification Code Inputs */}
            <div>
              <label className="block text-sm font-medium text-foreground/90 mb-3">
                Enter verification code
              </label>
              <div className="flex gap-2 justify-between">
                {formData.verificationCode.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleVerificationCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleVerificationCodeKeyDown(index, e)}
                    className="w-12 h-14 bg-input border border-border rounded-lg text-center text-2xl font-bold text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  />
                ))}
              </div>
              {errors.verificationCode && (
                <p className="mt-2 text-sm text-destructive">{errors.verificationCode}</p>
              )}
            </div>

            {/* Resend Code */}
            <div className="text-center">
              {countdown > 0 ? (
                <p className="text-sm text-muted-foreground">
                  Resend code in <span className="text-primary font-medium">{countdown}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-indigo-400 hover:underline transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Resend code
                </button>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </div>
              ) : (
                'Verify code'
              )}
            </motion.button>
          </motion.form>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <motion.form
            key="step3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onSubmit={handleResetPassword}
            className="space-y-5"
          >
            <div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <h3 className="text-xl font-semibold text-foreground mb-2">Set new password</h3>
              <p className="text-muted-foreground text-sm">
                Create a strong password for your account.
              </p>
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-foreground/90 mb-2">
                New password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full pl-10 pr-12 py-3 bg-input border ${
                    errors.password ? 'border-destructive/50' : 'border-border'
                  } rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-colors`}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-destructive">{errors.password}</p>
              )}

              {/* Password Strength */}
              {formData.password && (
                <div className="mt-3">
                  <div className="flex gap-1 mb-1">
                    {[0, 1, 2, 3, 4].map((index) => (
                      <div
                        key={index}
                        className={`h-1 flex-1 rounded-full ${
                          index < getPasswordStrength(formData.password)
                            ? strengthColors[getPasswordStrength(formData.password) - 1]
                            : 'bg-border'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Password strength: <span className="font-semibold text-foreground">{strengthLabels[getPasswordStrength(formData.password) - 1] || 'Very Weak'}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-foreground/90 mb-2">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`w-full pl-10 pr-12 py-3 bg-input border ${
                    errors.confirmPassword ? 'border-destructive/50' : 'border-border'
                  } rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-colors`}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-destructive">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="space-y-2 text-sm text-foreground/90 bg-input border border-border rounded-lg p-4">
              <p className="font-medium text-muted-foreground">Password must contain:</p>
              <div className="space-y-1.5">
                {[
                  { label: 'At least 8 characters', met: formData.password.length >= 8 },
                  { label: 'One uppercase letter', met: /[A-Z]/.test(formData.password) },
                  { label: 'One lowercase letter', met: /[a-z]/.test(formData.password) },
                  { label: 'One number', met: /\d/.test(formData.password) },
                  { label: 'One special character', met: /[^a-zA-Z\d]/.test(formData.password) },
                ].map((req) => (
                  <div key={req.label} className="flex items-center gap-2 text-xs">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${
                      req.met ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-background text-muted-foreground border border-border'
                    }`}>
                      {req.met ? '✓' : '○'}
                    </div>
                    <span className={req.met ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-muted-foreground'}>{req.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Resetting password...
                </div>
              ) : (
                'Reset password'
              )}
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}