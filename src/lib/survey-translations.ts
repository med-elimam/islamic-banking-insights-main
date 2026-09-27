export type Language = "ar" | "fr" | "en";

export const UI_TRANSLATIONS = {
  ar: {
    title:
      "التحول من البنوك التقليدية إلى مصارف إسلامية ودوره في تطوير المنظومة المصرفية الموريتانية في ضوء تجارب بعض الدول العربية",
    description: "استبيان أكاديمي في إطار أطروحة دكتوراه للباحثة مريم الإمام.",
    stepOf: (curr: number, total: number) => `الخطوة ${curr} من ${total}`,
    previous: "السابق",
    next: "التالي",
    submit: "إرسال الاستبيان",
    submitting: "جارٍ الإرسال…",
    demographicsTitle: "المحور الأخير: البيانات العامة",
    demographicsDesc: "تُعالج جميع البيانات بسرية تامة وتُستخدم حصراً لأغراض البحث العلمي.",
    openTitle: "السؤال المفتوح",
    openLabel:
      "ما أبرز الإجراءات التي تقترحونها لتسهيل تحول البنوك التقليدية إلى مصارف إسلامية في موريتانيا؟",
    openPlaceholder: "اكتب مقترحاتك هنا…",
    websiteLabel: "الموقع الإلكتروني",
    selectLanguage: "اختر لغة الاستبيان / Choisir la langue / Select Language",
    missingFields: "لا يمكن حفظ الاستبيان. ينقصك:\n• ",
    alreadySubmitted: "لقد قمت بتعبئة الاستبيان من قبل من هذا المتصفح. شكراً لمساهمتكم.",
    invalidData: "بيانات الاستبيان غير صالحة.",
    invalidAnswers: "بعض الإجابات غير صالحة.",
    waitDelay: "يرجى الانتظار قليلاً قبل إرسال الاستبيان.",
    submitError: "حدث خطأ أثناء إرسال الاستبيان. حاول مجدداً.",
    likert: { 3: "أوافق", 2: "محايد", 1: "لا أوافق" },
    demoLabels: {
      gender: "الجنس",
      age: "العمر",
      education: "المؤهل العلمي",
      position: "الوظيفة",
      experience: "سنوات الخبرة",
      bank: "البنك الذي تعمل فيه",
      training: "هل سبق لك المشاركة في دورات أو تكوين يتعلق بالصيرفة الإسلامية؟",
    },
  },
  fr: {
    title:
      "Le passage des banques traditionnelles aux banques islamiques et son rôle dans le développement du système bancaire mauritanien à la lumière des expériences de certains pays arabes",
    description:
      "Questionnaire académique réalisé dans le cadre de la recherche doctorale de Maryam Limam.",
    stepOf: (curr: number, total: number) => `Étape ${curr} sur ${total}`,
    previous: "Précédent",
    next: "Suivant",
    submit: "Soumettre le questionnaire",
    submitting: "Envoi en cours…",
    demographicsTitle: "Dernier axe : Informations générales",
    demographicsDesc:
      "Toutes les données sont traitées dans la plus stricte confidentialité et utilisées exclusivement à des fins de recherche scientifique.",
    openTitle: "Question ouverte",
    openLabel:
      "Quelles sont les principales mesures que vous proposez pour faciliter la transformation des banques traditionnelles en banques islamiques en Mauritanie ?",
    openPlaceholder: "Écrivez vos propositions ici…",
    websiteLabel: "Site Web",
    selectLanguage: "Choisir la langue / Select Language / اختر لغة الاستبيان",
    missingFields: "Impossible de soumettre le questionnaire. Il vous manque :\n• ",
    alreadySubmitted:
      "Vous avez déjà soumis ce questionnaire depuis ce navigateur. Merci pour votre contribution.",
    invalidData: "Données du questionnaire invalides.",
    invalidAnswers: "Certaines réponses sont invalides.",
    waitDelay: "Veuillez patienter un instant avant de soumettre le questionnaire.",
    submitError: "Une erreur s'est produite lors de l'envoi du questionnaire. Veuillez réessayer.",
    likert: { 3: "D'accord", 2: "Neutre", 1: "Pas d'accord" },
    demoLabels: {
      gender: "Sexe",
      age: "Âge",
      education: "Niveau d'études",
      position: "Fonction",
      experience: "Années d'expérience",
      bank: "Banque dans laquelle vous travaillez",
      training: "Avez-vous déjà participé à une formation consacrée à la finance islamique ?",
    },
  },
  en: {
    title:
      "The transition from traditional banks to Islamic banks and its role in the development of the Mauritanian banking system in light of the experiences of some Arab countries",
    description: "Academic questionnaire conducted as part of Maryam Limam's doctoral research.",
    stepOf: (curr: number, total: number) => `Step ${curr} of ${total}`,
    previous: "Previous",
    next: "Next",
    submit: "Submit Questionnaire",
    submitting: "Submitting…",
    demographicsTitle: "Final Section: General Information",
    demographicsDesc:
      "All data is treated with strict confidentiality and used exclusively for academic research purposes.",
    openTitle: "Open-Ended Question",
    openLabel:
      "What are the main measures you would propose to facilitate the transition of traditional banks to Islamic banks in Mauritania?",
    openPlaceholder: "Write your proposals here…",
    websiteLabel: "Website",
    selectLanguage: "Select Language / Choisir la langue / اختر لغة الاستبيان",
    missingFields: "Cannot submit the questionnaire. Missing fields:\n• ",
    alreadySubmitted:
      "You have already completed this questionnaire from this browser. Thank you for your contribution.",
    invalidData: "Invalid questionnaire data.",
    invalidAnswers: "Some answers are invalid.",
    waitDelay: "Please wait a moment before submitting the questionnaire.",
    submitError: "An error occurred while submitting the questionnaire. Please try again.",
    likert: { 3: "Agree", 2: "Neutral", 1: "Disagree" },
    demoLabels: {
      gender: "Sex",
      age: "Age",
      education: "Education Level",
      position: "Position",
      experience: "Years of Experience",
      bank: "Bank Where You Work",
      training:
        "Have you previously participated in courses or training related to Islamic banking?",
    },
  },
} as const;

