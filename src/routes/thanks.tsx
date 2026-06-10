import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/thanks")({
  head: () => ({
    meta: [
      { title: "شكراً لمساهمتكم — الاستبيان الأكاديمي" },
      {
        name: "description",
        content: "تم تسجيل إجاباتكم بنجاح. شكراً لمساهمتكم في هذا البحث العلمي.",
      },
    ],
  }),
  component: ThanksPage,
});

function ThanksPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-hero px-6">
      <div className="max-w-xl rounded-2xl border border-border bg-card p-10 text-center shadow-sm">
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="font-display text-2xl text-foreground">
          شكراً لمساهمتكم في هذا البحث العلمي
        </h1>
        <p className="mt-3 text-sm leading-loose text-muted-foreground">
          تم تسجيل إجاباتكم بنجاح. مساهمتكم تمثل قيمة كبيرة في إعداد هذا البحث الأكاديمي وفي تطوير
          المعرفة حول واقع وتحديات التحول نحو الصيرفة الإسلامية في موريتانيا.
        </p>
        <Button asChild className="mt-6 bg-primary text-primary-foreground">
          <Link to="/">العودة إلى الصفحة الرئيسية</Link>
        </Button>
      </div>
    </div>
  );
}
