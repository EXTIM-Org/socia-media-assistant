"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  MessageSquareReply, 
  Bot, 
  Settings,
  Store,
  CreditCard,
  Users,
  ShoppingBag
} from "lucide-react";

const navItems = [
  { name: "داشبورد", href: "/dashboard", icon: LayoutDashboard },
  { name: "سفارشات", href: "/dashboard/orders", icon: ShoppingBag },
  { name: "پاسخ‌دهی خودکار", href: "/dashboard/automations", icon: MessageSquareReply },
  { name: "تنظیمات ربات", href: "/dashboard/bot-settings", icon: Bot },
  { name: "فروشگاه", href: "/dashboard/store", icon: Store },
  { name: "پرداخت‌ها", href: "/dashboard/payments", icon: CreditCard },
  { name: "مدیریت کاربران", href: "/dashboard/users", icon: Users },
  { name: "تنظیمات پنل", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-l border-border/40 bg-card/50 backdrop-blur-sm flex flex-col h-screen sticky top-0">
      <div className="h-16 flex items-center px-6 border-b border-border/40">
        <span className="text-xl font-bold text-primary">بفروش</span>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t text-xs text-center text-muted-foreground">
        نسخه 1.0.0
      </div>
    </aside>
  );
}
