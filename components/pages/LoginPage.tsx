"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import Image from "next/image";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-[55%] relative items-center justify-center">
        <Image
          src="/images/login-bg.jpg"
          alt="Secure medical data background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 gradient-hero opacity-80" />
        <div className="relative z-10 max-w-lg px-12 text-primary-foreground">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl gradient-success">
                <Shield className="w-7 h-7" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">MedShield</h1>
            </div>
            <h2 className="text-4xl font-bold leading-tight mb-4 text-balance">
              Secure Medical Data De-Identification
            </h2>
            <p className="text-lg text-primary-foreground/70 leading-relaxed">
              Enterprise-grade PHI removal for DICOM, imaging, and clinical data.
              Trusted by leading hospitals and research institutions.
            </p>

            <div className="flex items-center gap-6 mt-10">
              {["HIPAA", "GDPR", "SOC 2"].map((badge) => (
                <div
                  key={badge}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/5 backdrop-blur-sm"
                >
                  <Shield className="w-4 h-4 text-success" />
                  <span className="text-sm font-semibold">{badge}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center bg-card px-6">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl gradient-primary">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">MedShield</h1>
          </div>

          <h3 className="text-2xl font-bold text-foreground mb-1">Welcome back</h3>
          <p className="text-muted-foreground mb-8">Sign in to your secure workspace</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="you@hospital.org"
                  className="pl-10 h-11 bg-background border-border"
                  defaultValue="admin@medshield.io"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-11 bg-background border-border"
                  defaultValue="password123"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted-foreground">
                <input
                  type="checkbox"
                  className="rounded border-border"
                  defaultChecked
                />
                Remember me
              </label>
              <a
                href="#"
                className="text-primary font-medium hover:underline"
              >
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              className="w-full h-11 gradient-primary text-primary-foreground font-semibold text-sm"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Lock className="w-3.5 h-3.5" />
            <span>{"256-bit AES encryption · End-to-end secure"}</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
