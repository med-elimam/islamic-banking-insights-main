import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ShieldCheck, BookOpen, BarChart3, GraduationCap } from "lucide-react";

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
  return (
    <div className="bg-hero min-h-screen">
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

        <section className="mx-auto mt-12 max-w-3xl rounded-2xl border border-border bg-card/60 p-6 text-sm leading-loose text-muted-foreground">
          <p>
            <strong className="text-foreground">السادة موظفي البنوك المحترمين،</strong>
            <br />
            في إطار إعداد بحث أكاديمي بعنوان «تحول البنوك التقليدية إلى بنوك إسلامية: الواقع
            والتحديات»، نرجو منكم التكرم بالإجابة عن أسئلة هذا الاستبيان. تهدف الدراسة إلى معرفة
            واقع تحول البنوك التقليدية في موريتانيا نحو الصيرفة الإسلامية، وتحديد أهم التحديات التي
            تواجه هذا التحول. جميع البيانات ستُستخدم لأغراض البحث العلمي فقط، مع ضمان السرية التامة
            وعدم استخدام المعلومات الشخصية لأي غرض آخر. شكراً لتعاونكم.
          </p>
        </section>
      </main>

      <footer className="border-t border-border/60 bg-card/40 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} — استبيان أكاديمي. جميع الحقوق محفوظة لأغراض البحث العلمي.
      </footer>
    </div>
  );
}
