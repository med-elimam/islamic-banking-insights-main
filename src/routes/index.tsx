import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ShieldCheck, BookOpen, BarChart3, Download } from "lucide-react";
import { useEffect, useState } from "react";
import type { Language } from "@/lib/survey-translations";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "استبيان أكاديمي — تحول البنوك التقليدية إلى مصارف إسلامية" },
      {
        name: "description",
        content: "بحث أكاديمي حول تحول البنوك التقليدية إلى مصارف إسلامية في موريتانيا.",
      },
    ],
  }),
  component: Index,
});

const COPY = {
  ar: {
    survey: "استبيان أكاديمي",
    researcherLogin: "دخول الباحث",
    badge: "بحث في إطار أطروحة دكتوراه — السرية مضمونة",
    title:
      "التحول من البنوك التقليدية إلى مصارف إسلامية ودوره في تطوير المنظومة المصرفية الموريتانية في ضوء تجارب بعض الدول العربية",
    byline: "بحث في إطار أطروحة دكتوراه: مريم الإمام",
    introTitle: "السادة مديري وموظفي البنوك المحترمين،",
    intro:
      "في إطار إعداد أطروحة دكتوراه، تضع الطالبة الباحثة مريم الإمام بين أيديكم هذا الاستبيان الأكاديمي، الذي يهدف إلى جمع آرائكم وخبراتكم المهنية حول واقع هذا التحول، والتحديات التي تواجهه، والنتائج التي تحققت بعد التحول.",
    privacy: "نؤكد لكم أن جميع الإجابات ستُستخدم حصراً لأغراض البحث العلمي، وستُعامل بسرية تامة.",
    thanks: "نشكركم على وقتكم وتعاونكم القيّم.",
    start: "ابدأ الاستبيان",
    dashboard: "لوحة الباحث",
    download: "تنزيل النسخة الورقية PDF",
    cards: [
      ["سرية تامة", "جميع الإجابات تُستخدم حصراً لأغراض البحث العلمي."],
      ["ثلاثة محاور", "27 عبارة وفق مقياس ليكرت الثلاثي، إضافة إلى سؤال مفتوح."],
      ["تحليل أكاديمي", "تحليل منظم للنتائج حسب المحاور والبيانات العامة."],
    ],
  },
  fr: {
    survey: "Questionnaire académique",
    researcherLogin: "Accès chercheur",
    badge: "Recherche doctorale — Confidentialité garantie",
    title:
      "Le passage des banques traditionnelles aux banques islamiques et son rôle dans le développement du système bancaire mauritanien à la lumière des expériences de certains pays arabes",
    byline: "Recherche doctorale de Maryam Limam",
    introTitle: "Mesdames et Messieurs les directeurs et membres du personnel bancaire,",
    intro:
      "Dans le cadre de la préparation de sa thèse de doctorat, la doctorante-chercheuse Maryam Limam vous soumet ce questionnaire académique. Il vise à recueillir vos avis et votre expérience professionnelle sur la réalité de cette transformation, les défis auxquels elle est confrontée et les résultats obtenus après sa mise en œuvre.",
    privacy:
      "Toutes les réponses seront utilisées exclusivement à des fins de recherche scientifique et traitées dans la plus stricte confidentialité.",
    thanks: "Nous vous remercions pour votre temps et votre précieuse collaboration.",
    start: "Commencer le questionnaire",
    dashboard: "Espace chercheur",
    download: "Télécharger la version papier PDF",
    cards: [
      ["Confidentialité", "Toutes les réponses sont réservées à la recherche scientifique."],
      [
        "Trois axes",
        "27 affirmations sur une échelle de Likert à trois modalités et une question ouverte.",
      ],
      ["Analyse académique", "Analyse structurée des résultats par axe et données générales."],
    ],
  },
  en: {
    survey: "Academic Questionnaire",
    researcherLogin: "Researcher Login",
    badge: "Doctoral Research — Confidentiality Guaranteed",
    title:
      "The transition from traditional banks to Islamic banks and its role in the development of the Mauritanian banking system in light of the experiences of some Arab countries",
    byline: "Doctoral Research by Maryam Limam",
    introTitle: "Dear Bank Directors and Employees,",
    intro:
      "As part of her doctoral thesis, doctoral researcher Maryam Limam invites you to complete this academic questionnaire. It aims to collect your opinions and professional experience regarding the current state of this transition, the challenges it faces, and the results achieved following its implementation.",
    privacy:
      "All responses will be used exclusively for academic research purposes and will be treated with strict confidentiality.",
    thanks: "Thank you for your time and valuable cooperation.",
    start: "Start Questionnaire",
    dashboard: "Researcher Dashboard",
    download: "Download the Paper PDF",
    cards: [
      ["Strict Confidentiality", "All responses are used exclusively for academic research."],
      [
        "Three Sections",
        "27 statements on a three-point Likert scale plus one open-ended question.",
      ],
      ["Academic Analysis", "Structured analysis by section and general information."],
    ],
  },
} as const;

