
export interface UserProfile {
  education: string;
  skills: string;
  interests: string;
  experienceLevel: string;
  careerGoal: string;
  location: string;
}

export interface JobItem {
  title: string;
  company: string;
  location: string;
  link: string;
}

export interface CourseItem {
  title: string;
  platform: string;
  link: string;
}

export interface CertificationItem {
  name: string;
  provider: string; // e.g., Coursera, Google, AWS
  duration: string;
  difficulty: string;
  link: string;
}

export interface VideoItem {
  title: string;
  channel: string;
  url: string;
}

export interface CareerRecommendation {
  name: string;
  fitScore: number;
  reason: string;
  salaryRange: string;
  demandLevel: 'Low' | 'Medium' | 'High';
  realWorldJobs: JobItem[];
  topCourses: CourseItem[];
}

export interface SkillDemandItem {
  skill: string;
  demand: 'High' | 'Medium' | 'Low';
  reason: string;
}

export interface SkillGap {
  existingSkills: string[];
  missingSkills: { name: string; priority: 'High' | 'Medium' | 'Low' }[];
}

export interface RoadmapMonth {
  month: number;
  topics: string[];
  miniProject: string;
  recommendedVideos: VideoItem[];
}

export interface SalaryGrowth {
  year1: string;
  year3: string;
  year5: string;
  futureRoles: string[];
  stabilityLevel: string;
  growthPercentage: string;
}

export interface SimulationStep {
  year: number;
  progress: string;
  skillGrowth: string;
}

export interface Simulation {
  timeline: SimulationStep[];
  advantages: string[];
  risks: string[];
}

export interface FullCareerAnalysis {
  skillGap: SkillGap;
  skillDemand: SkillDemandItem[];
  roadmap: RoadmapMonth[];
  growth: SalaryGrowth;
  simulation: Simulation;
  certifications: CertificationItem[];
  masterclasses: VideoItem[];
}

export interface ResumeAnalysis {
  extractedSkills: string[];
  missingKeywords: string[];
  score: number;
  suggestions: string[];
}

export interface ResumeOptimization {
  optimizedText: string;
  keywordBoost: string[];
  formattingTips: string[];
  atsStrategy: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface AptitudeQuestion {
  id: number;
  type: 'technical_mcq' | 'logical_mcq' | 'coding_challenge' | 'situational';
  question: string;
  options?: string[]; // Only for MCQ types
  correctAnswer?: string; // Reference for evaluation
  explanation: string;
}

export interface AssessmentResult {
  score: number;
  weakAreas: string[];
  studySuggestions: { topic: string; resource: string }[];
  summary: string;
  technicalFeedback: string;
}
