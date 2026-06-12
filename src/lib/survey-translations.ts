export type Language = "ar" | "fr" | "en";

export const UI_TRANSLATIONS = {
  ar: {
    title: "الاستبيان — تحول البنوك التقليدية إلى بنوك إسلامية",
    description: "أجب عن أسئلة الاستبيان الأكاديمي حول الصيرفة الإسلامية في موريتانيا.",
    stepOf: (curr: number, total: number) => `الخطوة ${curr} من ${total}`,
    previous: "السابق",
    next: "التالي",
    submit: "إرسال الاستبيان",
    submitting: "جارٍ الإرسال…",
    demographicsTitle: "المحور الأول: البيانات العامة",
    demographicsDesc:
      "جميع البيانات الشخصية تُعالج بسرية تامة وتُستخدم لأغراض التحليل الإحصائي فقط.",
    openTitle: "سؤال مفتوح",
    openLabel:
      "يرجى كتابة أي تعليقات أو مقترحات إضافية حول موضوع التحول نحو الصيرفة الإسلامية في موريتانيا (اختياري):",
    websiteLabel: "الموقع الإلكتروني",
    selectLanguage: "اختر لغة الاستبيان / Choisir la langue / Select Language",
    missingFields: "لا يمكن حفظ الاستبيان. ينقصك:\n• ",
    alreadySubmitted: "لقد قمت بتعبئة الاستبيان من قبل من هذا المتصفح. شكراً لمساهمتكم.",
    invalidData: "بيانات الاستبيان غير صالحة.",
    invalidAnswers: "بعض الإجابات غير صالحة.",
    waitDelay: "يرجى الانتظار قليلاً قبل إرسال الاستبيان.",
    submitError: "حدث خطأ أثناء إرسال الاستبيان. حاول مجدداً.",
    likert: {
      5: "موافق بشدة",
      4: "موافق",
      3: "محايد",
      2: "غير موافق",
      1: "غير موافق بشدة",
    },
    demoLabels: {
      education: "المؤهل العلمي",
      bank: "البنك الذي تعمل فيه",
      position: "الوظيفة",
      experience: "سنوات الخبرة",
    },
  },
  fr: {
    title: "Sondage — Transition des banques conventionnelles vers la finance islamique",
    description: "Répondez au questionnaire académique sur la finance islamique en Mauritanie.",
    stepOf: (curr: number, total: number) => `Étape ${curr} sur ${total}`,
    previous: "Précédent",
    next: "Suivant",
    submit: "Soumettre le questionnaire",
    submitting: "Envoi en cours…",
    demographicsTitle: "Axe 1 : Informations Générales",
    demographicsDesc:
      "Toutes les données personnelles sont traitées de manière confidentielle et uniquement à des fins d'analyse statistique.",
    openTitle: "Question ouverte",
    openLabel:
      "Veuillez écrire vos commentaires ou suggestions supplémentaires sur le thème de la transition vers la finance islamique en Mauritanie (optionnel) :",
    websiteLabel: "Site Web",
    selectLanguage: "Choisir la langue / Select Language / اختر لغة الاستبيان",
    missingFields: "Impossible de soumettre le questionnaire. Il vous manque :\n• ",
    alreadySubmitted:
      "Vous avez déjà soumis ce sondage depuis ce navigateur. Merci pour votre contribution.",
    invalidData: "Données de sondage invalides.",
    invalidAnswers: "Certaines réponses sont invalides.",
    waitDelay: "Veuillez patienter un instant avant de soumettre le questionnaire.",
    submitError: "Une erreur s'est produite lors de l'envoi du questionnaire. Veuillez réessayer.",
    likert: {
      5: "Tout à fait d'accord",
      4: "D'accord",
      3: "Neutre",
      2: "Pas d'accord",
      1: "Absolument pas d'accord",
    },
    demoLabels: {
      education: "Niveau d'études",
      bank: "Votre banque",
      position: "Poste",
      experience: "Années d'expérience",
    },
  },
  en: {
    title: "Survey — Transition of conventional banks to Islamic banking",
    description: "Answer the academic survey questionnaire about Islamic banking in Mauritania.",
    stepOf: (curr: number, total: number) => `Step ${curr} of ${total}`,
    previous: "Previous",
    next: "Next",
    submit: "Submit Survey",
    submitting: "Submitting...",
    demographicsTitle: "Axis 1: General Information",
    demographicsDesc:
      "All personal data is treated confidentially and used solely for statistical analysis.",
    openTitle: "Open-ended Question",
    openLabel:
      "Please write any additional comments or suggestions on the transition towards Islamic banking in Mauritania (optional):",
    websiteLabel: "Website",
    selectLanguage: "Select Language / Choisir la langue / اختر لغة الاستبيان",
    missingFields: "Cannot submit survey. Missing fields:\n• ",
    alreadySubmitted:
      "You have already completed this survey from this browser. Thank you for your contribution.",
    invalidData: "Invalid survey data.",
    invalidAnswers: "Some answers are invalid.",
    waitDelay: "Please wait a moment before submitting the survey.",
    submitError: "An error occurred during survey submission. Please try again.",
    likert: {
      5: "Strongly Agree",
      4: "Agree",
      3: "Neutral",
      2: "Disagree",
      1: "Strongly Disagree",
    },
    demoLabels: {
      education: "Education Level",
      bank: "Your Bank",
      position: "Position",
      experience: "Years of Experience",
    },
  },
};

