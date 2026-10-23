-- Move editable questionnaire data into Supabase so routine content changes do
-- not require a code deployment. Security, scoring and transactional writes
-- remain enforced by PostgreSQL.

CREATE TABLE public.survey_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  survey_open boolean NOT NULL DEFAULT true,
  closed_message_ar text NOT NULL DEFAULT 'الاستبيان مغلق مؤقتاً. يرجى المحاولة لاحقاً.',
  closed_message_fr text NOT NULL DEFAULT 'Le questionnaire est temporairement fermé. Veuillez réessayer plus tard.',
  closed_message_en text NOT NULL DEFAULT 'The questionnaire is temporarily closed. Please try again later.',
  logo_url text NOT NULL DEFAULT '/logo.svg',
  primary_color text NOT NULL DEFAULT '#0f766e' CHECK (primary_color ~ '^#[0-9A-Fa-f]{6}$'),
  accent_color text NOT NULL DEFAULT '#c79a3a' CHECK (accent_color ~ '^#[0-9A-Fa-f]{6}$'),
  pdf_url_ar text NOT NULL DEFAULT '/questionnaires/Questionnaire_academique_AR_Maryam_Limam.pdf',
  pdf_url_fr text NOT NULL DEFAULT '/questionnaires/Questionnaire_academique_FR_Maryam_Limam.pdf',
  pdf_url_en text NOT NULL DEFAULT '/questionnaires/Questionnaire_academique_EN_Maryam_Limam.pdf',
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.survey_settings (id) VALUES (true) ON CONFLICT (id) DO NOTHING;

