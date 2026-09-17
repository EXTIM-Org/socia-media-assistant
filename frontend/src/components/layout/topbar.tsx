"use client";

import { Bell, LogOut, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useRouter } from "next/navigation";

export function Topbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:3001/auth/logout", { 
        method: "POST",
        credentials: "include" 
      });
    } catch (e) {
      console.error(e);
    }
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-border/40 bg-background/40 backdrop-blur-xl px-6 transition-all duration-300">
      <div className="flex items-center gap-4">
        {/* Placeholder for mobile menu button if needed */}
        <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent lg:hidden">
          بفروش
        </h2>
      </div>

      <div className="flex flex-1 items-center justify-end gap-3 sm:gap-5">
        <div className="relative hidden w-full max-w-md lg:flex group">
          <Search className="absolute right-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input 
            type="search" 
            placeholder="جستجو در پیام‌ها، کاربران..." 
            className="w-full bg-secondary/30 hover:bg-secondary/50 focus:bg-background pr-12 border-border/50 focus:border-primary/50 rounded-full shadow-sm transition-all h-10" 
          />
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />

          <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-primary/10 transition-colors">
            <Bell className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
            <span className="absolute right-[10px] top-[10px] h-2 w-2 rounded-full bg-blue-500 ring-2 ring-background animate-pulse" />
          </Button>
        </div>

        <div className="flex items-center gap-4 pl-1 pr-4 border-r border-border/40">
          <div className="hidden flex-col items-end lg:flex">
            <span className="text-sm font-semibold tracking-tight">{user?.name || 'مدیر سیستم'}</span>
            <span className="text-[11px] text-muted-foreground/80 font-medium">{user?.email || 'admin@befroosh.ir'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary/80 to-indigo-500/80 p-[2px] shadow-sm flex items-center justify-center overflow-hidden">
              <div className="h-full w-full rounded-full bg-background flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-red-500/80 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-full transition-colors" onClick={handleLogout} title="خروج">
              <LogOut className="h-[18px] w-[18px]" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