function Index() {
  const [lang, setLang] = useState<Language>("ar");

  useEffect(() => {
    const saved = localStorage.getItem("survey_lang");
    if (saved === "ar" || saved === "fr" || saved === "en") setLang(saved);
  }, []);

  const changeLang = (language: Language) => {
    setLang(language);
    localStorage.setItem("survey_lang", language);
  };
  const t = COPY[lang];
  const icons = [ShieldCheck, BookOpen, BarChart3];

  return (
    <div
      className={`min-h-screen bg-hero flex flex-col ${lang === "ar" ? "font-arabic" : "font-times"}`}
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-6">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="Logo" className="h-10 w-10 object-contain" />
          <span className="text-lg font-bold text-foreground">{t.survey}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-full border border-border bg-background/70 p-1">
            {(["ar", "fr", "en"] as const).map((language) => (
              <button
                key={language}
                type="button"
                onClick={() => changeLang(language)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${lang === language ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              >
                {language === "ar" ? "العربية" : language === "fr" ? "Français" : "English"}
              </button>
            ))}
          </div>
          <Link
            to="/auth"
            className="rounded-full border border-border bg-background/50 px-3 py-1 text-xs text-muted-foreground hover:text-primary"
          >
            {t.researcherLogin}
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 pb-20 pt-8">
        <section className="mx-auto max-w-4xl text-center">
          <p className="mb-5 inline-block rounded-full border border-primary/20 bg-primary/5 px-4 py-1 text-xs font-semibold text-primary">
            {t.badge}
          </p>
          <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-5xl">
            {t.title}
          </h1>
          <p className="mt-5 text-base font-semibold text-primary sm:text-lg">{t.byline}</p>
          <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-border bg-card p-6 text-start shadow-sm">
            <p className="font-bold text-foreground">{t.introTitle}</p>
            <p className="mt-3 leading-8 text-muted-foreground">{t.intro}</p>
            <p className="mt-3 leading-8 text-muted-foreground">{t.privacy}</p>
            <p className="mt-3 font-semibold text-foreground">{t.thanks}</p>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-primary text-primary-foreground">
              <Link to="/survey">{t.start}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/auth">{t.dashboard}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a
                href={`/questionnaires/Questionnaire_academique_${lang.toUpperCase()}_Maryam_Limam.pdf`}
                download
              >
                <Download className="h-4 w-4" />
                {t.download}
              </a>
            </Button>
          </div>
        </section>

        <section className="mx-auto mt-14 grid max-w-5xl gap-5 sm:grid-cols-3">
          {t.cards.map(([title, text], index) => {
            const Icon = icons[index];
            return (
              <div key={title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <Icon className="mb-3 h-6 w-6 text-primary" />
                <h2 className="text-lg font-bold text-foreground">{title}</h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{text}</p>
              </div>
            );
          })}
        </section>
      </main>

      <footer className="mt-auto border-t border-border/60 bg-card/40 px-4 py-6 text-center text-xs text-muted-foreground">
        © 2026 — {t.survey} · Maryam Limam
      </footer>
    </div>
  );
}
