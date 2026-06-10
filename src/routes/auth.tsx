import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Lock } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "دخول الباحث — لوحة التحكم" },
      { name: "description", content: "تسجيل دخول المدير للوحة التحكم الأكاديمية." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      toast.error("بيانات الدخول غير صحيحة.");
      return;
    }
    toast.success("تم تسجيل الدخول.");
    navigate({ to: "/admin" });
  }

  return (
    <div className="flex min-h-screen flex-col bg-hero px-6">
      <div className="flex-1 grid place-items-center w-full">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-xl text-foreground">دخول الباحث</h1>
              <p className="text-xs text-muted-foreground">منطقة محمية — للمدير فقط.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="mt-6 w-full bg-primary text-primary-foreground"
          >
            {loading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
            تسجيل الدخول
          </Button>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Link to="/" className="hover:text-primary">
              العودة إلى الصفحة الرئيسية
            </Link>
          </p>
        </form>
      </div>
      <footer
        className="border-t border-border/10 bg-card/40 py-6 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-1.5 mt-auto px-4 w-full"
        dir="rtl"
      >
        <div className="leading-relaxed max-w-full text-center">
          © 2026 — استبيان أكاديمي. جميع الحقوق محفوظة لأغراض البحث العلمي.
        </div>
        <div className="text-[10px] opacity-75 font-mono text-center">تطوير: محمد الإمام</div>
      </footer>
    </div>
  );
}
