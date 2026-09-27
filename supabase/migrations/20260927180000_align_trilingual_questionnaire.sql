-- Align the online questionnaire with the approved Arabic, French and English paper editions.

ALTER TABLE public.responses ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE public.responses ADD COLUMN IF NOT EXISTS age text;
ALTER TABLE public.responses ADD COLUMN IF NOT EXISTS islamic_training text;

ALTER TABLE public.responses DROP CONSTRAINT IF EXISTS chk_responses_gender;
ALTER TABLE public.responses DROP CONSTRAINT IF EXISTS chk_responses_age;
ALTER TABLE public.responses DROP CONSTRAINT IF EXISTS chk_responses_bank;
ALTER TABLE public.responses DROP CONSTRAINT IF EXISTS chk_responses_position;
ALTER TABLE public.responses DROP CONSTRAINT IF EXISTS chk_responses_islamic_training;

ALTER TABLE public.responses ADD CONSTRAINT chk_responses_gender
  CHECK (gender IS NULL OR gender IN ('ذكر', 'أنثى'));
ALTER TABLE public.responses ADD CONSTRAINT chk_responses_age
  CHECK (age IS NULL OR age IN ('أقل من 30 سنة', 'من 30 إلى 40 سنة', 'من 41 إلى 50 سنة'));
ALTER TABLE public.responses ADD CONSTRAINT chk_responses_bank
  CHECK (bank IN ('BMCI', 'BCI', 'BNM', 'SGM', 'Société Générale Mauritanie', 'BPM', 'بنك آخر'));
ALTER TABLE public.responses ADD CONSTRAINT chk_responses_position
  CHECK (position IN ('مدير', 'رئيس مصلحة', 'موظف عمليات مصرفية', 'موظف تمويل أو ائتمان', 'موظف إداري', 'موظف خدمة أخرى', 'موظف خدمة عملاء', 'أخرى'));
ALTER TABLE public.responses ADD CONSTRAINT chk_responses_islamic_training
  CHECK (islamic_training IS NULL OR islamic_training IN ('نعم', 'لا'));

DROP POLICY IF EXISTS "Anyone can submit responses" ON public.responses;
CREATE POLICY "Anyone can submit responses"
  ON public.responses FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    gender IN ('ذكر', 'أنثى')
    AND age IN ('أقل من 30 سنة', 'من 30 إلى 40 سنة', 'من 41 إلى 50 سنة')
    AND length(education) BETWEEN 1 AND 64
    AND bank IN ('BMCI', 'BCI', 'BNM', 'SGM', 'BPM', 'بنك آخر')
    AND position IN ('مدير', 'رئيس مصلحة', 'موظف عمليات مصرفية', 'موظف تمويل أو ائتمان', 'موظف إداري', 'موظف خدمة أخرى')
    AND length(experience) BETWEEN 1 AND 64
    AND islamic_training IN ('نعم', 'لا')
    AND (open_answer IS NULL OR length(open_answer) <= 4000)
    AND language IN ('ar', 'fr', 'en')
  );

