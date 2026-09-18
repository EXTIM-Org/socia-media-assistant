"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:3001/dashboard/orders");
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => 
    order.phone?.includes(search) || 
    order.fullName?.includes(search) ||
    order.username?.includes(search) ||
    order.igSid?.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">سفارشات و لیدها</h1>
          <p className="text-muted-foreground mt-2">
            لیست کاربرانی که شماره تماس خود را در ربات ثبت کرده‌اند.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-full shadow-sm">
            <Download className="mr-2 h-4 w-4" />
            خروجی اکسل
          </Button>
        </div>
      </div>

      <Card className="bg-card dark:bg-card/40 border-border/50 shadow-sm backdrop-blur-sm">
        <CardHeader className="border-b border-border/40 pb-4 bg-muted/20">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <CardTitle>لیست مشتریان</CardTitle>
              <CardDescription className="mt-1">
                {orders.length} مشتری ثبت شده
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="جستجو در شماره، نام یا آیدی..."
                className="pr-9 rounded-full bg-background"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
              <p>در حال دریافت اطلاعات سفارشات...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p>هیچ سفارشی یافت نشد.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-secondary/30 text-muted-foreground text-xs uppercase border-b border-border/50">
                  <tr>
                    <th className="px-6 py-4 font-medium">ردیف</th>
                    <th className="px-6 py-4 font-medium">نام مشتری</th>
                    <th className="px-6 py-4 font-medium">شماره موبایل</th>
                    <th className="px-6 py-4 font-medium">آیدی اینستاگرام (IGSID)</th>
                    <th className="px-6 py-4 font-medium">تاریخ ثبت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredOrders.map((order, idx) => (
                    <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-muted-foreground">
                        {idx + 1}
                      </td>
                      <td className="px-6 py-4 font-semibold text-foreground">
                        {order.fullName || "ثبت نشده"}
                      </td>
                      <td className="px-6 py-4 font-mono text-primary font-medium" dir="ltr" style={{ textAlign: "right" }}>
                        {order.phone}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs font-mono">
                        {order.igSid}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                        {new Intl.DateTimeFormat("fa-IR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        }).format(new Date(order.updatedAt))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
