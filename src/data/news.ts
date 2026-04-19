import { getImageUrl } from '../utils/imageUtils';

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  publishDate: string;
  specialty: string;
  url: string;
  imageUrl: string;
  source: string;
  tags: string[];
}

export const HEALIO_NEWS: NewsItem[] = [
  {
    id: 'healio-1',
    title: 'FDA Approves Novel GLP-1/GIP Agonist for Cardiovascular Risk Reduction',
    summary: 'The FDA has expanded the indication for the dual agonist, showing a 20% reduction in major adverse cardiovascular events in patients with obesity and established CVD.',
    publishDate: '2 hours ago',
    specialty: 'Cardiology',
    url: 'https://www.healio.com/news/cardiology',
    imageUrl: 'https://www.healio.com/~/media/slack-news/fm_im/misc/infographics/2024/01-january/semaglutide_stock_1200x630.jpg?w=1200',
    source: 'Healio Cardiology',
    tags: ['FDA Approval', 'Therapeutics']
  },
  {
    id: 'healio-2',
    title: 'New Diagnostic Criteria Proposed for Early-Stage Alzheimer\'s Disease',
    summary: 'A global task force has introduced revised criteria utilizing blood-based biomarkers to identify Alzheimer\'s pathology years before clinical symptoms appear.',
    publishDate: '5 hours ago',
    specialty: 'Neurology',
    url: 'https://www.healio.com/news/neurology',
    imageUrl: 'https://www.healio.com/~/media/slack-news/stock-images/fm_im/d/depression_adobestock_60945003.jpg?w=1200',
    source: 'Healio Neurology',
    tags: ['Guidelines', 'Diagnostics']
  },
  {
    id: 'healio-3',
    title: 'Phase 3 Trial: Immunotherapy Combo Extends Survival in Advanced NSCLC',
    summary: 'Patients with advanced non-small cell lung cancer experienced unprecedented overall survival rates when treated with a novel dual-checkpoint inhibitor regimen.',
    publishDate: '8 hours ago',
    specialty: 'Oncology',
    url: 'https://www.healio.com/news/hematology-oncology',
    imageUrl: 'https://www.healio.com/~/media/slack-news/hemonc/misc/infographics/hot-infographics/2026/04_april/hot0226batten_graphic_01.jpg?w=1200',
    source: 'Healio Hematology/Oncology',
    tags: ['Clinical Trials', 'Lung Cancer']
  },
  {
    id: 'healio-4',
    title: 'CDC Updates Guidance on Co-administration of Respiratory Vaccines',
    summary: 'The Centers for Disease Control and Prevention confirmed that seasonal flu, updated COVID-19, and RSV vaccines can be safely administered at the same visit.',
    publishDate: '12 hours ago',
    specialty: 'Infectious Disease',
    url: 'https://www.healio.com/news/infectious-disease',
    imageUrl: 'https://www.healio.com/~/media/slack-news/stock-images/infectious-disease/c/cdcstockimage3.jpg?w=1200',
    source: 'Healio Infectious Disease',
    tags: ['Public Health', 'Vaccines']
  },
  {
    id: 'healio-5',
    title: 'Continuous Glucose Monitoring Linked to Reduced HbA1c in Type 2 Diabetes',
    summary: 'A real-world retrospective analysis found that CGM initiation independently predicts clinically meaningful glycemic improvements in non-insulin dependent T2D.',
    publishDate: '1 day ago',
    specialty: 'Endocrinology',
    url: 'https://www.healio.com/news/endocrinology',
    imageUrl: 'https://www.healio.com/~/media/slack-news/cardiology/misc/infographics/2026/04_april/ct0426marston_essence-timi-73b_acc_ig1.jpg?w=1200',
    source: 'Healio Endocrinology',
    tags: ['Diabetes', 'Devices']
  },
  {
    id: 'healio-6',
    title: 'Pediatric Asthma Exacerbations Plunge Following Targeted Air Quality Interventions',
    summary: 'A structural intervention in urban public housing complexes resulted in a 45% decrease in pediatric emergency department visits for asthma.',
    publishDate: '1 day ago',
    specialty: 'Pediatrics',
    url: 'https://www.healio.com/news/pediatrics',
    imageUrl: 'https://www.healio.com/~/media/slack-news/rheumatology/misc/infographics/2026/rh0426walensky_graphic_01.jpg?w=1200',
    source: 'Healio Pediatrics',
    tags: ['Asthma', 'Environment']
  },
  {
    id: 'healio-7',
    title: 'Artificial Intelligence Accurately Triage ER Patients with Chest Pain',
    summary: 'A novel machine learning algorithm analyzed ECGs and biomarkers to safely direct low-risk chest pain patients to faster discharge pathways, reducing ER wait times.',
    publishDate: '2 days ago',
    specialty: 'Emergency Medicine',
    url: 'https://www.healio.com/news/cardiology',
    imageUrl: 'https://www.healio.com/~/media/slack-news/stock-images/cardiology/h/heart-beat.jpg?w=1200',
    source: 'Healio AI in Medicine',
    tags: ['AI/Tech', 'Emergency Care']
  },
  {
    id: 'healio-8',
    title: 'Surge in Syphilis Cases Prompts Immediate Public Health Action',
    summary: 'With congenital syphilis rates reaching multi-decade highs, experts are calling for mandatory third-trimester screening protocols across all 50 states.',
    publishDate: '2 days ago',
    specialty: 'Infectious Disease',
    url: 'https://www.healio.com/news/infectious-disease',
    imageUrl: 'https://www.healio.com/~/media/slack-news/stock-images/cardiology/h/3d-heart-valves_175470830.jpeg?w=1200',
    source: 'Healio Infectious Disease',
    tags: ['STI', 'Policy']
  }
];
