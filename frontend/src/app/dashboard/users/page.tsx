"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, UserPlus } from "lucide-react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useRouter } from "next/navigation";

interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function UsersPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");

  const user = useAuthStore(state => state.user);
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users", {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setAdmins(data);
      } else if (res.status === 401) {
        router.push("/login");
      }
    } catch (err) {
      setError("خطا در دریافت اطلاعات مدیران");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (id === user?.id) {
      alert("شما نمی‌توانید حساب کاربری خودتان را حذف کنید!");
      return;
    }
    if (!confirm("آیا از حذف این ادمین مطمئن هستید؟")) return;

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (error) {
      alert("خطا در حذف کاربر");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPassword || !newName) return;
    
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: newEmail, password: newPassword, name: newName, role: "ADMIN" }),
      });
      if (res.ok) {
        setNewEmail("");
        setNewPassword("");
        setNewName("");
        fetchUsers();
      } else {
        const errData = await res.json();
        alert(errData.message || "خطا در ایجاد ادمین");
      }
    } catch (err) {
      alert("خطا در ارتباط با سرور");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">مدیریت مدیران (Admins)</h1>
        <p className="text-muted-foreground">
          در این بخش می‌توانید حساب‌های کاربری همکاران را برای ورود به پنل داشبورد مدیریت کنید.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>ایجاد ادمین جدید</CardTitle>
            <CardDescription>ثبت اطلاعات مدیر جدید برای دسترسی به پنل</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm">نام و نام خانوادگی</label>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm">ایمیل</label>
                <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm">رمز عبور</label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full">
                <UserPlus className="mr-2 h-4 w-4" /> افزودن مدیر
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>لیست مدیران</CardTitle>
            <CardDescription>مدیرانی که امکان دسترسی به داشبورد را دارند</CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-red-500 text-sm text-center py-4">{error}</div>
            ) : loading ? (
              <div className="text-muted-foreground text-sm text-center py-4">در حال بارگذاری...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">نام</TableHead>
                    <TableHead className="text-right">ایمیل</TableHead>
                    <TableHead className="text-right">نقش</TableHead>
                    <TableHead className="text-right">تاریخ عضویت</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium">{admin.name}</TableCell>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell>
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs">
                          {admin.role}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(admin.createdAt).toLocaleDateString('fa-IR')}</TableCell>
                      <TableCell className="text-left">
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20" onClick={() => handleDelete(admin.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {admins.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                        هیچ مدیری یافت نشد
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
