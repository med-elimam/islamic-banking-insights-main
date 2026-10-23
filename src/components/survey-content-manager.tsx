import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSurveyConfig } from "@/lib/use-survey-config";
import { isHexColor, type SurveyContent, type SurveySettings } from "@/lib/survey-config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, Upload } from "lucide-react";
import { toast } from "sonner";

export function SurveyContentManager() {
  const config = useSurveyConfig(true);
  const qc = useQueryClient();
  if (config.isLoading || !config.data) return <Loader2 className="mx-auto h-6 w-6 animate-spin" />;
  const refresh = () => qc.invalidateQueries({ queryKey: ["survey-config"] });
  return (
    <div className="space-y-5">
      <SettingsEditor initial={config.data.settings} refresh={refresh} />
      {config.data.content.map((row) => (
        <ContentEditor key={row.key} row={row} refresh={refresh} />
      ))}
    </div>
  );
}

function SettingsEditor({
  initial,
  refresh,
}: {
  initial: SurveySettings;
  refresh: () => Promise<unknown>;
}) {
  const [s, setS] = useState(initial);
  const [saving, setSaving] = useState(false);
  async function save() {
    if (!isHexColor(s.primary_color) || !isHexColor(s.accent_color))
      return toast.error("صيغة اللون يجب أن تكون مثل #0f766e.");
    setSaving(true);
    const { id: _id, ...updates } = s;
    const { error } = await supabase.from("survey_settings").update(updates).eq("id", true);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("تم حفظ الإعدادات.");
    await refresh();
  }
  async function upload(file: File, kind: "logo" | "pdf", lang?: "ar" | "fr" | "en") {
    const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
    const path =
      kind === "logo" ? `branding/logo.${ext}` : `documents/questionnaire-${lang}.${ext}`;
    const { error } = await supabase.storage
      .from("survey-assets")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) return toast.error(error.message);
    const { data } = supabase.storage.from("survey-assets").getPublicUrl(path);
    setS((prev) =>
      kind === "logo"
        ? { ...prev, logo_url: data.publicUrl }
        : { ...prev, [`pdf_url_${lang}`]: data.publicUrl },
    );
    toast.success("تم الرفع؛ اضغط حفظ الإعدادات لتثبيت الرابط.");
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">النشر والهوية والملفات</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="flex items-center gap-3 font-medium">
          استقبال الاستبيانات{" "}
          <Switch checked={s.survey_open} onCheckedChange={(v) => setS({ ...s, survey_open: v })} />
        </label>
        <div className="grid gap-2 md:grid-cols-3">
          {(["ar", "fr", "en"] as const).map((lang) => (
            <Textarea
              key={lang}
              rows={2}
              value={s[`closed_message_${lang}`]}
              onChange={(e) => setS({ ...s, [`closed_message_${lang}`]: e.target.value })}
              placeholder={`رسالة الإغلاق ${lang}`}
            />
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-xs">اللون الأساسي</label>
            <Input
              type="color"
              value={s.primary_color}
              onChange={(e) => setS({ ...s, primary_color: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs">اللون الذهبي</label>
            <Input
              type="color"
              value={s.accent_color}
              onChange={(e) => setS({ ...s, accent_color: e.target.value })}
            />
          </div>
        </div>
        <FileUpload
          label="الشعار"
          accept="image/png,image/jpeg,image/webp"
          onFile={(f) => upload(f, "logo")}
        />
        <div className="grid gap-2 md:grid-cols-3">
          {(["ar", "fr", "en"] as const).map((lang) => (
            <FileUpload
              key={lang}
              label={`PDF ${lang.toUpperCase()}`}
              accept="application/pdf"
              onFile={(f) => upload(f, "pdf", lang)}
            />
          ))}
        </div>
        <Button onClick={save} disabled={saving}>
          <Save className="ml-2 h-4 w-4" />
          {saving ? "جارٍ الحفظ..." : "حفظ الإعدادات"}
        </Button>
      </CardContent>
    </Card>
  );
}
function FileUpload({
  label,
  accept,
  onFile,
}: {
  label: string;
  accept: string;
  onFile: (f: File) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-md border p-3 text-sm">
      <span>{label}</span>
      <Upload className="h-4 w-4" />
      <input
        className="hidden"
        type="file"
        accept={accept}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
    </label>
  );
}

function ContentEditor({ row, refresh }: { row: SurveyContent; refresh: () => Promise<unknown> }) {
  const [values, setValues] = useState([row.value_ar, row.value_fr, row.value_en]);
  const Control = row.multiline ? Textarea : Input;
  async function save() {
    if (values.some((v) => !v.trim())) return toast.error("جميع الترجمات مطلوبة.");
    const { error } = await supabase
      .from("survey_content")
      .update({
        value_ar: values[0].trim(),
        value_fr: values[1].trim(),
        value_en: values[2].trim(),
      })
      .eq("key", row.key);
    if (error) return toast.error(error.message);
    toast.success(`تم حفظ: ${row.label}`);
    await refresh();
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{row.label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 md:grid-cols-3">
          {["العربية", "Français", "English"].map((lang, i) => (
            <div key={lang}>
              <label className="text-xs text-muted-foreground">{lang}</label>
              <Control
                rows={row.multiline ? 4 : undefined}
                value={values[i]}
                onChange={(e) => {
                  const n = [...values];
                  n[i] = e.target.value;
                  setValues(n);
                }}
              />
            </div>
          ))}
        </div>
        <Button size="sm" onClick={save}>
          <Save className="ml-2 h-4 w-4" />
          حفظ
        </Button>
      </CardContent>
    </Card>
  );
}