export const OPTION_MAPS = {
  education: {
    ar: ["ثانوي", "ليسانس / إجازة", "ماستر", "دكتوراه", "تكوين مهني", "أخرى"],
    fr: [
      "Secondaire",
      "Licence / Bac+3",
      "Master",
      "Doctorat",
      "Formation Professionnelle",
      "Autre",
    ],
    en: ["Secondary", "Bachelor's / License", "Master's", "Ph.D.", "Vocational Training", "Other"],
    db: {
      Secondaire: "ثانوي",
      "Licence / Bac+3": "ليسانس / إجازة",
      Master: "ماستر",
      Doctorat: "دكتوراه",
      "Formation Professionnelle": "تكوين مهني",
      Autre: "أخرى",
      Secondary: "ثانوي",
      "Bachelor's / License": "ليسانس / إجازة",
      "Master's": "ماستر",
      "Ph.D.": "دكتوراه",
      "Vocational Training": "تكوين مهني",
      Other: "أخرى",
      ثانوي: "ثانوي",
      "ليسانس / إجازة": "ليسانس / إجازة",
      ماستر: "ماستر",
      دكتوراه: "دكتوراه",
      "تكوين مهني": "تكوين مهني",
      أخرى: "أخرى",
    },
  },
  bank: {
    ar: ["BMCI", "BCI", "BNM", "Société Générale Mauritanie", "BPM", "بنك آخر"],
    fr: ["BMCI", "BCI", "BNM", "Société Générale Mauritanie", "BPM", "Autre banque"],
    en: ["BMCI", "BCI", "BNM", "Société Générale Mauritanie", "BPM", "Other bank"],
    db: {
      "Autre banque": "بنك آخر",
      "Other bank": "بنك آخر",
      BMCI: "BMCI",
      BCI: "BCI",
      BNM: "BNM",
      "Société Générale Mauritanie": "Société Générale Mauritanie",
      BPM: "BPM",
      "بنك آخر": "بنك آخر",
    },
  },
  position: {
    ar: [
      "مدير",
      "رئيس مصلحة",
      "موظف عمليات مصرفية",
      "موظف تمويل أو ائتمان",
      "موظف إداري",
      "موظف خدمة عملاء",
      "أخرى",
    ],
    fr: [
      "Directeur / Manager",
      "Chef de service",
      "Agent d'opérations bancaires",
      "Agent de crédit / financement",
      "Agent administratif",
      "Chargé de clientèle",
      "Autre",
    ],
    en: [
      "Manager",
      "Head of Department",
      "Banking Operations Officer",
      "Credit/Finance Officer",
      "Administrative Officer",
      "Customer Service Officer",
      "Other",
    ],
    db: {
      "Directeur / Manager": "مدير",
      "Chef de service": "رئيس مصلحة",
      "Agent d'opérations bancaires": "موظف عمليات مصرفية",
      "Agent de crédit / financement": "موظف تمويل أو ائتمان",
      "Agent administratif": "موظف إداري",
      "Chargé de clientèle": "موظف خدمة عملاء",
      Autre: "أخرى",
      Manager: "مدير",
      "Head of Department": "رئيس مصلحة",
      "Banking Operations Officer": "موظف عمليات مصرفية",
      "Credit/Finance Officer": "موظف تمويل أو ائتمان",
      "Administrative Officer": "موظف إداري",
      "Customer Service Officer": "موظف خدمة عملاء",
      Other: "أخرى",
      مدير: "مدير",
      "رئيس مصلحة": "رئيس مصلحة",
      "موظف عمليات مصرفية": "موظف عمليات مصرفية",
      "موظف تمويل أو ائتمان": "موظف تمويل أو ائتمان",
      "موظف إداري": "موظف إداري",
      "موظف خدمة عملاء": "موظف خدمة عملاء",
      أخرى: "أخرى",
    },
  },
  experience: {
    ar: ["أقل من 5 سنوات", "من 5 إلى 10 سنوات", "من 11 إلى 15 سنة", "أكثر من 15 سنة"],
    fr: ["Moins de 5 ans", "5 à 10 ans", "11 à 15 ans", "Plus de 15 ans"],
    en: ["Less than 5 years", "5 to 10 years", "11 to 15 years", "More than 15 years"],
    db: {
      "Moins de 5 ans": "أقل من 5 سنوات",
      "5 à 10 ans": "من 5 إلى 10 سنوات",
      "11 à 15 ans": "من 11 إلى 15 سنة",
      "Plus de 15 ans": "أكثر من 15 سنة",
      "Less than 5 years": "أقل من 5 سنوات",
      "5 to 10 years": "من 5 إلى 10 سنوات",
      "11 to 15 years": "من 11 إلى 15 سنة",
      "More than 15 years": "أكثر من 15 سنة",
      "أقل من 5 سنوات": "أقل من 5 سنوات",
      "من 5 إلى 10 سنوات": "من 5 إلى 10 سنوات",
      "من 11 إلى 15 سنة": "من 11 إلى 15 سنة",
      "أكثر من 15 سنة": "أكثر من 15 سنة",
    },
  },
} as const;