export const OPTION_MAPS = {
  gender: {
    ar: ["ذكر", "أنثى"],
    fr: ["Homme", "Femme"],
    en: ["Male", "Female"],
    db: { ذكر: "ذكر", أنثى: "أنثى", Homme: "ذكر", Femme: "أنثى", Male: "ذكر", Female: "أنثى" },
  },
  age: {
    ar: ["أقل من 30 سنة", "من 30 إلى 40 سنة", "من 41 إلى 50 سنة"],
    fr: ["Moins de 30 ans", "De 30 à 40 ans", "De 41 à 50 ans"],
    en: ["Under 30", "30 to 40", "41 to 50"],
    db: {
      "أقل من 30 سنة": "أقل من 30 سنة",
      "من 30 إلى 40 سنة": "من 30 إلى 40 سنة",
      "من 41 إلى 50 سنة": "من 41 إلى 50 سنة",
      "Moins de 30 ans": "أقل من 30 سنة",
      "De 30 à 40 ans": "من 30 إلى 40 سنة",
      "De 41 à 50 ans": "من 41 إلى 50 سنة",
      "Under 30": "أقل من 30 سنة",
      "30 to 40": "من 30 إلى 40 سنة",
      "41 to 50": "من 41 إلى 50 سنة",
    },
  },
  education: {
    ar: ["ثانوي", "ليسانس / إجازة", "ماستر", "دكتوراه", "تكوين مهني", "أخرى"],
    fr: ["Secondaire", "Licence", "Master", "Doctorat", "Formation professionnelle", "Autre"],
    en: [
      "Secondary school",
      "Bachelor's degree",
      "Master's degree",
      "Doctorate",
      "Vocational training",
      "Other",
    ],
    db: {
      ثانوي: "ثانوي",
      "ليسانس / إجازة": "ليسانس / إجازة",
      ماستر: "ماستر",
      دكتوراه: "دكتوراه",
      "تكوين مهني": "تكوين مهني",
      أخرى: "أخرى",
      Secondaire: "ثانوي",
      Licence: "ليسانس / إجازة",
      Master: "ماستر",
      Doctorat: "دكتوراه",
      "Formation professionnelle": "تكوين مهني",
      Autre: "أخرى",
      "Secondary school": "ثانوي",
      "Bachelor's degree": "ليسانس / إجازة",
      "Master's degree": "ماستر",
      Doctorate: "دكتوراه",
      "Vocational training": "تكوين مهني",
      Other: "أخرى",
    },
  },
  position: {
    ar: [
      "مدير",
      "رئيس مصلحة",
      "موظف عمليات مصرفية",
      "موظف تمويل أو ائتمان",
      "موظف إداري",
      "موظف خدمة أخرى",
    ],
    fr: [
      "Directeur",
      "Chef de service",
      "Agent des opérations bancaires",
      "Agent de financement ou de crédit",
      "Agent administratif",
      "Employé d'un autre service",
    ],
    en: [
      "Director",
      "Department head",
      "Banking operations officer",
      "Financing or credit officer",
      "Administrative employee",
      "Other service role",
    ],
    db: {
      مدير: "مدير",
      "رئيس مصلحة": "رئيس مصلحة",
      "موظف عمليات مصرفية": "موظف عمليات مصرفية",
      "موظف تمويل أو ائتمان": "موظف تمويل أو ائتمان",
      "موظف إداري": "موظف إداري",
      "موظف خدمة أخرى": "موظف خدمة أخرى",
      Directeur: "مدير",
      "Chef de service": "رئيس مصلحة",
      "Agent des opérations bancaires": "موظف عمليات مصرفية",
      "Agent de financement ou de crédit": "موظف تمويل أو ائتمان",
      "Agent administratif": "موظف إداري",
      "Employé d'un autre service": "موظف خدمة أخرى",
      Director: "مدير",
      "Department head": "رئيس مصلحة",
      "Banking operations officer": "موظف عمليات مصرفية",
      "Financing or credit officer": "موظف تمويل أو ائتمان",
      "Administrative employee": "موظف إداري",
      "Other service role": "موظف خدمة أخرى",
    },
  },
  experience: {
    ar: ["أقل من 5 سنوات", "من 5 إلى 10 سنوات", "من 11 إلى 15 سنة", "أكثر من 15 سنة"],
    fr: ["Moins de 5 ans", "De 5 à 10 ans", "De 11 à 15 ans", "Plus de 15 ans"],
    en: ["Under 5 years", "5 to 10 years", "11 to 15 years", "More than 15 years"],
    db: {
      "أقل من 5 سنوات": "أقل من 5 سنوات",
      "من 5 إلى 10 سنوات": "من 5 إلى 10 سنوات",
      "من 11 إلى 15 سنة": "من 11 إلى 15 سنة",
      "أكثر من 15 سنة": "أكثر من 15 سنة",
      "Moins de 5 ans": "أقل من 5 سنوات",
      "De 5 à 10 ans": "من 5 إلى 10 سنوات",
      "De 11 à 15 ans": "من 11 إلى 15 سنة",
      "Plus de 15 ans": "أكثر من 15 سنة",
      "Under 5 years": "أقل من 5 سنوات",
      "5 to 10 years": "من 5 إلى 10 سنوات",
      "11 to 15 years": "من 11 إلى 15 سنة",
      "More than 15 years": "أكثر من 15 سنة",
    },
  },
  bank: {
    ar: ["BMCI", "BCI", "BNM", "SGM", "BPM", "بنك آخر"],
    fr: ["BMCI", "BCI", "BNM", "SGM", "BPM", "Autre banque"],
    en: ["BMCI", "BCI", "BNM", "SGM", "BPM", "Other bank"],
    db: {
      BMCI: "BMCI",
      BCI: "BCI",
      BNM: "BNM",
      SGM: "SGM",
      BPM: "BPM",
      "بنك آخر": "بنك آخر",
      "Autre banque": "بنك آخر",
      "Other bank": "بنك آخر",
    },
  },
  training: {
    ar: ["نعم", "لا"],
    fr: ["Oui", "Non"],
    en: ["Yes", "No"],
    db: { نعم: "نعم", لا: "لا", Oui: "نعم", Non: "لا", Yes: "نعم", No: "لا" },
  },
} as const;

