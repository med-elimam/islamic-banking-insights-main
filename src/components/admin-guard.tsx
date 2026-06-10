import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, Link, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2, LayoutDashboard, LineChart, Home } from "lucide-react";

export function AdminGuard({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [status, setStatus] = useState<"loading" | "ok" | "denied">("loading");

  useEffect(() => {
    let active = true;
    async function check() {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        navigate({ to: "/auth" });
        return;
      }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", sess.session.user.id);
      if (!active) return;
      const isAdmin = (roles ?? []).some((r) => r.role === "admin");
      setStatus(isAdmin ? "ok" : "denied");
      if (!isAdmin) {
        await supabase.auth.signOut();
        navigate({ to: "/auth" });
      }
    }
    check();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate({ to: "/auth" });
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  if (status !== "ok") {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  return (
    <div
      className="min-h-screen flex flex-col bg-background max-w-full overflow-x-hidden"
      dir="rtl"
    >
      <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur w-full">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-1.5 sm:gap-4 px-2 sm:px-6 py-2.5 sm:py-3 w-full">
          <Link
            to="/"
            className="font-display text-sm sm:text-base font-bold text-foreground shrink-0 hidden xs:block"
          >
            لوحة الباحث
          </Link>
          <nav className="flex items-center gap-0.5 sm:gap-1.5 overflow-x-auto no-scrollbar">
            <NavLink
              to="/admin"
              active={path === "/admin"}
              icon={<LayoutDashboard className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />}
            >
              لوحة التحكم
            </NavLink>
            <NavLink
              to="/analysis"
              active={path === "/analysis"}
              icon={<LineChart className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />}
            >
              تحليل النتائج
            </NavLink>
            <NavLink to="/" icon={<Home className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />}>
              الموقع
            </NavLink>
          </nav>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="px-2 py-1 h-8 sm:h-9 text-xs sm:text-sm gap-1 sm:gap-1.5 shrink-0"
          >
            <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>خروج</span>
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-3 sm:px-6 py-6 sm:py-8 flex-1 w-full">{children}</main>
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

function NavLink({
  to,
  active,
  icon,
  children,
}: {
  to: string;
  active?: boolean;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-1 sm:gap-2 rounded-md px-1.5 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm transition shrink-0 ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {icon}
      <span className={to === "/" ? "hidden sm:inline" : ""}>{children}</span>
    </Link>
  );
}
