import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ShieldCheck, BookOpen, BarChart3, GraduationCap } from "lucide-react";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "تحول البنوك التقليدية إلى بنوك إسلامية — استبيان أكاديمي" },
      {
        name: "description",
        content:
          "استبيان أكاديمي حول واقع وتحديات تحول البنوك التقليدية الموريتانية إلى الصيرفة الإسلامية.",
      },
      { property: "og:title", content: "تحول البنوك التقليدية إلى بنوك إسلامية" },
      {
        property: "og:description",
        content: "استبيان أكاديمي — موظفو وإطارات البنوك التقليدية في موريتانيا.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [lang, setLang] = useState<"ar" | "fr" | "en">("ar");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("survey_lang");
      if (saved === "ar" || saved === "fr" || saved === "en") {
        setLang(saved);
      }
    }
  }, []);

  const changeLang = (l: "ar" | "fr" | "en") => {
    setLang(l);
    if (typeof window !== "undefined") {
      localStorage.setItem("survey_lang", l);
    }
  };

  return (
    <div className="bg-hero min-h-screen flex flex-col">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-display text-lg font-bold text-foreground"> استبيان أكاديمي</span>
        </div>
        <Link to="/auth" className="text-sm text-muted-foreground hover:text-primary">
          دخول الباحث
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-20 pt-10">
        <section className="mx-auto max-w-3xl text-center">
          <p className="mb-4 inline-block rounded-full border border-gold/40 bg-gold/10 px-4 py-1 text-xs font-semibold text-gold-foreground">
            بحث علمي محكّم — السرية مكفولة
          </p>
          <h1 className="font-display text-3xl leading-tight text-foreground sm:text-5xl">
            تحوُّل البنوك التقليدية إلى <span className="text-gradient-gold">بنوك إسلامية</span>
            <br />
            الواقع والتحديات في موريتانيا
          </h1>
          <p className="mt-6 text-base leading-loose text-muted-foreground sm:text-lg">
            يهدف هذا الاستبيان إلى استطلاع آراء موظفي وإطارات البنوك التقليدية في موريتانيا حول واقع
            واقع التحول نحو الصيرفة الإسلامية وأهم التحديات التي تواجه هذا التحول، وذلك في إطار بحث
            أكاديمي.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Link to="/survey">ابدأ الاستبيان</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/auth">لوحة الباحث</Link>
            </Button>
          </div>
        </section>

        <section className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: "سرية تامة",
              text: "جميع الإجابات تُستخدم لأغراض البحث العلمي حصراً.",
            },
            {
              icon: BookOpen,
              title: "خمسة محاور",
              text: "٣٩ عبارة وفق مقياس ليكرت الخماسي + سؤال مفتوح.",
            },
            {
              icon: BarChart3,
              title: "تحليل أكاديمي",
              text: "متوسطات، انحرافات، تفسير، ورسوم بيانية.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <Icon className="mb-3 h-6 w-6 text-gold" />
              <h3 className="mb-2 font-display text-lg font-bold text-foreground">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
            </div>
          ))}
        </section>

        <div className="mx-auto mt-12 max-w-3xl flex justify-end gap-2 mb-3 px-2 w-full">
          {(["ar", "fr", "en"] as const).map((l) => {
            const labels = { ar: "العربية", fr: "Français", en: "English" };
            return (
              <button
                key={l}
                type="button"
                onClick={() => changeLang(l)}
                className={`px-3 py-1 text-xs rounded-full border transition ${
                  lang === l
                    ? "bg-primary text-primary-foreground border-primary font-semibold"
                    : "bg-background text-foreground border-border hover:bg-muted cursor-pointer"
                }`}
              >
                {labels[l]}
              </button>
            );
          })}
        </div>

        <section
          className="mx-auto max-w-3xl rounded-2xl border border-border bg-card/60 p-6 text-sm leading-loose text-muted-foreground w-full"
          dir={lang === "ar" ? "rtl" : "ltr"}
        >
          {lang === "ar" && (
            <p>
              <strong className="text-foreground">السادة موظفي البنوك المحترمين،</strong>
              <br />
              في إطار إعداد أطروحة دكتوراه حول تحول البنوك التقليدية إلى بنوك إسلامية في موريتانيا،
              تتقدم الطالبة الباحثة مريم الإمام بهذا الاستبيان الأكاديمي بهدف جمع آرائكم وخبراتكم
              حول واقع هذا التحول وتحدياته وآفاقه المستقبلية.
              <br />
              نؤكد لكم أن جميع الإجابات ستُستخدم لأغراض علمية وبحثية فقط، وستُعامل بسرية تامة.
              <br />
              نشكركم على وقتكم وتعاونكم القيّم.
            </p>
          )}
          {lang === "fr" && (
            <p>
              <strong className="text-foreground">
                Mesdames, Messieurs les employés des banques,
              </strong>
              <br />
              Dans le cadre de la préparation d’une thèse de doctorat portant sur la transformation
              des banques conventionnelles en banques islamiques en Mauritanie, la doctorante Mariam
              El Imam propose ce questionnaire académique afin de recueillir vos avis et vos
              expériences concernant la réalité de cette transformation, ses défis et ses
              perspectives.
              <br />
              Nous vous assurons que toutes les réponses seront utilisées uniquement à des fins
              scientifiques et de recherche, et seront traitées avec une stricte confidentialité.
              <br />
              Nous vous remercions pour votre temps et votre précieuse collaboration.
            </p>
          )}
          {lang === "en" && (
            <p>
              <strong className="text-foreground">Dear respected bank employees,</strong>
              <br />
              As part of the preparation of a doctoral thesis on the transformation of conventional
              banks into Islamic banks in Mauritania, the doctoral researcher Mariam El Imam is
              conducting this academic survey to collect your views and professional experience
              regarding the current reality, challenges, and future prospects of this
              transformation.
              <br />
              All responses will be used strictly for academic and research purposes and will be
              treated with full confidentiality.
              <br />
              Thank you for your time and valuable cooperation.
            </p>
          )}
        </section>
      </main>

      <footer className="border-t border-border/60 bg-card/40 py-6 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-1.5 mt-auto">
        <div>
          {lang === "ar"
            ? `© ${new Date().getFullYear()} — استبيان أكاديمي. جميع الحقوق محفوظة لأغراض البحث العلمي.`
            : lang === "fr"
              ? `© ${new Date().getFullYear()} — Sondage Académique. Tous droits réservés à des fins de recherche scientifique.`
              : `© ${new Date().getFullYear()} — Academic Survey. All rights reserved for scientific research purposes.`}
        </div>
        <div className="text-[10px] opacity-75 font-mono">
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
