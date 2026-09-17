"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageCircle, ShoppingBag, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalInteractions: 0,
    inboundMessages: 0,
    outboundMessages: 0,
    conversionRate: 0,
  });

  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await fetch("http://localhost:3001/dashboard/stats");
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        const messagesRes = await fetch("http://localhost:3001/dashboard/messages");
        if (messagesRes.ok) {
          const messagesData = await messagesRes.json();
          setMessages(messagesData);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">خلاصه وضعیت</h1>
        <p className="text-muted-foreground mt-2">
          آمار لحظه‌ای عملکرد دستیار اینستاگرام شما.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card dark:bg-card/40 border-border/50 dark:border-border/60 shadow-sm transition-all hover:shadow-md backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">کل تعاملات چت‌بات</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInteractions.toLocaleString('fa-IR')}</div>
            <p className="text-xs text-muted-foreground mt-1 text-blue-500">
              مجموع پیام‌های دریافتی و ارسالی
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card dark:bg-card/40 border-border/50 dark:border-border/60 shadow-sm transition-all hover:shadow-md backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">پیام‌های دریافتی (کاربر)</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inboundMessages.toLocaleString('fa-IR')}</div>
            <p className="text-xs text-muted-foreground mt-1 text-green-500">
              پیام‌های ارسال شده توسط کاربران
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card dark:bg-card/40 border-border/50 dark:border-border/60 shadow-sm transition-all hover:shadow-md backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">پاسخ‌های خودکار (ربات)</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.outboundMessages.toLocaleString('fa-IR')}</div>
            <p className="text-xs text-muted-foreground mt-1 text-indigo-500">
              پاسخ‌های داده شده توسط دستیار
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card dark:bg-card/40 border-border/50 dark:border-border/60 shadow-sm transition-all hover:shadow-md backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">نرخ تبدیل</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate.toLocaleString('fa-IR')}٪</div>
            <p className="text-xs text-muted-foreground mt-1 text-green-500">
              درصد تبدیل به خریدار
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-card dark:bg-card/40 border-border/40 dark:border-border/60 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle>نمودار تعاملات</CardTitle>
            <CardDescription>
              روند روزانه پاسخ‌دهی به دایرکت‌ها و کامنت‌ها
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center border-t border-border/30 bg-secondary/10 m-2 rounded-lg">
            <span className="text-muted-foreground italic">نمودار در اینجا قرار می‌گیرد...</span>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 bg-card dark:bg-card/40 border-border/40 dark:border-border/60 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle>آخرین پیام‌ها</CardTitle>
            <CardDescription>
              آخرین تعاملات چت‌بات با کاربران
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">پیامی یافت نشد</div>
              ) : (
                messages.map((msg, idx) => {
                  const isBot = msg.direction === 'OUTBOUND';
                  return (
                    <div key={idx} className="flex items-center gap-4 border-b border-border/40 pb-4 last:border-0">
                      <div className={`h-10 w-10 rounded-full flex flex-shrink-0 items-center justify-center ${isBot ? 'bg-indigo-500/20' : 'bg-primary/20'}`}>
                        {isBot ? <MessageCircle className="h-5 w-5 text-indigo-500" /> : <Users className="h-5 w-5 text-primary" />}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium truncate">{isBot ? 'ربات دستیار' : (msg.user?.username || 'کاربر ناشناس')}</p>
                        <p className="text-xs text-muted-foreground truncate" title={msg.text}>{msg.text}</p>
                      </div>
                      <div className="mr-auto text-[10px] text-muted-foreground whitespace-nowrap">
                        {new Date(msg.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
