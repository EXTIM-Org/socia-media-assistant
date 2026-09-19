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
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/dashboard/orders");
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
    order.user?.username?.includes(search) ||
    order.user?.igSid?.includes(search)
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
                    <th className="px-6 py-4 font-medium">آدرس</th>
                    <th className="px-6 py-4 font-medium">آیدی اینستاگرام (Username)</th>
                    <th className="px-6 py-4 font-medium">تاریخ ثبت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredOrders.map((order, idx) => (
                    <tr 
                      key={order.id} 
                      className="hover:bg-muted/20 transition-colors cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="px-6 py-4 font-medium text-muted-foreground">
                        {idx + 1}
                      </td>
                      <td className="px-6 py-4 font-semibold text-foreground">
                        {order.fullName || "ثبت نشده"}
                      </td>
                      <td className="px-6 py-4 font-mono text-primary font-medium" dir="ltr" style={{ textAlign: "right" }}>
                        {order.phone}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {order.address || "-"}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-sm font-mono" dir="ltr" style={{ textAlign: "right" }}>
                        {order.user?.username ? `@${order.user.username}` : "-"}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                        {new Intl.DateTimeFormat("fa-IR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        }).format(new Date(order.createdAt))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-lg border-border/50 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <CardHeader className="border-b border-border/40 pb-4 bg-muted/20 relative">
              <div className="flex items-center gap-4">
                {selectedOrder.user?.profilePic ? (
                  <img src={selectedOrder.user.profilePic} alt="Profile" className="w-16 h-16 rounded-full border-2 border-primary/20 object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-xl font-bold text-muted-foreground">
                    {selectedOrder.user?.username?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    {selectedOrder.user?.fullName || selectedOrder.fullName || selectedOrder.user?.username || "بدون نام"}
                    {selectedOrder.user?.isVerified && (
                      <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">تیک آبی</span>
                    )}
                  </CardTitle>
                  <CardDescription className="text-sm mt-1" dir="ltr">
                    @{selectedOrder.user?.username || "unknown"}
                  </CardDescription>
                </div>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-muted-foreground">شماره تماس:</span>
                  <p className="font-mono text-base font-semibold" dir="ltr">{selectedOrder.phone}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">تعداد فالوور:</span>
                  <p className="font-semibold">{selectedOrder.user?.followerCount != null ? new Intl.NumberFormat('fa-IR').format(selectedOrder.user.followerCount) : "نامشخص"}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">وضعیت فالو:</span>
                  <p className="font-semibold">{selectedOrder.user?.isFollower === true ? "شما را فالو دارد" : selectedOrder.user?.isFollower === false ? "فالو ندارد" : "نامشخص"}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">آیدی یکتا (IGSID):</span>
                  <p className="font-mono text-xs text-muted-foreground break-all" dir="ltr">{selectedOrder.user?.igSid}</p>
                </div>
                <div className="col-span-2 space-y-1 bg-secondary/20 p-3 rounded-lg border border-border/50">
                  <span className="text-muted-foreground">آدرس کامل:</span>
                  <p className="font-medium leading-relaxed">{selectedOrder.address || "ثبت نشده"}</p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-border/40 flex justify-end">
                <Button onClick={() => setSelectedOrder(null)} variant="outline">بستن پنجره</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
