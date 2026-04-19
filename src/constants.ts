import { Specialty, Paper, UserStats, LearningPath } from './types';
import { getImageUrl } from './utils/imageUtils';

export const CATEGORIES = [
  { id: 'meta-analysis', name: 'Journals', icon: 'BarChart' },
  { id: 'latest-news', name: 'Latest News', icon: 'Globe' },
  { id: 'trials', name: 'Clinical Trials', icon: 'Activity' },
  { id: 'guidelines', name: 'Guidelines', icon: 'ClipboardList' },
  { id: 'articles', name: 'Articles', icon: 'Files' },
  { id: 'books', name: 'Books & Manuals', icon: 'Book' },
];

export const LEARNING_PATHS: LearningPath[] = [];

export const SPECIALTIES: Specialty[] = [
  { id: 'cardiology', name: 'Cardiology', color: '#a855f7' }, // neon purple
  { id: 'neurology', name: 'Neurology', color: '#ff3131' }, // neon red
  { id: 'pediatrics', name: 'Pediatrics', color: '#39ff14' }, // neon green
  { id: 'oncology', name: 'Oncology', color: '#ffae00' }, // neon orange
  { id: 'dermatology', name: 'Dermatology', color: '#ff00ff' }, // neon pink
  { id: 'radiology', name: 'Radiology', color: '#00ffff' }, // neon cyan
];

export const USER_STATS: UserStats = {
  streak: 12,
  papersRead: 47,
  accuracy: 82,
  rank: 14,
  name: 'Anzar',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anzar',
};

export const COURSES: any[] = [];

export const AUDIOBOOKS: any[] = [];

