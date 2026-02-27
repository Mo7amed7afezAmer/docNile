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
import { NavLink } from "@/components/NavLink";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Upload Data", url: "/upload", icon: Upload },
  { title: "Processing", url: "/processing", icon: Loader2 },
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
    <aside className="fixed inset-y-0 left-0 z-30 flex flex-col w-64 bg-background text-foreground border-r border-border">

      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 text-white shadow-sm">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight">DocNile</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Secure De-Identification
          </p>
        </div>
      </div>

      {/* Environment Badge */}
      <div className="px-4 pt-3">
        <div className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <Activity className="w-3 h-3" />
          Production
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.url;

          return (
            <NavLink
              key={item.url}
              href={item.url}
              end
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-l-4 border-blue-600"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <item.icon className="w-[18px] h-[18px]" />
              <span>{item.title}</span>

              {/* Processing indicator (example) */}
              {item.title === "Processing" && (
                <span className="ml-auto text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                  2
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-border space-y-2">

        {/* Dark mode toggle */}
        <button
          onClick={() => setDark((d) => !d)}
          className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            {dark ? (
              <Sun className="w-[18px] h-[18px]" />
            ) : (
              <Moon className="w-[18px] h-[18px]" />
            )}
            <span>{dark ? "Light Mode" : "Dark Mode"}</span>
          </div>
        </button>

        {/* Compliance Badge */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
          <Shield className="w-4 h-4" />
          <span className="text-xs font-medium">
            HIPAA & GDPR Compliant
          </span>
        </div>

        {/* Sign Out */}
        <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors">
          <LogOut className="w-[18px] h-[18px]" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}