CREATE TABLE public.survey_content (
  key text PRIMARY KEY CHECK (key ~ '^[a-z0-9_]+$'),
  category text NOT NULL,
  label text NOT NULL,
  value_ar text NOT NULL,
  value_fr text NOT NULL,
  value_en text NOT NULL,
  multiline boolean NOT NULL DEFAULT false,
  order_index integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.survey_content
  (key, category, label, value_ar, value_fr, value_en, multiline, order_index)
VALUES
  ('site_name', 'branding', 'اسم الموقع', 'استبيان أكاديمي', 'Questionnaire académique', 'Academic Questionnaire', false, 1),
  ('research_title', 'home', 'عنوان البحث', 'التحول من البنوك التقليدية إلى مصارف إسلامية ودوره في تطوير المنظومة المصرفية الموريتانية في ضوء تجارب بعض الدول العربية', 'Le passage des banques traditionnelles aux banques islamiques et son rôle dans le développement du système bancaire mauritanien à la lumière des expériences de certains pays arabes', 'The transition from traditional banks to Islamic banks and its role in the development of the Mauritanian banking system in light of the experiences of some Arab countries', true, 10),
  ('researcher_name', 'home', 'اسم الباحث', 'مريم الإمام', 'Maryam Limam', 'Maryam Limam', false, 11),
  ('hero_badge', 'home', 'الشارة أعلى العنوان', 'بحث في إطار أطروحة دكتوراه — السرية مضمونة', 'Recherche doctorale — Confidentialité garantie', 'Doctoral Research — Confidentiality Guaranteed', false, 12),
  ('intro_title', 'home', 'عنوان المقدمة', 'السادة مديري وموظفي البنوك المحترمين،', 'Mesdames et Messieurs les directeurs et membres du personnel bancaire,', 'Dear Bank Directors and Employees,', false, 13),
  ('intro_text', 'home', 'نص المقدمة', 'في إطار إعداد أطروحة دكتوراه، تضع الطالبة الباحثة مريم الإمام بين أيديكم هذا الاستبيان الأكاديمي، الذي يهدف إلى جمع آرائكم وخبراتكم المهنية حول واقع هذا التحول، والتحديات التي تواجهه، والنتائج التي تحققت بعد التحول.', 'Dans le cadre de la préparation de sa thèse de doctorat, la doctorante-chercheuse Maryam Limam vous soumet ce questionnaire académique. Il vise à recueillir vos avis et votre expérience professionnelle sur la réalité de cette transformation, les défis auxquels elle est confrontée et les résultats obtenus après sa mise en œuvre.', 'As part of her doctoral thesis, doctoral researcher Maryam Limam invites you to complete this academic questionnaire. It aims to collect your opinions and professional experience regarding the current state of this transition, the challenges it faces, and the results achieved following its implementation.', true, 14),
  ('privacy_text', 'home', 'رسالة الخصوصية', 'نؤكد لكم أن جميع الإجابات ستُستخدم حصراً لأغراض البحث العلمي، وستُعامل بسرية تامة.', 'Toutes les réponses seront utilisées exclusivement à des fins de recherche scientifique et traitées dans la plus stricte confidentialité.', 'All responses will be used exclusively for academic research purposes and will be treated with strict confidentiality.', true, 15),
  ('welcome_thanks', 'home', 'رسالة الشكر في المقدمة', 'نشكركم على وقتكم وتعاونكم القيّم.', 'Nous vous remercions pour votre temps et votre précieuse collaboration.', 'Thank you for your time and valuable cooperation.', false, 16),
  ('card_privacy_title', 'home', 'عنوان بطاقة الخصوصية', 'سرية تامة', 'Confidentialité', 'Strict Confidentiality', false, 20),
  ('card_privacy_text', 'home', 'نص بطاقة الخصوصية', 'جميع الإجابات تُستخدم حصراً لأغراض البحث العلمي.', 'Toutes les réponses sont réservées à la recherche scientifique.', 'All responses are used exclusively for academic research.', false, 21),
  ('card_structure_title', 'home', 'عنوان بطاقة الهيكل', 'ثلاثة محاور', 'Trois axes', 'Three Sections', false, 22),
  ('card_structure_text', 'home', 'نص بطاقة الهيكل ({count} = عدد الأسئلة)', '{count} عبارة وفق مقياس ليكرت الثلاثي، إضافة إلى سؤال مفتوح.', '{count} affirmations sur une échelle de Likert à trois modalités et une question ouverte.', '{count} statements on a three-point Likert scale plus one open-ended question.', false, 23),
  ('card_analysis_title', 'home', 'عنوان بطاقة التحليل', 'تحليل أكاديمي', 'Analyse académique', 'Academic Analysis', false, 24),
  ('card_analysis_text', 'home', 'نص بطاقة التحليل', 'تحليل منظم للنتائج حسب المحاور والبيانات العامة.', 'Analyse structurée des résultats par axe et données générales.', 'Structured analysis by section and general information.', false, 25),
  ('open_question', 'survey', 'السؤال المفتوح', 'ما أبرز الإجراءات التي تقترحونها لتسهيل تحول البنوك التقليدية إلى مصارف إسلامية في موريتانيا؟', 'Quelles sont les principales mesures que vous proposez pour faciliter la transformation des banques traditionnelles en banques islamiques en Mauritanie ?', 'What are the main measures you would propose to facilitate the transition of traditional banks to Islamic banks in Mauritania?', true, 30),
  ('thank_you_title', 'thanks', 'عنوان صفحة الشكر', 'شكراً لمساهمتكم في هذا البحث العلمي', 'Merci pour votre contribution à cette recherche', 'Thank you for your contribution to this research', false, 40),
  ('thank_you_text', 'thanks', 'نص صفحة الشكر', 'تم تسجيل إجاباتكم بنجاح. مساهمتكم تمثل قيمة كبيرة في إعداد هذا البحث الأكاديمي وفي تطوير المعرفة حول واقع وتحديات التحول نحو الصيرفة الإسلامية في موريتانيا.', 'Vos réponses ont été enregistrées avec succès. Votre contribution est d''une grande valeur pour la préparation de cette recherche académique et le développement des connaissances sur la réalité et les défis de la transition vers la finance islamique en Mauritanie.', 'Your responses have been successfully recorded. Your contribution is of great value in preparing this academic research and developing knowledge about the reality and challenges of transitioning to Islamic banking in Mauritania.', true, 41),
  ('footer_text', 'branding', 'نص التذييل', 'جميع الحقوق محفوظة لأغراض البحث العلمي.', 'Tous droits réservés à des fins de recherche scientifique.', 'All rights reserved for scientific research purposes.', false, 50)
ON CONFLICT (key) DO NOTHING;

CREATE TABLE public.survey_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_key text NOT NULL CHECK (group_key IN ('gender', 'age', 'education', 'bank', 'position', 'experience', 'training')),
  value text NOT NULL CHECK (char_length(value) BETWEEN 1 AND 100),
  label_ar text NOT NULL CHECK (char_length(label_ar) BETWEEN 1 AND 150),
  label_fr text NOT NULL CHECK (char_length(label_fr) BETWEEN 1 AND 150),
  label_en text NOT NULL CHECK (char_length(label_en) BETWEEN 1 AND 150),
  order_index integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (group_key, value)
);

