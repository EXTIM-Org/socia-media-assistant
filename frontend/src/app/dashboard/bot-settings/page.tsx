"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bot, MessageSquare, Plus, Trash2, Save, Loader2, Sparkles, AlertCircle } from "lucide-react";

export default function BotSettingsPage() {
  const [activeTab, setActiveTab] = useState<"fsm" | "rules">("rules");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{type: "success" | "error", text: string} | null>(null);

  // FSM State
  const [fsmConfig, setFsmConfig] = useState({
    welcomeMessage: "",
    askAddressMessage: "",
    askPhoneMessage: "",
    invalidPhoneMessage: "",
    successMessage: "",
    cancelMessage: ""
  });

  // Rules State
  const [rules, setRules] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const fsmRes = await fetch("http://localhost:3001/bot-config", { credentials: "include" });
      if (fsmRes.ok) setFsmConfig(await fsmRes.json());

      const rulesRes = await fetch("http://localhost:3001/bot-config/rules", { credentials: "include" });
      if (rulesRes.ok) setRules(await rulesRes.json());
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "خطا در دریافت اطلاعات از سرور" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFsm = async () => {
    try {
      setSaving(true);
      const res = await fetch("http://localhost:3001/bot-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(fsmConfig),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "تنظیمات سناریو با موفقیت ذخیره شد." });
        setTimeout(() => setMessage(null), 3000);
      } else throw new Error();
    } catch (e) {
      setMessage({ type: "error", text: "خطا در ذخیره تنظیمات سناریو" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm("آیا از حذف این قانون اطمینان دارید؟")) return;
    try {
      const res = await fetch(`http://localhost:3001/bot-config/rules/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (res.ok) setRules(rules.filter(r => r.id !== id));
    } catch (e) {
      alert("خطا در حذف قانون");
    }
  };

  const handleAddRule = async () => {
    const newRule = {
      keywords: ["کلمه_جدید"],
      dmMessage: "پیام دایرکت",
      replyMessages: ["پاسخ کامنت"]
    };
    try {
      const res = await fetch("http://localhost:3001/bot-config/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newRule)
      });
      if (res.ok) {
        const added = await res.json();
        setRules([added, ...rules]);
      }
    } catch (e) {
      alert("خطا در ایجاد قانون جدید");
    }
  };

  const handleRuleUpdate = async (id: string, field: string, value: any) => {
    // Optimistic update in UI
    const updatedRules = rules.map(r => r.id === id ? { ...r, [field]: value } : r);
    setRules(updatedRules);
    
    // Save to DB
    const ruleToSave = updatedRules.find(r => r.id === id);
    if (ruleToSave) {
      try {
        await fetch(`http://localhost:3001/bot-config/rules/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(ruleToSave)
        });
      } catch (e) {
        console.error("Failed to save rule update", e);
      }
    }
  };

  const renderTextarea = (value: string, onChange: (val: string) => void, placeholder: string = "", rows: number = 3) => (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="flex w-full rounded-xl border border-input bg-secondary/20 hover:bg-secondary/40 focus:bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary transition-colors resize-none"
    />
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">تنظیمات هوش مصنوعی و ربات</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            سناریوهای فروش و اتوماسیون پاسخگویی به مشتریان را اینجا مدیریت کنید.
          </p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50' 
            : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50'
        }`}>
          {message.type === 'success' ? <Sparkles className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <p className="font-medium text-sm">{message.text}</p>
        </div>
      )}

      <div className="flex gap-2 p-1 bg-secondary/50 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("rules")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === "rules" 
              ? "bg-background text-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          قوانین پاسخگویی
        </button>
        <button
          onClick={() => setActiveTab("fsm")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === "fsm" 
              ? "bg-background text-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          }`}
        >
          <Bot className="h-4 w-4" />
          مراحل ثبت سفارش
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
          <p>در حال دریافت اطلاعات...</p>
        </div>
      ) : activeTab === "fsm" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border/50 shadow-md bg-card/40 backdrop-blur-sm lg:col-span-2">
            <CardHeader className="border-b border-border/40 bg-muted/20 pb-4">
              <CardTitle className="text-xl">تنظیمات سناریو (FSM)</CardTitle>
              <CardDescription>
                متن‌هایی که ربات در طول فرآیند ثبت سفارش (از کلمه "خرید" تا پرداخت) برای کاربر ارسال می‌کند.
                <br/>
                <span className="text-primary mt-1 inline-block">راهنما:</span> از {"{name}"} برای نام و {"{phone}"} برای موبایل استفاده کنید.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              
              <div className="space-y-2">
                <label className="text-sm font-semibold">پیام شروع (پس از کلمه خرید)</label>
                {renderTextarea(fsmConfig.welcomeMessage, (v) => setFsmConfig({...fsmConfig, welcomeMessage: v}))}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">درخواست آدرس</label>
                {renderTextarea(fsmConfig.askAddressMessage, (v) => setFsmConfig({...fsmConfig, askAddressMessage: v}))}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">درخواست موبایل</label>
                {renderTextarea(fsmConfig.askPhoneMessage, (v) => setFsmConfig({...fsmConfig, askPhoneMessage: v}))}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">خطای فرمت موبایل</label>
                {renderTextarea(fsmConfig.invalidPhoneMessage, (v) => setFsmConfig({...fsmConfig, invalidPhoneMessage: v}))}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">پیام موفقیت و فاکتور</label>
                {renderTextarea(fsmConfig.successMessage, (v) => setFsmConfig({...fsmConfig, successMessage: v}), "", 4)}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">لغو سفارش</label>
                {renderTextarea(fsmConfig.cancelMessage, (v) => setFsmConfig({...fsmConfig, cancelMessage: v}))}
              </div>

              <div className="md:col-span-2 flex justify-end mt-4">
                <Button onClick={handleSaveFsm} disabled={saving} className="min-w-[120px] rounded-full shadow-lg shadow-primary/20">
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  ذخیره تغییرات
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">قوانین کلمات کلیدی</h3>
            <Button onClick={handleAddRule} variant="default" className="rounded-full shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" />
              قانون جدید
            </Button>
          </div>
          
          {rules.length === 0 ? (
            <div className="text-center py-12 bg-secondary/20 rounded-2xl border border-dashed border-border/50">
              <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-20" />
              <p className="text-muted-foreground">هیچ قانونی تعریف نشده است.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {rules.map((rule) => (
                <Card key={rule.id} className="border-border/50 shadow-md bg-card/40 backdrop-blur-sm overflow-hidden group">
                  <div className="absolute top-0 right-0 w-1 h-full bg-primary/40 group-hover:bg-primary transition-colors" />
                  <CardHeader className="flex flex-row items-start justify-between bg-muted/10 pb-4 border-b border-border/40">
                    <div className="space-y-1 w-full max-w-2xl">
                      <CardTitle className="text-base font-semibold">کلمات کلیدی (با کاما جدا کنید)</CardTitle>
                      <Input 
                        value={rule.keywords.join(", ")} 
                        onChange={(e) => handleRuleUpdate(rule.id, "keywords", e.target.value.split(",").map(k => k.trim()).filter(k=>k))}
                        className="bg-background border-border/50 font-medium"
                      />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteRule(rule.id)} className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 rounded-full mr-4">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-sm font-semibold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        پاسخ به صورت دایرکت
                      </label>
                      {renderTextarea(rule.dmMessage, (v) => handleRuleUpdate(rule.id, "dmMessage", v), "مثال: سلام قیمت این محصول ۵۵۰ هزار تومان است", 4)}
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-semibold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                        پاسخ‌ها در کامنت (با خط جدید جدا کنید)
                      </label>
                      {renderTextarea(
                        rule.replyMessages.join("\n"), 
                        (v) => handleRuleUpdate(rule.id, "replyMessages", v.split("\n").filter(k=>k)), 
                        "مثال:\nدایرکت شد عزیزم\nارسال شد چک کنید", 
                        4
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