export const AXIS_TRANSLATIONS: Record<string, { fr: string; en: string }> = {
  axis1: {
    fr: "Axe 1 : Motivations de la transformation des banques traditionnelles en banques islamiques",
    en: "Section 1: Drivers of the Transition from Traditional Banks to Islamic Banks",
  },
  axis2: {
    fr: "Axe 2 : Défis liés à la transformation des banques traditionnelles en banques islamiques",
    en: "Section 2: Challenges in the Transition from Traditional Banks to Islamic Banking",
  },
  axis3: {
    fr: "Axe 3 : Résultats attendus de la transformation des banques traditionnelles en banques islamiques",
    en: "Section 3: Expected Outcomes of the Transition from Traditional Banks to Islamic Banking",
  },
};

export const QUESTION_TRANSLATIONS: Record<number, { fr: string; en: string }> = {
  1: {
    fr: "Le marché bancaire mauritanien manifeste un intérêt croissant pour les services financiers islamiques.",
    en: "The Mauritanian banking market is showing growing interest in Islamic financial services.",
  },
  2: {
    fr: "La transformation de banques traditionnelles en banques islamiques a répondu à la demande croissante de services financiers islamiques.",
    en: "The transition from traditional banks to Islamic banks was a response to the growing demand for Islamic financial services.",
  },
  3: {
    fr: "Le passage à la finance islamique contribue à renforcer la confiance des clients envers la banque.",
    en: "The transition to Islamic banking helps strengthen customers' trust in the bank.",
  },
  4: {
    fr: "Certaines banques traditionnelles ont de plus en plus tendance à intégrer des produits bancaires islamiques supplémentaires à leur offre.",
    en: "Traditional banks are increasingly seeking to add further Islamic banking products to their services.",
  },
  5: {
    fr: "La réussite des expériences bancaires islamiques dans la région arabe constitue un facteur d'encouragement pour les banques mauritaniennes.",
    en: "The success of Islamic banking experiences in the Arab region provides an incentive for Mauritanian banks.",
  },
  6: {
    fr: "Le passage à la finance islamique contribue à améliorer la compétitivité des banques ayant opéré cette transformation.",
    en: "The transition to Islamic banking helps improve the competitiveness of banks that have made the transition.",
  },
  7: {
    fr: "La transformation aide à attirer une clientèle souhaitant éviter les opérations bancaires traditionnelles.",
    en: "The transition helps attract customers who wish to avoid conventional banking transactions.",
  },
  8: {
    fr: "La création de fenêtres islamiques au sein des banques traditionnelles constitue une étape transitoire pratique vers leur transformation en banques islamiques.",
    en: "Establishing Islamic windows within traditional banks represents a practical transitional stage toward becoming Islamic banks.",
  },
  9: {
    fr: "Les banques font face à une pénurie de ressources humaines qualifiées spécialisées dans la finance islamique.",
    en: "Banks face a shortage of qualified human resources specializing in Islamic banking.",
  },
  10: {
    fr: "La transformation nécessite des modifications fondamentales des structures organisationnelles des banques.",
    en: "The transition requires fundamental changes to banks' organizational structures.",
  },
  11: {
    fr: "Les coûts de la transformation constituent l'un des principaux obstacles auxquels font face les banques traditionnelles.",
    en: "Transition costs are among the main obstacles facing traditional banks.",
  },
  12: {
    fr: "Les systèmes d'information actuellement utilisés doivent être adaptés aux exigences de la finance islamique.",
    en: "The information systems currently in use need to be developed to meet the requirements of Islamic banking.",
  },
  13: {
    fr: "Certains aspects juridiques et réglementaires nécessitent encore davantage d'adaptation pour soutenir la transformation.",
    en: "Some legal and regulatory aspects still require further adaptation to support the transition.",
  },
  14: {
    fr: "Le personnel bancaire rencontre des difficultés liées à la compréhension des modes de financement islamique et de leurs modalités d'application.",
    en: "Bank employees face challenges in understanding Islamic financing modes and their application mechanisms.",
  },
  15: {
    fr: "Les opérations de transformation sont menées sous la supervision d'instances spécialisées de contrôle de conformité à la charia.",
    en: "The transition process is carried out under specialized Sharia supervisory bodies.",
  },
  16: {
    fr: "Le manque d'expérience pratique dans le domaine de la transformation bancaire constitue un défi pour les banques.",
    en: "Limited practical experience in bank transformation represents a challenge for banks.",
  },
  17: {
    fr: "Les craintes liées aux risques opérationnels ralentissent le processus de transformation.",
    en: "Concerns related to operational risks slow down the transition process.",
  },
  18: {
    fr: "Des programmes de formation et de perfectionnement sont accessibles au personnel.",
    en: "Training and professional development programs are available and accessible to employees.",
  },
  19: {
    fr: "La transformation élargit la clientèle de la banque et augmente le volume de ses dépôts.",
    en: "The transition expands the bank's customer base and increases the volume of its deposits.",
  },
  20: {
    fr: "La transformation permet de proposer des produits financiers plus diversifiés.",
    en: "The transition enables the bank to offer a more diverse range of financial products.",
  },
  21: {
    fr: "La transformation contribue au financement des activités économiques et d'investissement.",
    en: "The transition supports the financing of economic and investment activities.",
  },
  22: {
    fr: "La transformation renforce la capacité de la banque à répondre aux besoins du marché local.",
    en: "The transition strengthens the bank's ability to respond to local market needs.",
  },
  23: {
    fr: "La transformation contribue à améliorer l'image institutionnelle de la banque.",
    en: "The transition helps improve the bank's institutional image.",
  },
  24: {
    fr: "La transformation peut avoir un effet positif sur la performance financière de la banque à long terme.",
    en: "The transition may have a positive effect on the bank's long-term financial performance.",
  },
  25: {
    fr: "La transformation aide à accroître les possibilités d'innovation dans les produits bancaires.",
    en: "The transition helps increase opportunities for innovation in banking products.",
  },
  26: {
    fr: "Les perspectives de la finance islamique en Mauritanie semblent prometteuses si les conditions réglementaires et humaines nécessaires sont réunies.",
    en: "The prospects for Islamic banking in Mauritania appear promising if the necessary regulatory and human-resource conditions are met.",
  },
  27: {
    fr: "La transformation contribue à accroître la maturité du secteur de la finance islamique dans le pays.",
    en: "The transition contributes to increasing the maturity of the Islamic finance industry in the country.",
  },
};