INSERT INTO public.survey_options
  (group_key, value, label_ar, label_fr, label_en, order_index)
VALUES
  ('gender','ذكر','ذكر','Homme','Male',1), ('gender','أنثى','أنثى','Femme','Female',2),
  ('age','أقل من 30 سنة','أقل من 30 سنة','Moins de 30 ans','Under 30',1),
  ('age','من 30 إلى 40 سنة','من 30 إلى 40 سنة','De 30 à 40 ans','30 to 40',2),
  ('age','من 41 إلى 50 سنة','من 41 إلى 50 سنة','De 41 à 50 ans','41 to 50',3),
  ('education','ثانوي','ثانوي','Secondaire','Secondary school',1),
  ('education','ليسانس / إجازة','ليسانس / إجازة','Licence','Bachelor''s degree',2),
  ('education','ماستر','ماستر','Master','Master''s degree',3),
  ('education','دكتوراه','دكتوراه','Doctorat','Doctorate',4),
  ('education','تكوين مهني','تكوين مهني','Formation professionnelle','Vocational training',5),
  ('education','أخرى','أخرى','Autre','Other',6),
  ('bank','BMCI','BMCI','BMCI','BMCI',1), ('bank','BCI','BCI','BCI','BCI',2),
  ('bank','BNM','BNM','BNM','BNM',3), ('bank','BII','BII','BII','BII',4),
  ('bank','ABM','ABM','ABM','ABM',5), ('bank','بنك آخر','بنك آخر','Autre banque','Other bank',6),
  ('position','مدير','مدير','Directeur','Director',1),
  ('position','رئيس مصلحة','رئيس مصلحة','Chef de service','Department head',2),
  ('position','موظف عمليات مصرفية','موظف عمليات مصرفية','Agent des opérations bancaires','Banking operations officer',3),
  ('position','موظف تمويل أو ائتمان','موظف تمويل أو ائتمان','Agent de financement ou de crédit','Financing or credit officer',4),
  ('position','موظف إداري','موظف إداري','Agent administratif','Administrative employee',5),
  ('position','موظف خدمة أخرى','موظف خدمة أخرى','Employé d''un autre service','Other service role',6),
  ('experience','أقل من 5 سنوات','أقل من 5 سنوات','Moins de 5 ans','Under 5 years',1),
  ('experience','من 5 إلى 10 سنوات','من 5 إلى 10 سنوات','De 5 à 10 ans','5 to 10 years',2),
  ('experience','من 11 إلى 15 سنة','من 11 إلى 15 سنة','De 11 à 15 ans','11 to 15 years',3),
  ('experience','أكثر من 15 سنة','أكثر من 15 سنة','Plus de 15 ans','More than 15 years',4),
  ('training','نعم','نعم','Oui','Yes',1), ('training','لا','لا','Non','No',2)
ON CONFLICT (group_key, value) DO NOTHING;

