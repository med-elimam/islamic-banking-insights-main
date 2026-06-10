import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";

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
  const [lang, setLang] = useState<"ar" | "fr" | "en">("ar");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("survey_lang");
      if (saved === "ar" || saved === "fr" || saved === "en") {
        setLang(saved);
      }
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-hero px-6" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="flex-1 grid place-items-center w-full">
        <div className="max-w-xl rounded-2xl border border-border bg-card p-10 text-center shadow-sm w-full">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="font-display text-2xl text-foreground">
            {lang === "ar"
              ? "شكراً لمساهمتكم في هذا البحث العلمي"
              : lang === "fr"
                ? "Merci pour votre contribution à cette recherche"
                : "Thank you for your contribution to this research"}
          </h1>
          <p className="mt-3 text-sm leading-loose text-muted-foreground">
            {lang === "ar"
              ? "تم تسجيل إجاباتكم بنجاح. مساهمتكم تمثل قيمة كبيرة في إعداد هذا البحث الأكاديمي وفي تطوير المعرفة حول واقع وتحديات التحول نحو الصيرفة الإسلامية في موريتانيا."
              : lang === "fr"
                ? "Vos réponses ont été enregistrées avec succès. Votre contribution est d'une grande valeur pour la préparation de cette recherche académique et le développement des connaissances sur la réalité et les défis de la transition vers la finance islamique en Mauritanie."
                : "Your responses have been successfully recorded. Your contribution is of great value in preparing this academic research and developing knowledge about the reality and challenges of transitioning to Islamic banking in Mauritanie."}
          </p>
          <Button asChild className="mt-6 bg-primary text-primary-foreground">
            <Link to="/">
              {lang === "ar"
                ? "العودة إلى الصفحة الرئيسية"
                : lang === "fr"
                  ? "Retour à la page d'accueil"
                  : "Return to Main Page"}
            </Link>
          </Button>
        </div>
      </div>
      <footer
        className="border-t border-border/10 bg-card/40 py-6 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-1.5 mt-auto px-4 w-full"
        dir={lang === "ar" ? "rtl" : "ltr"}
      >
        <div className="leading-relaxed max-w-full text-center">
          {lang === "ar"
            ? "© 2026 — استبيان أكاديمي. جميع الحقوق محفوظة لأغراض البحث العلمي."
            : lang === "fr"
              ? "© 2026 — Questionnaire académique. Tous droits réservés à des fins de recherche scientifique."
              : "© 2026 — Academic Survey. All rights reserved for scientific research purposes."}
        </div>
        <div className="text-[10px] opacity-75 font-mono text-center">
          {lang === "ar"
            ? "تطوير: محمد الإمام"
            : lang === "fr"
              ? "Développé par Mohamed el imam"
              : "Developed by Mohamed el imam"}
        </div>
      </footer>
    </div>
  );
}