const generateMockData = () => {
  const guidelinePapers: Paper[] = [
    {
      id: 'guideline-hypertension-2025',
      title: 'Prevention, Detection, Evaluation, and Management of High Blood Pressure in Adults',
      description: 'The comprehensive evidence-based clinical practice guideline for the prevention and management of hypertension.',
      date: '2017-11-13',
      specialtyId: 'cardiology',
      passedExam: false,
      authors: ['Whelton PK', 'Carey RM', 'et al.'],
      imageUrl: getImageUrl('Prevention, Detection, Evaluation, and Management of High Blood Pressure in Adults', 'guideline-hypertension-2025', 'cover'),
      generatedIllustrationUrl: getImageUrl('Prevention, Detection, Evaluation, and Management of High Blood Pressure in Adults', 'guideline-hypertension-2025', 'illustration'),
      readTime: '25 min',
      journal: 'J Am Coll Cardiol',
      contentType: 'guideline',
      clinicalWeight: 100,
      masteryLevel: 'unread',
      clinical_significance: 'Redefined hypertension thresholds (≥130/80 mmHg) and emphasized out-of-office BP measurement.',
      topicCluster: 'Hypertension',
      sourceUrl: 'https://www.guidelinecentral.com/guideline/6962/',
      organization: 'American Heart Association / American College of Cardiology',
      issuingSocieties: ['American Heart Association', 'American College of Cardiology', 'American Society of Hypertension'],
      recommendationGrade: 'A',
      summaryPoints: [
        'Normal BP: <120/80 mmHg; Elevated BP: 120-129/<80 mmHg.',
        'Hypertension Stage 1: 130-139/80-89 mmHg; Stage 2: ≥140/90 mmHg.',
        'BP goal for most adults with hypertension is <130/80 mmHg.',
        'Lifestyle modifications are recommended for all patients with elevated BP or hypertension.'
      ],
      lastUpdated: '2025-01-10',
      accessStatus: 'free',
      targetPopulation: 'Adults (18+ years) with or at risk for hypertension.',
      interventions: [
        'Weight loss (approx. 1 mmHg reduction per 1 kg lost)',
        'DASH dietary pattern',
        'Sodium reduction (<1500 mg/d preferred)',
        'Physical activity (Aerobic, Dynamic resistance, Isometric resistance)',
        'Pharmacological therapy (Chlorthalidone, ACEi/ARB, CCB)'
      ],
      contraindications: ['ACEi/ARB in pregnancy', 'Avoid ACEi and ARB combination therapy'],
      availableResources: ['pocket-guide', 'summary', 'patient-guide', 'quiz'],
      evidenceLevelDescription: 'Level A: High-quality evidence from more than 1 RCT.'
    },
    {
      id: 'guideline-hf-2024',
      title: '2024 AHA/ACC Guideline for the Management of Heart Failure',
      description: 'A comprehensive update on managing patients with heart failure, emphasizing SGLT2i and ARNI therapies.',
      date: '2024-03-15',
      specialtyId: 'cardiology',
      passedExam: true,
      authors: ['Heidenreich PA', 'Boehmer JP', 'et al.'],
      imageUrl: getImageUrl('2024 AHA/ACC Guideline for the Management of Heart Failure', 'guideline-hf-2024', 'cover'),
      generatedIllustrationUrl: getImageUrl('2024 AHA/ACC Guideline for the Management of Heart Failure', 'guideline-hf-2024', 'illustration'),
      readTime: '15 min',
      journal: 'Circulation',
      contentType: 'guideline',
      clinicalWeight: 98,
      masteryLevel: 'mastered',
      clinical_significance: 'Standardizes the use of SGLT2 inhibitors as first-line therapy across the spectrum of EF.',
      topicCluster: 'Heart Failure',
      sourceUrl: 'https://www.guidelinecentral.com/guidelines/management-of-heart-failure/',
      organization: 'American Heart Association',
      issuingSocieties: ['American Heart Association', 'American College of Cardiology', 'Heart Failure Society of America'],
      recommendationGrade: 'A',
      summaryPoints: [
        'Universal use of SGLT2i for HFrEF, HFmrEF, and HFpEF.',
        'ARNI is the preferred RAAS inhibitor for HFrEF.',
        'Structured management of secondary iron deficiency with IV iron.'
      ],
      lastUpdated: '2024-05-01',
      accessStatus: 'free',
      targetPopulation: 'Adults with chronic or acute heart failure.',
      interventions: ['SGLT2 inhibitors', 'ARNI/ACEi/ARB', 'Beta-blockers', 'MRA', 'Diuretics'],
      contraindications: ['Severe renal impairment (eGFR < 20 for some SGLT2i)', 'History of angioedema for ARNI'],
      availableResources: ['pocket-guide', 'summary', 'quiz', 'patient-guide'],
      evidenceLevelDescription: 'Level A: Rich data from multiple RCTs.'
    },
    {
      id: 'guideline-diabetes-2025',
      title: 'Standards of Care in Diabetes — 2025',
      description: 'The definitive clinical practice recommendations from the American Diabetes Association.',
      date: '2025-01-01',
      specialtyId: 'oncology',
      passedExam: false,
      authors: ['ElSayed NA', 'Aleppo G', 'et al.'],
      imageUrl: getImageUrl('Standards of Care in Diabetes — 2025', 'guideline-diabetes-2025', 'cover'),
      generatedIllustrationUrl: getImageUrl('Standards of Care in Diabetes — 2025', 'guideline-diabetes-2025', 'illustration'),
      readTime: '20 min',
      journal: 'Diabetes Care',
      contentType: 'guideline',
      clinicalWeight: 99,
      masteryLevel: 'unread',
      clinical_significance: 'Emphasizes weight management as a co-primary goal of type 2 diabetes treatment.',
      topicCluster: 'Diabetes',
      sourceUrl: 'https://www.guidelinecentral.com/guidelines/standards-of-medical-care-in-diabetes/',
      organization: 'American Diabetes Association',
      issuingSocieties: ['American Diabetes Association'],
      recommendationGrade: 'A',
      summaryPoints: [
        'Dual focus on glycemic control and cardiorenal risk reduction.',
        'Weight-loss-centric therapy (GLP-1 RA, GIP/GLP-1 RA) for Type 2 Diabetes.',
        'Continuous Glucose Monitoring (CGM) is now the standard for all insulin users.'
      ],
      lastUpdated: '2025-02-15',
      accessStatus: 'free',
      targetPopulation: 'Patients with Type 1 or Type 2 Diabetes.',
      interventions: ['Metformin', 'GLP-1 Receptor Agonists', 'Tirzepatide', 'SGLT2 inhibitors'],
      contraindications: ['Personal or family history of medullary thyroid carcinoma for GLP-1 RA'],
      availableResources: ['pocket-guide', 'patient-guide'],
      evidenceLevelDescription: 'Level A: Multiple clear RCTs or meta-analyses.'
    },
    {
      id: 'guideline-sepsis-2024',
      title: 'Surviving Sepsis Campaign: 2024 Guidelines',
      description: 'International guidelines for management of sepsis and septic shock.',
      date: '2024-06-10',
      specialtyId: 'neurology',
      passedExam: false,
      authors: ['Evans L', 'Rhodes A', 'et al.'],
      imageUrl: getImageUrl('Surviving Sepsis Campaign: 2024 Guidelines', 'guideline-sepsis-2024', 'cover'),
      generatedIllustrationUrl: getImageUrl('Surviving Sepsis Campaign: 2024 Guidelines', 'guideline-sepsis-2024', 'illustration'),
      readTime: '18 min',
      journal: 'Intensive Care Med',
      contentType: 'guideline',
      clinicalWeight: 96,
      masteryLevel: 'in-progress',
      clinical_significance: 'Critical timing of antibiotic administration and balanced crystalloid resuscitation.',
      topicCluster: 'Sepsis',
      sourceUrl: 'https://www.guidelinecentral.com/guidelines/surviving-sepsis-campaign-international-guidelines/',
      organization: 'Society of Critical Care Medicine',
      issuingSocieties: ['Society of Critical Care Medicine', 'European Society of Intensive Care Medicine'],
      recommendationGrade: 'B',
      summaryPoints: [
        'Antibiotics should be administered within 1 hour of recognition.',
        'Balanced crystalloids over saline for resuscitation.',
        'Capillary refill time as a guide for resuscitation.'
      ],
      lastUpdated: '2024-08-01',
      accessStatus: 'restricted',
      targetPopulation: 'Critically ill adults with suspected sepsis.',
      interventions: ['Fluid resuscitation', 'Norepinephrine', 'Broad-spectrum antibiotics'],
      contraindications: ['Over-resuscitation in heart failure/renal failure patients'],
      availableResources: ['summary', 'pocket-guide'],
      evidenceLevelDescription: 'Level B: Limited data from moderate-quality studies.'
    }
  ];

  const articles: Paper[] = [
    {
      id: 'art-1',
      title: 'Semaglutide in Patients with Heart Failure and Obesity',
      description: 'Investigating the efficacy of semaglutide in improving symptoms and physical limitations in obese patients with HFpEF.',
      date: '2023-08-25',
      specialtyId: 'cardiology',
      passedExam: false,
      authors: ['Kosiborod MN', 'Abildstrøm SZ', 'et al.'],
      imageUrl: getImageUrl('Semaglutide in Patients with Heart Failure and Obesity', 'art-1', 'cover'),
      generatedIllustrationUrl: getImageUrl('Semaglutide in Patients with Heart Failure and Obesity', 'art-1', 'illustration'),
      readTime: '12 min',
      journal: 'NEJM',
      contentType: 'article',
      clinicalWeight: 94,
      masteryLevel: 'unread',
      pmid: '37622681',
      pmcid: '10565861',
      doi: '10.1056/NEJMoa2306963',
      clinical_significance: 'Demonstrated significant reduction in HF symptoms and greater weight loss compared to placebo.',
    },
    {
      id: 'art-2',
      title: 'Thrombolysis with Alteplase 3 to 4.5 Hours after Acute Ischemic Stroke',
      description: 'The landmark ECASS III trial evaluating the safety and efficacy of extended window thrombolysis.',
      date: '2008-09-30',
      specialtyId: 'neurology',
      passedExam: false,
      authors: ['Hacke W', 'Kaste M', 'et al.'],
      imageUrl: getImageUrl('Thrombolysis with Alteplase 3 to 4.5 Hours after Acute Ischemic Stroke', 'art-2', 'cover'),
      generatedIllustrationUrl: getImageUrl('Thrombolysis with Alteplase 3 to 4.5 Hours after Acute Ischemic Stroke', 'art-2', 'illustration'),
      readTime: '10 min',
      journal: 'NEJM',
      contentType: 'article',
      clinicalWeight: 92,
      masteryLevel: 'mastered',
      pmid: '18824744',
      doi: '10.1056/NEJMoa0804656',
    }
  ];

  return { papers: [...guidelinePapers, ...articles], links: [] };
};

const { papers, links } = generateMockData();
export const MOCK_PAPERS = papers;
export const MOCK_LINKS = links as { source: string; target: string; type: any }[];
