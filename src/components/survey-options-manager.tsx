import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSurveyConfig } from "@/lib/use-survey-config";
import {
  OPTION_GROUPS,
  optionsByGroup,
  type OptionGroup,
  type SurveyOption,
} from "@/lib/survey-config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Save } from "lucide-react";
import { toast } from "sonner";

export function SurveyOptionsManager() {
  const config = useSurveyConfig(true);
  const qc = useQueryClient();
  const [group, setGroup] = useState<OptionGroup>("bank");
  const [labels, setLabels] = useState(["", "", ""]);
  if (config.isLoading) return <Loader2 className="mx-auto h-6 w-6 animate-spin" />;
  const grouped = optionsByGroup(config.data?.options ?? [], false),
    items = grouped.get(group) ?? [];
  const refresh = () => qc.invalidateQueries({ queryKey: ["survey-config"] });
  async function add() {
    if (labels.some((v) => !v.trim())) return toast.error("أدخل التسميات باللغات الثلاث.");
    const value = `custom-${crypto.randomUUID()}`;
    const { error } = await supabase.from("survey_options").insert({
      group_key: group,
      value,
      label_ar: labels[0].trim(),
      label_fr: labels[1].trim(),
      label_en: labels[2].trim(),
      order_index: Math.max(0, ...items.map((i) => i.order_index)) + 1,
      active: true,
    });
    if (error) return toast.error(error.message);
    setLabels(["", "", ""]);
    toast.success("تمت الإضافة.");
    await refresh();
  }
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {OPTION_GROUPS.map((g) => (
          <Button
            key={g.key}
            size="sm"
            variant={group === g.key ? "default" : "outline"}
            onClick={() => setGroup(g.key)}
          >
            {g.label}
          </Button>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">إضافة خيار</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-4">
          {["العربية", "Français", "English"].map((l, i) => (
            <Input
              key={l}
              placeholder={l}
              value={labels[i]}
              onChange={(e) => {
                const n = [...labels];
                n[i] = e.target.value;
                setLabels(n);
              }}
            />
          ))}
          <Button onClick={add}>
            <Plus className="ml-2 h-4 w-4" />
            إضافة
          </Button>
        </CardContent>
      </Card>
      {items.map((item) => (
        <OptionEditor key={item.id} item={item} refresh={refresh} />
      ))}
    </div>
  );
}
function OptionEditor({ item, refresh }: { item: SurveyOption; refresh: () => Promise<unknown> }) {
  const [labels, setLabels] = useState([item.label_ar, item.label_fr, item.label_en]);
  const [order, setOrder] = useState(item.order_index);
  async function save() {
    if (labels.some((v) => !v.trim())) return toast.error("جميع الترجمات مطلوبة.");
    const { error } = await supabase
      .from("survey_options")
      .update({
        label_ar: labels[0].trim(),
        label_fr: labels[1].trim(),
        label_en: labels[2].trim(),
        order_index: order,
      })
      .eq("id", item.id);
    if (error) return toast.error(error.message);
    toast.success("تم الحفظ.");
    await refresh();
  }
  async function toggle(active: boolean) {
    const { error } = await supabase.from("survey_options").update({ active }).eq("id", item.id);
    if (error) return toast.error(error.message);
    await refresh();
  }
  return (
    <Card className={!item.active ? "opacity-60" : ""}>
      <CardContent className="grid gap-2 p-4 md:grid-cols-[1fr_1fr_1fr_100px_auto_auto] md:items-end">
        {["العربية", "Français", "English"].map((l, i) => (
          <div key={l}>
            <label className="text-xs text-muted-foreground">{l}</label>
            <Input
              value={labels[i]}
              onChange={(e) => {
                const n = [...labels];
                n[i] = e.target.value;
                setLabels(n);
              }}
            />
          </div>
        ))}
        <div>
          <label className="text-xs">الترتيب</label>
          <Input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
        </div>
        <label className="flex items-center gap-2 pb-2 text-xs">
          مفعّل <Switch checked={item.active} onCheckedChange={toggle} />
        </label>
        <Button size="sm" onClick={save}>
          <Save className="ml-2 h-4 w-4" />
          حفظ
        </Button>
      </CardContent>
    </Card>
  );
}
