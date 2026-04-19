export interface Specialty {
  id: string;
  name: string;
  color: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export type PaperContentType = 'article' | 'review' | 'guideline' | 'audiobook';
export type MasteryLevel = 'unread' | 'completed' | 'mastered' | 'in-progress';
export type AccessStatus = 'free' | 'restricted' | 'premium';
export type GuidelineResourceType = 'pocket-guide' | 'summary' | 'patient-guide' | 'quiz';

export interface Paper {
  id: string;
  pmid?: string;
  pmcid?: string;
  doi?: string;
  title: string;
  description: string;
  fullContent?: string;
  specialtyId: string;
  passedExam: boolean;
  isRecommended?: boolean;
  date: string;
  authors: string[];
  imageUrl: string;
  readTime: string;
  journal: string;
  contentType: PaperContentType;
  clinicalWeight: number;
  masteryLevel: MasteryLevel;
  clinical_significance?: string;
  topicCluster?: string;
  generatedIllustrationUrl?: string;
  quiz?: QuizQuestion[];
  bookCover?: {
    title?: string;
    subtitle?: string;
    edition?: number;
    keyPoints?: string[];
    extraInfo?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
  // Guideline specific fields
  sourceUrl?: string;
  summaryPoints?: string[];
  recommendationGrade?: 'A' | 'B' | 'C' | 'D' | 'I';
  organization?: string;
  issuingSocieties?: string[];
  lastUpdated?: string;
  isUpdateAvailable?: boolean;
  
  // Guideline Central specific UI fields
  accessStatus?: AccessStatus;
  targetPopulation?: string;
  interventions?: string[];
  contraindications?: string[];
  availableResources?: GuidelineResourceType[];
  evidenceLevelDescription?: string;
}

export interface Folder {
  id: string;
  name: string;
  paperIds: string[];
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  specialty: string;
  subTopics: string[];
  goal: string;
  experience: string;
  country: string;
  onboardingCompleted: boolean;
  readPaperIds?: string[];
  savedPaperIds?: string[];
  folders?: Folder[];
  notificationSettings?: {
    guidelineUpdates: boolean;
    newResearch: boolean;
    streakReminders: boolean;
  };
  impactScore?: number;
  commentCount?: number;
  shareCount?: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  paperId: string;
  userId: string;
  userName: string;
  userSpecialty: string;
  content: string;
  createdAt: string;
  likes: number;
}

export interface UserStats {
  streak: number;
  papersRead: number;
  accuracy: number;
  rank: number;
  name: string;
  avatarUrl: string;
}

export interface Course {
  id: string;
  title: string;
  specialtyId: string;
  progress: number;
  modules: number;
  imageUrl: string;
}

export interface Audiobook {
  id: string;
  title: string;
  paperId: string;
  duration: string;
  imageUrl: string;
  artist: string;
}

export interface Lesson {
  id: string;
  paperId: string;
  isLocked: boolean;
  isCompleted: boolean;
}

export interface LearningPath {
  id: string;
  title: string;
  subtitle: string;
  lessons: Lesson[];
}

export interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  paper: Paper;
  x?: number;
  y?: number;
}

export type GraphLinkType = 'prerequisite' | 'shared-population' | 'suggested' | 'bridge';

export interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  type: GraphLinkType;
}
