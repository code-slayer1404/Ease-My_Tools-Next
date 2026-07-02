'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, Building } from 'lucide-react'

export default function SignupForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    company: '',
    password: '',
    agreeToTerms: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required'
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must include uppercase, lowercase, and number'
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep2()) return

    setIsLoading(true)
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsLoading(false)
    
    // Handle successful signup
    window.location.href = '/dashboard'
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

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {step === 1 ? (
        <>
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
              Full name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className={`w-full pl-10 pr-4 py-3 bg-white/5 border ${
                  errors.fullName ? 'border-red-500/50' : 'border-white/10'
                } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-colors`}
                placeholder="John Doe"
              />
            </div>
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-400">{errors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Work email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full pl-10 pr-4 py-3 bg-white/5 border ${
                  errors.email ? 'border-red-500/50' : 'border-white/10'
                } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-colors`}
                placeholder="you@company.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-400">{errors.email}</p>
            )}
          </div>

          {/* Company */}
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-2">
              Company (optional)
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                id="company"
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
                placeholder="Acme Inc."
              />
            </div>
          </div>

          {/* Next Button */}
          <motion.button
            type="button"
            onClick={handleNextStep}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-500 hover:to-purple-500 transition-all duration-300"
          >
            Continue
          </motion.button>

          {/* Step Indicator */}
          <div className="flex justify-center gap-2">
            <div className="w-8 h-1 rounded-full bg-indigo-500" />
            <div className="w-8 h-1 rounded-full bg-white/10" />
          </div>
        </>
      ) : (
        <>
          {/* Back Button */}
          <button
            type="button"
            onClick={() => setStep(1)}
            className="text-sm text-foreground hover:text-white transition-colors mb-4"
          >
            ← Back
          </button>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Create password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`w-full pl-10 pr-12 py-3 bg-white/5 border ${
                  errors.password ? 'border-red-500/50' : 'border-white/10'
                } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-colors`}
                placeholder="Min. 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-400">{errors.password}</p>
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
                          : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-foreground">
                  Password strength: {strengthLabels[getPasswordStrength(formData.password) - 1] || 'Very Weak'}
                </p>
              </div>
            )}
          </div>

          {/* Password Requirements */}
          <div className="space-y-2 text-sm text-foreground">
            <p className="font-medium text-gray-300">Password must contain:</p>
            <div className="space-y-1">
              {[
                { label: 'At least 8 characters', met: formData.password.length >= 8 },
                { label: 'One uppercase letter', met: /[A-Z]/.test(formData.password) },
                { label: 'One lowercase letter', met: /[a-z]/.test(formData.password) },
                { label: 'One number', met: /\d/.test(formData.password) },
              ].map((req) => (
                <div key={req.label} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    req.met ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-600'
                  }`}>
                    {req.met ? '✓' : '○'}
                  </div>
                  <span className={req.met ? 'text-emerald-400' : ''}>{req.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Terms */}
          <div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                className="mt-1 w-4 h-4 rounded border-white/10 bg-white/5 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
              />
              <span className="text-sm text-foreground">
                I agree to the{' '}
                <a href="/terms" className="text-indigo-400 hover:text-indigo-300">Terms of Service</a>
                {' '}and{' '}
                <a href="/privacy" className="text-indigo-400 hover:text-indigo-300">Privacy Policy</a>
              </span>
            </label>
            {errors.agreeToTerms && (
              <p className="mt-1 text-sm text-red-400">{errors.agreeToTerms}</p>
            )}
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating account...
              </div>
            ) : (
              'Create account'
            )}
          </motion.button>

          {/* Step Indicator */}
          <div className="flex justify-center gap-2">
            <div className="w-8 h-1 rounded-full bg-indigo-500" />
            <div className="w-8 h-1 rounded-full bg-indigo-500" />
          </div>
        </>
      )}
    </form>
  )
}