CREATE TABLE public.survey_axes (
  id text PRIMARY KEY CHECK (id ~ '^[a-zA-Z0-9_-]+$'),
  name_ar text NOT NULL,
  name_fr text NOT NULL,
  name_en text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.survey_axes (id, name_ar, name_fr, name_en, order_index)
VALUES
 ('axis1','المحور الأول: دوافع تحول البنوك التقليدية إلى مصارف إسلامية','Axe 1 : Motivations de la transformation des banques traditionnelles en banques islamiques','Section 1: Drivers of the Transition from Traditional Banks to Islamic Banks',1),
 ('axis2','المحور الثاني: تحديات تحول البنوك التقليدية إلى الصيرفة الإسلامية','Axe 2 : Défis liés à la transformation des banques traditionnelles en banques islamiques','Section 2: Challenges in the Transition from Traditional Banks to Islamic Banking',2),
 ('axis3','المحور الثالث: النتائج المتوقعة لتحول البنوك التقليدية إلى الصيرفة الإسلامية','Axe 3 : Résultats attendus de la transformation des banques traditionnelles en banques islamiques','Section 3: Expected Outcomes of the Transition from Traditional Banks to Islamic Banking',3)
ON CONFLICT (id) DO NOTHING;

-- Keep inactive legacy questions available for historical reports. Their axes
-- are seeded inactive, while the three current axes above retain translations.
INSERT INTO public.survey_axes (id, name_ar, name_fr, name_en, order_index, active)
SELECT axis_id, max(axis_name), max(axis_name), max(axis_name),
       row_number() OVER (ORDER BY axis_id) + 100, bool_or(active)
FROM public.survey_questions
GROUP BY axis_id
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.survey_questions
  ADD COLUMN IF NOT EXISTS text_fr text,
  ADD COLUMN IF NOT EXISTS text_en text;

ALTER TABLE public.survey_questions DROP CONSTRAINT IF EXISTS survey_questions_axis_id_fkey;
ALTER TABLE public.survey_questions ADD CONSTRAINT survey_questions_axis_id_fkey
  FOREIGN KEY (axis_id) REFERENCES public.survey_axes(id) ON UPDATE CASCADE ON DELETE RESTRICT;

-- Fixed demographic CHECK constraints are replaced by live option validation
-- inside the atomic submission function.
ALTER TABLE public.responses DROP CONSTRAINT IF EXISTS chk_responses_gender;
ALTER TABLE public.responses DROP CONSTRAINT IF EXISTS chk_responses_age;
ALTER TABLE public.responses DROP CONSTRAINT IF EXISTS chk_responses_education;
ALTER TABLE public.responses DROP CONSTRAINT IF EXISTS chk_responses_bank;
ALTER TABLE public.responses DROP CONSTRAINT IF EXISTS chk_responses_position;
ALTER TABLE public.responses DROP CONSTRAINT IF EXISTS chk_responses_experience;
ALTER TABLE public.responses DROP CONSTRAINT IF EXISTS chk_responses_islamic_training;

ALTER TABLE public.responses ADD CONSTRAINT chk_responses_gender_length CHECK (gender IS NULL OR char_length(gender) BETWEEN 1 AND 100);
ALTER TABLE public.responses ADD CONSTRAINT chk_responses_age_length CHECK (age IS NULL OR char_length(age) BETWEEN 1 AND 100);
ALTER TABLE public.responses ADD CONSTRAINT chk_responses_education_length CHECK (char_length(education) BETWEEN 1 AND 100);
ALTER TABLE public.responses ADD CONSTRAINT chk_responses_bank_length CHECK (char_length(bank) BETWEEN 1 AND 100);
ALTER TABLE public.responses ADD CONSTRAINT chk_responses_position_length CHECK (char_length(position) BETWEEN 1 AND 100);
ALTER TABLE public.responses ADD CONSTRAINT chk_responses_experience_length CHECK (char_length(experience) BETWEEN 1 AND 100);
ALTER TABLE public.responses ADD CONSTRAINT chk_responses_training_length CHECK (islamic_training IS NULL OR char_length(islamic_training) BETWEEN 1 AND 100);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER survey_settings_updated_at BEFORE UPDATE ON public.survey_settings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER survey_content_updated_at BEFORE UPDATE ON public.survey_content
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER survey_options_updated_at BEFORE UPDATE ON public.survey_options
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER survey_axes_updated_at BEFORE UPDATE ON public.survey_axes
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.survey_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_axes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read survey settings" ON public.survey_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can read survey content" ON public.survey_content FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can read active survey options" ON public.survey_options FOR SELECT TO anon USING (active = true);
CREATE POLICY "Authenticated can read allowed survey options" ON public.survey_options FOR SELECT TO authenticated USING (active = true OR (SELECT private.is_admin()));
CREATE POLICY "Public can read active survey axes" ON public.survey_axes FOR SELECT TO anon USING (active = true);
CREATE POLICY "Authenticated can read allowed survey axes" ON public.survey_axes FOR SELECT TO authenticated USING (active = true OR (SELECT private.is_admin()));

CREATE POLICY "Admins can update survey settings" ON public.survey_settings FOR UPDATE TO authenticated USING ((SELECT private.is_admin())) WITH CHECK ((SELECT private.is_admin()));
CREATE POLICY "Admins can update survey content" ON public.survey_content FOR UPDATE TO authenticated USING ((SELECT private.is_admin())) WITH CHECK ((SELECT private.is_admin()));
CREATE POLICY "Admins can insert survey options" ON public.survey_options FOR INSERT TO authenticated WITH CHECK ((SELECT private.is_admin()));
CREATE POLICY "Admins can update survey options" ON public.survey_options FOR UPDATE TO authenticated USING ((SELECT private.is_admin())) WITH CHECK ((SELECT private.is_admin()));
CREATE POLICY "Admins can insert survey axes" ON public.survey_axes FOR INSERT TO authenticated WITH CHECK ((SELECT private.is_admin()));
CREATE POLICY "Admins can update survey axes" ON public.survey_axes FOR UPDATE TO authenticated USING ((SELECT private.is_admin())) WITH CHECK ((SELECT private.is_admin()));

GRANT SELECT ON public.survey_settings, public.survey_content, public.survey_options, public.survey_axes TO anon;
GRANT SELECT, UPDATE ON public.survey_settings, public.survey_content TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.survey_options, public.survey_axes TO authenticated;
GRANT ALL ON public.survey_settings, public.survey_content, public.survey_options, public.survey_axes TO service_role;

CREATE INDEX survey_questions_axis_id_idx ON public.survey_questions(axis_id);

-- Public asset bucket. Only admins may create/update/delete objects.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('survey-assets', 'survey-assets', true, 10485760, ARRAY['application/pdf','image/png','image/jpeg','image/webp'])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "Public can read survey assets" ON storage.objects FOR SELECT TO public USING (bucket_id = 'survey-assets');
CREATE POLICY "Admins can upload survey assets" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'survey-assets' AND (SELECT private.is_admin()));
CREATE POLICY "Admins can update survey assets" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'survey-assets' AND (SELECT private.is_admin())) WITH CHECK (bucket_id = 'survey-assets' AND (SELECT private.is_admin()));

