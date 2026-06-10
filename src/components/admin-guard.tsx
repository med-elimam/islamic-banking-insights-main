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
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
          <Link to="/" className="font-display text-base font-bold text-foreground">
            لوحة الباحث
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink
              to="/admin"
              active={path === "/admin"}
              icon={<LayoutDashboard className="h-4 w-4" />}
            >
              لوحة التحكم
            </NavLink>
            <NavLink
              to="/analysis"
              active={path === "/analysis"}
              icon={<LineChart className="h-4 w-4" />}
            >
              تحليل النتائج
            </NavLink>
            <NavLink to="/" icon={<Home className="h-4 w-4" />}>
              الموقع
            </NavLink>
          </nav>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="ml-2 h-4 w-4" />
            خروج
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8 flex-1 w-full">{children}</main>
      <footer className="py-6 text-center text-xs text-muted-foreground border-t border-border/10 font-mono opacity-80 mt-auto">
        تطوير: محمد الإمام
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
      className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}