INSERT INTO public.survey_questions (number, axis_id, axis_name, text, order_index, active)
VALUES
  (1, 'axis1', 'المحور الأول: دوافع تحول البنوك التقليدية إلى مصارف إسلامية', 'يشهد السوق المصرفي الموريتاني اهتماماً متزايداً بالخدمات المالية الإسلامية.', 1, true),
  (2, 'axis1', 'المحور الأول: دوافع تحول البنوك التقليدية إلى مصارف إسلامية', 'كان التحول من بنوك تقليدية إلى بنوك إسلامية استجابة لتزايد الطلب على الخدمات المالية الإسلامية.', 2, true),
  (3, 'axis1', 'المحور الأول: دوافع تحول البنوك التقليدية إلى مصارف إسلامية', 'يسهم التحول إلى الصيرفة الإسلامية في تعزيز ثقة المتعاملين مع البنك.', 3, true),
  (4, 'axis1', 'المحور الأول: دوافع تحول البنوك التقليدية إلى مصارف إسلامية', 'يتزايد توجه بعض البنوك التقليدية إلى إدراج منتجات مصرفية إسلامية إضافية ضمن خدماتها.', 4, true),
  (5, 'axis1', 'المحور الأول: دوافع تحول البنوك التقليدية إلى مصارف إسلامية', 'يشكل نجاح التجارب المصرفية الإسلامية في المنطقة العربية حافزاً للبنوك الموريتانية.', 5, true),
  (6, 'axis1', 'المحور الأول: دوافع تحول البنوك التقليدية إلى مصارف إسلامية', 'يسهم التحول إلى الصيرفة الإسلامية في تحسين القدرة التنافسية للبنوك المتحولة.', 6, true),
  (7, 'axis1', 'المحور الأول: دوافع تحول البنوك التقليدية إلى مصارف إسلامية', 'يساعد التحول في استقطاب شريحة من العملاء الذين يرغبون في تجنب التعاملات المصرفية التقليدية.', 7, true),
  (8, 'axis1', 'المحور الأول: دوافع تحول البنوك التقليدية إلى مصارف إسلامية', 'يمثل إنشاء نوافذ إسلامية داخل البنوك التقليدية مرحلة انتقالية عملية نحو التحول إلى بنوك إسلامية.', 8, true),
  (9, 'axis2', 'المحور الثاني: تحديات تحول البنوك التقليدية إلى الصيرفة الإسلامية', 'تواجه البنوك نقصاً في عدد الكفاءات البشرية المتخصصة في الصيرفة الإسلامية.', 1, true),
  (10, 'axis2', 'المحور الثاني: تحديات تحول البنوك التقليدية إلى الصيرفة الإسلامية', 'يتطلب التحول تعديلات جوهرية في الهياكل التنظيمية للبنوك.', 2, true),
  (11, 'axis2', 'المحور الثاني: تحديات تحول البنوك التقليدية إلى الصيرفة الإسلامية', 'تمثل تكاليف التحول أحد أهم العوائق أمام البنوك التقليدية.', 3, true),
  (12, 'axis2', 'المحور الثاني: تحديات تحول البنوك التقليدية إلى الصيرفة الإسلامية', 'تحتاج الأنظمة المعلوماتية المستخدمة حالياً إلى تطوير بما يتلاءم مع متطلبات الصيرفة الإسلامية.', 4, true),
  (13, 'axis2', 'المحور الثاني: تحديات تحول البنوك التقليدية إلى الصيرفة الإسلامية', 'ما تزال بعض الجوانب القانونية والتنظيمية بحاجة إلى مزيد من التكييف لدعم التحول.', 5, true),
  (14, 'axis2', 'المحور الثاني: تحديات تحول البنوك التقليدية إلى الصيرفة الإسلامية', 'يواجه العاملون في البنوك تحديات تتعلق باستيعاب صيغ التمويل الإسلامي وآليات تطبيقها.', 6, true),
  (15, 'axis2', 'المحور الثاني: تحديات تحول البنوك التقليدية إلى الصيرفة الإسلامية', 'تتم عمليات التحول في ظل هيئات رقابة شرعية متخصصة.', 7, true),
  (16, 'axis2', 'المحور الثاني: تحديات تحول البنوك التقليدية إلى الصيرفة الإسلامية', 'تمثل محدودية الخبرة العملية في مجال التحول المصرفي تحدياً للبنوك.', 8, true),
  (17, 'axis2', 'المحور الثاني: تحديات تحول البنوك التقليدية إلى الصيرفة الإسلامية', 'تؤدي المخاوف المرتبطة بالمخاطر التشغيلية إلى إبطاء عملية التحول.', 9, true),
  (18, 'axis2', 'المحور الثاني: تحديات تحول البنوك التقليدية إلى الصيرفة الإسلامية', 'برامج التدريب والتأهيل متاحة وميسرة للعاملين.', 10, true),
  (19, 'axis3', 'المحور الثالث: النتائج المتوقعة لتحول البنوك التقليدية إلى الصيرفة الإسلامية', 'يؤدي التحول إلى توسيع قاعدة المتعاملين مع البنك ويزيد من حجم ودائعه.', 1, true),
  (20, 'axis3', 'المحور الثالث: النتائج المتوقعة لتحول البنوك التقليدية إلى الصيرفة الإسلامية', 'يساعد التحول على تقديم منتجات مالية أكثر تنوعاً.', 2, true),
  (21, 'axis3', 'المحور الثالث: النتائج المتوقعة لتحول البنوك التقليدية إلى الصيرفة الإسلامية', 'يسهم التحول في دعم تمويل الأنشطة الاقتصادية والاستثمارية.', 3, true),
  (22, 'axis3', 'المحور الثالث: النتائج المتوقعة لتحول البنوك التقليدية إلى الصيرفة الإسلامية', 'يعزز التحول قدرة البنك على الاستجابة لاحتياجات السوق المحلية.', 4, true),
  (23, 'axis3', 'المحور الثالث: النتائج المتوقعة لتحول البنوك التقليدية إلى الصيرفة الإسلامية', 'يسهم التحول في تحسين الصورة المؤسسية للبنك.', 5, true),
  (24, 'axis3', 'المحور الثالث: النتائج المتوقعة لتحول البنوك التقليدية إلى الصيرفة الإسلامية', 'يمكن أن ينعكس التحول إيجاباً على الأداء المالي للبنك على المدى الطويل.', 6, true),
  (25, 'axis3', 'المحور الثالث: النتائج المتوقعة لتحول البنوك التقليدية إلى الصيرفة الإسلامية', 'يساعد التحول على زيادة فرص الابتكار في المنتجات المصرفية.', 7, true),
  (26, 'axis3', 'المحور الثالث: النتائج المتوقعة لتحول البنوك التقليدية إلى الصيرفة الإسلامية', 'تبدو آفاق الصيرفة الإسلامية واعدة في موريتانيا إذا توافرت الشروط التنظيمية والبشرية اللازمة.', 8, true),
  (27, 'axis3', 'المحور الثالث: النتائج المتوقعة لتحول البنوك التقليدية إلى الصيرفة الإسلامية', 'يسهم التحول في زيادة نضج الصناعة المالية الإسلامية في البلاد.', 9, true)
ON CONFLICT (number) DO UPDATE SET
  axis_id = EXCLUDED.axis_id,
  axis_name = EXCLUDED.axis_name,
  text = EXCLUDED.text,
  order_index = EXCLUDED.order_index,
  active = EXCLUDED.active,
  updated_at = now();

UPDATE public.survey_questions SET active = false, updated_at = now() WHERE number > 27;

DROP POLICY IF EXISTS "Anyone can submit answers" ON public.answers;
CREATE POLICY "Anyone can submit answers"
  ON public.answers FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    answer_value BETWEEN 1 AND 3
    AND question_number BETWEEN 1 AND 27
    AND length(axis_name) BETWEEN 1 AND 200
    AND length(answer_text) BETWEEN 1 AND 200
  );
