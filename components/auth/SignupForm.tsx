"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff, Mail, Lock, User, Building } from "lucide-react"

export default function SignupForm() {
    const [showPassword, setShowPassword] = useState(false)
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        company: "",
        password: "",
        agreeToTerms: false,
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isLoading, setIsLoading] = useState(false)

    const validateStep1 = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.fullName) {
            newErrors.fullName = "Full name is required"
        }

        if (!formData.email) {
            newErrors.email = "Email is required"
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Please enter a valid email"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const validateStep2 = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.password) {
            newErrors.password = "Password is required"
        } else if (formData.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters"
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password =
                "Password must include uppercase, lowercase, and number"
        }

        if (!formData.agreeToTerms) {
            newErrors.agreeToTerms = "You must agree to the terms"
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
        // await new Promise(resolve => setTimeout(resolve, 2000))
        
        const name = formData.fullName
        const email = formData.email
        const password = formData.password

        const res = await fetch("/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
                email,
                password,
            }),
        })

        const data = await res.json()

        setIsLoading(false)
    
        // Handle successful signup
        window.location.href = "/"
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

    const strengthColors = [
        "bg-red-500",
        "bg-orange-500",
        "bg-yellow-500",
        "bg-green-400",
        "bg-emerald-500",
    ]
    const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"]

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 ? (
                <>
                    {/* Full Name */}
                    <div>
                        <label
                            htmlFor="fullName"
                            className="mb-2 block text-sm font-medium text-foreground/90"
                        >
                            Full name
                        </label>
                        <div className="relative">
                            <User className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                            <input
                                id="fullName"
                                type="text"
                                value={formData.fullName}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        fullName: e.target.value,
                                    })
                                }
                                className={`w-full border bg-input py-3 pr-4 pl-10 ${
                                    errors.fullName
                                        ? "border-destructive/50"
                                        : "border-border"
                                } rounded-lg text-foreground placeholder-muted-foreground transition-colors focus:border-primary/50 focus:outline-none`}
                                placeholder="John Doe"
                            />
                        </div>
                        {errors.fullName && (
                            <p className="mt-1 text-sm text-destructive">
                                {errors.fullName}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-medium text-foreground/90"
                        >
                            Work email
                        </label>
                        <div className="relative">
                            <Mail className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                            <input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        email: e.target.value,
                                    })
                                }
                                className={`w-full border bg-input py-3 pr-4 pl-10 ${
                                    errors.email
                                        ? "border-destructive/50"
                                        : "border-border"
                                } rounded-lg text-foreground placeholder-muted-foreground transition-colors focus:border-primary/50 focus:outline-none`}
                                placeholder="you@company.com"
                            />
                        </div>
                        {errors.email && (
                            <p className="mt-1 text-sm text-destructive">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    {/* Company */}
                    <div>
                        <label
                            htmlFor="company"
                            className="mb-2 block text-sm font-medium text-foreground/90"
                        >
                            Company (optional)
                        </label>
                        <div className="relative">
                            <Building className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                            <input
                                id="company"
                                type="text"
                                value={formData.company}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        company: e.target.value,
                                    })
                                }
                                className="w-full rounded-lg border border-border bg-input py-3 pr-4 pl-10 text-foreground placeholder-muted-foreground transition-colors focus:border-primary/50 focus:outline-none"
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
                        className="w-full rounded-lg bg-primary py-3 font-medium text-white transition-all duration-300 hover:opacity-90"
                    >
                        Continue
                    </motion.button>

                    {/* Step Indicator */}
                    <div className="flex justify-center gap-2">
                        <div className="h-1 w-8 rounded-full bg-primary" />
                        <div className="h-1 w-8 rounded-full bg-border" />
                    </div>
                </>
            ) : (
                <>
                    {/* Back Button */}
                    <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="mb-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        ← Back
                    </button>

                    {/* Password */}
                    <div>
                        <label
                            htmlFor="password"
                            className="mb-2 block text-sm font-medium text-foreground/90"
                        >
                            Create password
                        </label>
                        <div className="relative">
                            <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        password: e.target.value,
                                    })
                                }
                                className={`w-full border bg-input py-3 pr-12 pl-10 ${
                                    errors.password
                                        ? "border-destructive/50"
                                        : "border-border"
                                } rounded-lg text-foreground placeholder-muted-foreground transition-colors focus:border-primary/50 focus:outline-none`}
                                placeholder="Min. 8 characters"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="mt-1 text-sm text-destructive">
                                {errors.password}
                            </p>
                        )}

                        {/* Password Strength */}
                        {formData.password && (
                            <div className="mt-3">
                                <div className="mb-1 flex gap-1">
                                    {[0, 1, 2, 3, 4].map((index) => (
                                        <div
                                            key={index}
                                            className={`h-1 flex-1 rounded-full ${
                                                index <
                                                getPasswordStrength(
                                                    formData.password
                                                )
                                                    ? strengthColors[
                                                          getPasswordStrength(
                                                              formData.password
                                                          ) - 1
                                                      ]
                                                    : "bg-border"
                                            }`}
                                        />
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Password strength:{" "}
                                    <span className="font-medium text-foreground">
                                        {strengthLabels[
                                            getPasswordStrength(
                                                formData.password
                                            ) - 1
                                        ] || "Very Weak"}
                                    </span>
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Password Requirements */}
                    <div className="space-y-2 text-sm text-foreground/90">
                        <p className="font-medium text-muted-foreground">
                            Password must contain:
                        </p>
                        <div className="space-y-1">
                            {[
                                {
                                    label: "At least 8 characters",
                                    met: formData.password.length >= 8,
                                },
                                {
                                    label: "One uppercase letter",
                                    met: /[A-Z]/.test(formData.password),
                                },
                                {
                                    label: "One lowercase letter",
                                    met: /[a-z]/.test(formData.password),
                                },
                                {
                                    label: "One number",
                                    met: /\d/.test(formData.password),
                                },
                            ].map((req) => (
                                <div
                                    key={req.label}
                                    className="flex items-center gap-2 text-xs"
                                >
                                    <div
                                        className={`flex h-4 w-4 items-center justify-center rounded-full font-bold ${
                                            req.met
                                                ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                                : "border border-border bg-input text-muted-foreground"
                                        }`}
                                    >
                                        {req.met ? "✓" : "○"}
                                    </div>
                                    <span
                                        className={
                                            req.met
                                                ? "font-medium text-emerald-600 dark:text-emerald-400"
                                                : "text-muted-foreground"
                                        }
                                    >
                                        {req.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Terms */}
                    <div>
                        <label className="flex cursor-pointer items-start gap-3">
                            <input
                                type="checkbox"
                                checked={formData.agreeToTerms}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        agreeToTerms: e.target.checked,
                                    })
                                }
                                className="mt-1 h-4 w-4 rounded border-border bg-input text-primary focus:ring-primary focus:ring-offset-0"
                            />
                            <span className="text-sm text-muted-foreground">
                                I agree to the{" "}
                                <a
                                    href="/terms"
                                    className="text-blue-600 hover:underline dark:text-indigo-400"
                                >
                                    Terms of Service
                                </a>{" "}
                                and{" "}
                                <a
                                    href="/privacy"
                                    className="text-blue-600 hover:underline dark:text-indigo-400"
                                >
                                    Privacy Policy
                                </a>
                            </span>
                        </label>
                        {errors.agreeToTerms && (
                            <p className="mt-1 text-sm text-destructive">
                                {errors.agreeToTerms}
                            </p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <motion.button
                        type="submit"
                        disabled={isLoading}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="relative w-full rounded-lg bg-primary py-3 font-medium text-white transition-all duration-300 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                Creating account...
                            </div>
                        ) : (
                            "Create account"
                        )}
                    </motion.button>

                    {/* Step Indicator */}
                    <div className="flex justify-center gap-2">
                        <div className="h-1 w-8 rounded-full bg-primary" />
                        <div className="h-1 w-8 rounded-full bg-primary" />
                    </div>
                </>
            )}
        </form>
    )
}