export const AXIS_TRANSLATIONS: Record<string, { fr: string; en: string }> = {
  axis2: {
    fr: "Axe 2: La réalité de la transition vers la finance islamique",
    en: "Axis 2: The reality of transition towards Islamic banking",
  },
  axis3: {
    fr: "Axe 3: Les défis législatifs et réglementaires",
    en: "Axis 3: Legislative and regulatory challenges",
  },
  axis4: {
    fr: "Axe 4: Les défis humains et techniques",
    en: "Axis 4: Human and technical challenges",
  },
  axis5: {
    fr: "Axe 5: Les défis financiers et de marché",
    en: "Axis 5: Financial and market challenges",
  },
  axis6: {
    fr: "Axe 6: Perspectives et avenir de la transition",
    en: "Axis 6: Prospects and future of transition",
  },
};

export const QUESTION_TRANSLATIONS: Record<number, { fr: string; en: string }> = {
  1: {
    fr: "Il y a un intérêt croissant pour la finance islamique au sein de la banque.",
    en: "There is a growing interest in Islamic banking within the bank.",
  },
  2: {
    fr: "La banque connaît une demande croissante des clients pour les produits bancaires islamiques.",
    en: "The bank is witnessing a growing demand from customers for Islamic banking products.",
  },
  3: {
    fr: "La direction de la banque a une vision claire de la transition vers la finance islamique.",
    en: "The bank's management has a clear vision towards transitioning to Islamic banking.",
  },
  4: {
    fr: "La banque dispose de connaissances de base sur les principes de la finance islamique.",
    en: "The bank has basic knowledge of Islamic banking principles.",
  },
  5: {
    fr: "La banque peut développer des produits bancaires islamiques à l'avenir.",
    en: "The bank can develop Islamic banking products in the future.",
  },
  6: {
    fr: "L'environnement économique en Mauritanie soutient l'expansion de la finance islamique.",
    en: "The economic environment in Mauritania supports the expansion of Islamic banking.",
  },
  7: {
    fr: "Il existe de réelles opportunités pour convertir les banques conventionnelles en banques islamiques en Mauritanie.",
    en: "There are real opportunities for transitioning conventional banks into Islamic banks in Mauritania.",
  },
  8: {
    fr: "Les clients en Mauritanie ont tendance à traiter avec des produits bancaires conformes à la charia.",
    en: "Customers in Mauritania tend to deal with Sharia-compliant banking products.",
  },
  9: {
    fr: "L'introduction de fenêtres islamiques au sein des banques conventionnelles peut être une étape appropriée pour une transition progressive.",
    en: "Introducing Islamic windows within conventional banks could be an appropriate step for gradual transition.",
  },
  10: {
    fr: "Il existe des indicateurs pratiques au sein du secteur bancaire mauritanien qui soutiennent la transition vers la finance islamique.",
    en: "There are practical indicators within the Mauritanian banking sector that support the transition towards Islamic banking.",
  },
  11: {
    fr: "La législation actuelle constitue un obstacle à la transition des banques conventionnelles vers les banques islamiques.",
    en: "Current legislation represents an obstacle to transitioning conventional banks into Islamic banks.",
  },
  12: {
    fr: "Il est nécessaire de développer les lois bancaires pour soutenir la finance islamique.",
    en: "There is a need to develop banking laws to support Islamic banking.",
  },
  13: {
    fr: "Les banques conventionnelles manquent de cadres réglementaires clairs pour la transition vers la finance islamique.",
    en: "Conventional banks lack clear regulatory frameworks for transitioning to Islamic banking.",
  },
  14: {
    fr: "L'absence ou la faiblesse d'une supervision de la charia spécialisée représente un défi pour la transition.",
    en: "The absence or weakness of specialized Sharia supervision represents a challenge for the transition.",
  },
  15: {
    fr: "Les autorités de régulation doivent renforcer leur rôle dans la réglementation et le soutien de la finance islamique.",
    en: "Regulatory authorities need to enhance their role in regulating and supporting Islamic banking.",
  },
  16: {
    fr: "Le manque de clarté du cadre juridique des produits islamiques peut limiter leur diffusion.",
    en: "The lack of clarity in the legal framework for Islamic products may limit their spread.",
  },
  17: {
    fr: "La transition nécessite une coordination claire entre la Banque Centrale, les banques commerciales et les comités de la charia.",
    en: "The transition requires clear coordination between the Central Bank, commercial banks, and Sharia boards.",
  },
  18: {
    fr: "Il y a un manque de compétences spécialisées en finance islamique au sein des banques conventionnelles.",
    en: "There is a shortage of specialized talent in Islamic banking within conventional banks.",
  },
  19: {
    fr: "Les employés des banques ont besoin de programmes de formation spécialisés en finance islamique.",
    en: "Bank employees need specialized training programs in Islamic finance.",
  },
  20: {
    fr: "Certains employés de banque manquent de connaissances suffisantes sur les outils de financement islamique.",
    en: "Some bank employees lack sufficient knowledge of Islamic finance instruments.",
  },
  21: {
    fr: "Les systèmes techniques actuels représentent un défi pour la mise en œuvre des produits bancaires islamiques.",
    en: "Current technical systems represent a challenge for implementing Islamic banking products.",
  },
  22: {
    fr: "La transition vers la finance islamique nécessite des investissements importants dans la formation et la qualification.",
    en: "Transitioning to Islamic banking requires significant investment in training and qualification.",
  },
  23: {
    fr: "Les banques ont besoin d'experts de la charia et de la finance pour accompagner le processus de transition.",
    en: "Banks need Sharia and financial experts to accompany the transition process.",
  },
  24: {
    fr: "La faiblesse de la culture bancaire islamique chez les employés peut affecter le succès de la transition.",
    en: "The weak Islamic banking culture among employees may affect the success of the transition.",
  },
  25: {
    fr: "Le coût de la transition vers la finance islamique est élevé.",
    en: "The cost of transitioning to Islamic banking is high.",
  },
  26: {
    fr: "La concurrence dans le secteur bancaire peut entraver la transition complète vers la finance islamique.",
    en: "Competition in the banking sector may hinder the complete transition towards Islamic banking.",
  },
  27: {
    fr: "Le manque de sensibilisation de certains clients à la finance islamique affecte le succès de la transition.",
    en: "Some customers' lack of awareness about Islamic banking affects the success of the transition.",
  },
  28: {
    fr: "La transition vers la finance islamique peut élargir la base de clients.",
    en: "Transitioning to Islamic banking can expand the customer base.",
  },
  29: {
    fr: "Les produits bancaires islamiques sont capables de rivaliser sur le marché mauritanien.",
    en: "Islamic banking products are capable of competing in the Mauritanian market.",
  },
  30: {
    fr: "La crainte d'une baisse de rentabilité peut limiter la volonté de certaines banques de faire la transition.",
    en: "Fear of lower profitability may limit the willingness of some banks to transition.",
  },
  31: {
    fr: "Le marché mauritanien a besoin de campagnes de sensibilisation aux avantages de la finance islamique.",
    en: "The Mauritanian market needs awareness campaigns on the advantages of Islamic banking.",
  },
  32: {
    fr: "La transition vers la finance islamique renforcera la confiance des clients dans la banque.",
    en: "Transitioning to Islamic banking will enhance customer trust in the bank.",
  },
  33: {
    fr: "La transition vers la finance islamique contribuera à améliorer l'image de la banque dans la société.",
    en: "Transitioning to Islamic banking will contribute to improving the bank's image in society.",
  },
  34: {
    fr: "La transition vers la finance islamique pourrait renforcer la compétitivité des banques conventionnelles.",
    en: "Transitioning to Islamic banking may enhance the competitiveness of conventional banks.",
  },
  35: {
    fr: "Je vois un avenir prometteur pour la finance islamique en Mauritanie.",
    en: "I see a promising future for Islamic banking in Mauritania.",
  },
  36: {
    fr: "Je recommande d'adopter une stratégie progressive de conversion des banques conventionnelles en banques islamiques.",
    en: "I recommend adopting a gradual strategy for transitioning conventional banks into Islamic banks.",
  },
  37: {
    fr: "L'établissement de fenêtres islamiques au sein des banques conventionnelles pourrait être une solution pratique avant une transition complète.",
    en: "Establishing Islamic windows within conventional banks could be a practical solution before a full transition.",
  },
  38: {
    fr: "Le succès de la transition nécessite une volonté managériale claire et un plan stratégique intégré.",
    en: "The success of the transition requires clear managerial will and an integrated strategic plan.",
  },
  39: {
    fr: "La finance islamique peut contribuer à l'inclusion financière en Mauritanie.",
    en: "Islamic banking can contribute to financial inclusion in Mauritania.",
  },
};
