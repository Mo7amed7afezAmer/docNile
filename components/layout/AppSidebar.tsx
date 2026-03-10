"use client";

import {
  LayoutDashboard,
  Upload,
  Loader2,
  SplitSquareVertical,
  ClipboardCheck,
  Settings,
  Shield,
  LogOut,
  Moon,
  Sun,
  Activity,
} from "lucide-react";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NavLink } from "@/components/NavLink";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Upload Data", url: "/upload", icon: Upload },
  { title: "Processing", url: "/processing", icon: Loader2, badge: 2 },
  { title: "Analysis", url: "/analysis", icon: Loader2 },
  { title: "Preview", url: "/preview", icon: SplitSquareVertical },
  { title: "Audit & Compliance", url: "/audit", icon: ClipboardCheck },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [dark, setDark] = useState(true);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex flex-col w-64 bg-background border-r border-border">

      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">

        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/10">
          <Image
            src="/logo.png"
            alt="DocNile"
            width={26}
            height={26}
            priority
          />
        </div>

        <div>
          <h1 className="text-lg font-bold tracking-tight">DocNile</h1>
          <p className="text-[10px] uppercase text-muted-foreground tracking-wider">
            Secure De-Identification
          </p>
        </div>

      </div>

      {/* Environment */}
      <div className="px-4 pt-4">
        <div className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">
          <Activity className="w-3.5 h-3.5" />
          Production Environment
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1">

        {navItems.map((item) => {
          const isActive = pathname === item.url;

          return (
            <NavLink
              key={item.url}
              href={item.url}
              end
              className={`group flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200

              ${isActive
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-l-4 border-blue-600 shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }
              
              `}
            >
              <item.icon className="w-5 h-5" />

              <span>{item.title}</span>

              {item.badge && (
                <span className="ml-auto flex items-center justify-center min-w-[20px] h-[20px] text-[11px] bg-blue-600 text-white rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}

      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-border space-y-3">

        {/* Dark mode */}
        <div className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-muted/50">

          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {dark ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}

            {dark ? "Light Mode" : "Dark Mode"}
          </div>

          <button
            onClick={() => setDark(!dark)}
            className={`w-10 h-5 flex items-center rounded-full transition ${dark ? "bg-blue-600" : "bg-gray-300"
              }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full transition transform ${dark ? "translate-x-5" : "translate-x-1"
                }`}
            />
          </button>

        </div>

        {/* Compliance */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-green-200 dark:border-green-800 bg-green-500/10 text-green-600 dark:text-green-400">
          <Shield className="w-4 h-4" />
          <span className="text-xs font-medium">
            HIPAA & GDPR Compliant
          </span>
        </div>

        {/* User */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 cursor-pointer">

          <div className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center text-xs font-semibold">
            MH
          </div>

          <div className="flex-1 text-sm">
            <p className="font-medium leading-none">Mohamed Hafez</p>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>

          <LogOut className="w-4 h-4 text-muted-foreground hover:text-red-500" />

        </div>

      </div>
    </aside>
  );
}