CREATE OR REPLACE FUNCTION public.submit_survey_response(
  p_response_id uuid, p_gender text, p_age text, p_education text, p_bank text,
  p_position text, p_experience text, p_islamic_training text, p_open_answer text,
  p_language text, p_answers jsonb
)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_expected_count integer;
  v_answer_count integer;
  v_distinct_count integer;
  v_invalid_count integer;
  v_inserted_count integer;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.survey_settings WHERE id = true AND survey_open = true) THEN
    RAISE EXCEPTION 'Survey is closed' USING ERRCODE = '55000';
  END IF;

  IF p_language NOT IN ('ar','fr','en') OR (p_open_answer IS NOT NULL AND char_length(p_open_answer) > 4000) THEN
    RAISE EXCEPTION 'Invalid survey metadata' USING ERRCODE = '22023';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.survey_options WHERE group_key='gender' AND value=p_gender AND active)
    OR NOT EXISTS (SELECT 1 FROM public.survey_options WHERE group_key='age' AND value=p_age AND active)
    OR NOT EXISTS (SELECT 1 FROM public.survey_options WHERE group_key='education' AND value=p_education AND active)
    OR NOT EXISTS (SELECT 1 FROM public.survey_options WHERE group_key='bank' AND value=p_bank AND active)
    OR NOT EXISTS (SELECT 1 FROM public.survey_options WHERE group_key='position' AND value=p_position AND active)
    OR NOT EXISTS (SELECT 1 FROM public.survey_options WHERE group_key='experience' AND value=p_experience AND active)
    OR NOT EXISTS (SELECT 1 FROM public.survey_options WHERE group_key='training' AND value=p_islamic_training AND active)
  THEN
    RAISE EXCEPTION 'Invalid survey demographics' USING ERRCODE = '22023';
  END IF;

  SELECT count(*) INTO v_expected_count
  FROM public.survey_questions q
  JOIN public.survey_axes x ON x.id=q.axis_id
  WHERE q.active AND x.active;

  IF v_expected_count < 1 OR p_answers IS NULL OR jsonb_typeof(p_answers) <> 'array' OR jsonb_array_length(p_answers) <> v_expected_count THEN
    RAISE EXCEPTION 'Answer count does not match active questionnaire' USING ERRCODE = '22023';
  END IF;

  SELECT count(*), count(DISTINCT a.question_number), count(*) FILTER (
    WHERE a.answer_value NOT BETWEEN 1 AND 3 OR q.number IS NULL
  )
  INTO v_answer_count, v_distinct_count, v_invalid_count
  FROM jsonb_to_recordset(p_answers) a(question_number integer, answer_value integer)
  LEFT JOIN public.survey_questions q ON q.number=a.question_number AND q.active
  LEFT JOIN public.survey_axes x ON x.id=q.axis_id AND x.active
  WHERE x.id IS NOT NULL OR q.number IS NULL;

  IF v_answer_count <> v_expected_count OR v_distinct_count <> v_expected_count OR v_invalid_count <> 0 THEN
    RAISE EXCEPTION 'Answers must match every active question exactly once' USING ERRCODE = '22023';
  END IF;

  IF EXISTS (SELECT 1 FROM public.responses WHERE id=p_response_id) THEN RETURN p_response_id; END IF;

  INSERT INTO public.responses (id,gender,age,education,bank,position,experience,islamic_training,open_answer,language)
  VALUES (p_response_id,p_gender,p_age,p_education,p_bank,p_position,p_experience,p_islamic_training,NULLIF(btrim(p_open_answer),''),p_language);

  INSERT INTO public.answers (response_id,question_number,axis_name,answer_text,answer_value)
  SELECT p_response_id,q.number,x.name_ar,
    CASE a.answer_value WHEN 3 THEN 'أوافق' WHEN 2 THEN 'محايد' ELSE 'لا أوافق' END,
    a.answer_value
  FROM jsonb_to_recordset(p_answers) a(question_number integer, answer_value integer)
  JOIN public.survey_questions q ON q.number=a.question_number AND q.active
  JOIN public.survey_axes x ON x.id=q.axis_id AND x.active;

  GET DIAGNOSTICS v_inserted_count = ROW_COUNT;
  IF v_inserted_count <> v_expected_count THEN
    RAISE EXCEPTION 'Questionnaire changed during submission; please retry' USING ERRCODE = '40001';
  END IF;
  RETURN p_response_id;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_survey_response(uuid,text,text,text,text,text,text,text,text,text,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_survey_response(uuid,text,text,text,text,text,text,text,text,text,jsonb) TO anon, authenticated, service_role;

-- Seed the existing French and English question text.
UPDATE public.survey_questions SET text_fr='Le marché bancaire mauritanien manifeste un intérêt croissant pour les services financiers islamiques.', text_en='The Mauritanian banking market is showing growing interest in Islamic financial services.' WHERE number=1;
UPDATE public.survey_questions SET text_fr='La transformation de banques traditionnelles en banques islamiques a répondu à la demande croissante de services financiers islamiques.', text_en='The transition from traditional banks to Islamic banks was a response to the growing demand for Islamic financial services.' WHERE number=2;
UPDATE public.survey_questions SET text_fr='Le passage à la finance islamique contribue à renforcer la confiance des clients envers la banque.', text_en='The transition to Islamic banking helps strengthen customers'' trust in the bank.' WHERE number=3;
UPDATE public.survey_questions SET text_fr='Certaines banques traditionnelles ont de plus en plus tendance à intégrer des produits bancaires islamiques supplémentaires à leur offre.', text_en='Traditional banks are increasingly seeking to add further Islamic banking products to their services.' WHERE number=4;
UPDATE public.survey_questions SET text_fr='La réussite des expériences bancaires islamiques dans la région arabe constitue un facteur d''encouragement pour les banques mauritaniennes.', text_en='The success of Islamic banking experiences in the Arab region provides an incentive for Mauritanian banks.' WHERE number=5;
UPDATE public.survey_questions SET text_fr='Le passage à la finance islamique contribue à améliorer la compétitivité des banques ayant opéré cette transformation.', text_en='The transition to Islamic banking helps improve the competitiveness of banks that have made the transition.' WHERE number=6;
UPDATE public.survey_questions SET text_fr='La transformation aide à attirer une clientèle souhaitant éviter les opérations bancaires traditionnelles.', text_en='The transition helps attract customers who wish to avoid conventional banking transactions.' WHERE number=7;
UPDATE public.survey_questions SET text_fr='La création de fenêtres islamiques au sein des banques traditionnelles constitue une étape transitoire pratique vers leur transformation en banques islamiques.', text_en='Establishing Islamic windows within traditional banks represents a practical transitional stage toward becoming Islamic banks.' WHERE number=8;
UPDATE public.survey_questions SET text_fr='Les banques font face à une pénurie de ressources humaines qualifiées spécialisées dans la finance islamique.', text_en='Banks face a shortage of qualified human resources specializing in Islamic banking.' WHERE number=9;
UPDATE public.survey_questions SET text_fr='La transformation nécessite des modifications fondamentales des structures organisationnelles des banques.', text_en='The transition requires fundamental changes to banks'' organizational structures.' WHERE number=10;
UPDATE public.survey_questions SET text_fr='Les coûts de la transformation constituent l''un des principaux obstacles auxquels font face les banques traditionnelles.', text_en='Transition costs are among the main obstacles facing traditional banks.' WHERE number=11;
UPDATE public.survey_questions SET text_fr='Les systèmes d''information actuellement utilisés doivent être adaptés aux exigences de la finance islamique.', text_en='The information systems currently in use need to be developed to meet the requirements of Islamic banking.' WHERE number=12;
UPDATE public.survey_questions SET text_fr='Certains aspects juridiques et réglementaires nécessitent encore davantage d''adaptation pour soutenir la transformation.', text_en='Some legal and regulatory aspects still require further adaptation to support the transition.' WHERE number=13;
UPDATE public.survey_questions SET text_fr='Le personnel bancaire rencontre des difficultés liées à la compréhension des modes de financement islamique et de leurs modalités d''application.', text_en='Bank employees face challenges in understanding Islamic financing modes and their application mechanisms.' WHERE number=14;
UPDATE public.survey_questions SET text_fr='Les opérations de transformation sont menées sous la supervision d''instances spécialisées de contrôle de conformité à la charia.', text_en='The transition process is carried out under specialized Sharia supervisory bodies.' WHERE number=15;
UPDATE public.survey_questions SET text_fr='Le manque d''expérience pratique dans le domaine de la transformation bancaire constitue un défi pour les banques.', text_en='Limited practical experience in bank transformation represents a challenge for banks.' WHERE number=16;
UPDATE public.survey_questions SET text_fr='Les craintes liées aux risques opérationnels ralentissent le processus de transformation.', text_en='Concerns related to operational risks slow down the transition process.' WHERE number=17;
UPDATE public.survey_questions SET text_fr='Des programmes de formation et de perfectionnement sont accessibles au personnel.', text_en='Training and professional development programs are available and accessible to employees.' WHERE number=18;
UPDATE public.survey_questions SET text_fr='La transformation élargit la clientèle de la banque et augmente le volume de ses dépôts.', text_en='The transition expands the bank''s customer base and increases the volume of its deposits.' WHERE number=19;
UPDATE public.survey_questions SET text_fr='La transformation permet de proposer des produits financiers plus diversifiés.', text_en='The transition enables the bank to offer a more diverse range of financial products.' WHERE number=20;
UPDATE public.survey_questions SET text_fr='La transformation contribue au financement des activités économiques et d''investissement.', text_en='The transition supports the financing of economic and investment activities.' WHERE number=21;
UPDATE public.survey_questions SET text_fr='La transformation renforce la capacité de la banque à répondre aux besoins du marché local.', text_en='The transition strengthens the bank''s ability to respond to local market needs.' WHERE number=22;
UPDATE public.survey_questions SET text_fr='La transformation contribue à améliorer l''image institutionnelle de la banque.', text_en='The transition helps improve the bank''s institutional image.' WHERE number=23;
UPDATE public.survey_questions SET text_fr='La transformation peut avoir un effet positif sur la performance financière de la banque à long terme.', text_en='The transition may have a positive effect on the bank''s long-term financial performance.' WHERE number=24;
UPDATE public.survey_questions SET text_fr='La transformation aide à accroître les possibilités d''innovation dans les produits bancaires.', text_en='The transition helps increase opportunities for innovation in banking products.' WHERE number=25;
UPDATE public.survey_questions SET text_fr='Les perspectives de la finance islamique en Mauritanie semblent prometteuses si les conditions réglementaires et humaines nécessaires sont réunies.', text_en='The prospects for Islamic banking in Mauritania appear promising if the necessary regulatory and human-resource conditions are met.' WHERE number=26;
UPDATE public.survey_questions SET text_fr='La transformation contribue à accroître la maturité du secteur de la finance islamique dans le pays.', text_en='The transition contributes to increasing the maturity of the Islamic finance industry in the country.' WHERE number=27;
UPDATE public.survey_questions SET text_fr=text WHERE text_fr IS NULL;
UPDATE public.survey_questions SET text_en=text WHERE text_en IS NULL;
ALTER TABLE public.survey_questions ALTER COLUMN text_fr SET NOT NULL;
ALTER TABLE public.survey_questions ALTER COLUMN text_en SET NOT NULL;
