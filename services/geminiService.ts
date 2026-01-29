
import { GoogleGenAI, Type } from "@google/genai";
import { 
  UserProfile, 
  CareerRecommendation, 
  FullCareerAnalysis,
  ResumeAnalysis,
  ResumeOptimization,
  AptitudeQuestion,
  AssessmentResult
} from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL = 'gemini-3-flash-preview';

export const geminiService = {
  async generateAptitudeTest(profile: UserProfile): Promise<AptitudeQuestion[]> {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: `Generate a comprehensive 5-question assessment for a "${profile.careerGoal}" candidate aiming for 2026 market standards.
      Profile Skills: ${profile.skills}.
      Requirements:
      - 2 technical multiple-choice questions (MCQ).
      - 1 logical reasoning MCQ.
      - 1 coding challenge (request a short code snippet or algorithm).
      - 1 situational/architectural open-ended question.
      Return JSON only.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.NUMBER },
              type: { type: Type.STRING, enum: ["technical_mcq", "logical_mcq", "coding_challenge", "situational"] },
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING }, nullable: true },
              correctAnswer: { type: Type.STRING, nullable: true },
              explanation: { type: Type.STRING }
            },
            required: ["id", "type", "question", "explanation"]
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  },

  async evaluateAssessment(profile: UserProfile, questions: AptitudeQuestion[], answers: Record<number, string>): Promise<AssessmentResult> {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: `Evaluate the user's assessment performance for a ${profile.careerGoal} career path in the 2026 landscape.
      Questions: ${JSON.stringify(questions)}
      User Answers: ${JSON.stringify(answers)}
      Provide a neural score, specific feedback on the coding challenge (if provided), identified weak areas, and 2026-ready study resources.
      Return JSON only.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            weakAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
            technicalFeedback: { type: Type.STRING },
            studySuggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  topic: { type: Type.STRING },
                  resource: { type: Type.STRING }
                }
              }
            },
            summary: { type: Type.STRING }
          },
          required: ["score", "weakAreas", "technicalFeedback", "studySuggestions", "summary"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  },

  async getRecommendations(profile: UserProfile): Promise<CareerRecommendation[]> {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: `Identify 3 high-ROI career paths for a user with: ${JSON.stringify(profile)}.
      Use Google Search to find current 2026 market salaries and real job openings.
      For each path, recommend 3 real Coursera or professional certification courses.
      Return JSON only.`,
      config: {
        thinkingConfig: { thinkingBudget: 0 },
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              fitScore: { type: Type.NUMBER },
              reason: { type: Type.STRING },
              salaryRange: { type: Type.STRING },
              demandLevel: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
              realWorldJobs: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    company: { type: Type.STRING },
                    location: { type: Type.STRING },
                    link: { type: Type.STRING }
                  }
                }
              },
              topCourses: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    platform: { type: Type.STRING },
                    link: { type: Type.STRING }
                  }
                }
              }
            },
            required: ["name", "fitScore", "reason", "salaryRange", "demandLevel", "realWorldJobs", "topCourses"]
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  },

  async getFullAnalysis(career: string, profile: UserProfile): Promise<FullCareerAnalysis> {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: `Perform a master-level analysis for the career "${career}". 
      Context: ${profile.education}, Location: ${profile.location}.
      Specifically:
      1. Find the top 4 Professional Certifications on Coursera, edX, or Google.
      2. Provide detailed 5-year salary predictions with growth percentages starting from 2026.
      3. Create a month-by-month learning roadmap.
      4. Find 4 specific, full-length YouTube Masterclasses or Complete Playlists for this career.
      Return JSON only.`,
      config: {
        thinkingConfig: { thinkingBudget: 0 },
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            skillGap: {
              type: Type.OBJECT,
              properties: {
                existingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                missingSkills: { 
                  type: Type.ARRAY, 
                  items: { 
                    type: Type.OBJECT, 
                    properties: { name: { type: Type.STRING }, priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] } } 
                  } 
                }
              },
              required: ["existingSkills", "missingSkills"]
            },
            skillDemand: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  skill: { type: Type.STRING },
                  demand: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                  reason: { type: Type.STRING }
                },
                required: ["skill", "demand", "reason"]
              }
            },
            roadmap: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  month: { type: Type.NUMBER },
                  topics: { type: Type.ARRAY, items: { type: Type.STRING } },
                  miniProject: { type: Type.STRING },
                  recommendedVideos: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        channel: { type: Type.STRING },
                        url: { type: Type.STRING }
                      },
                      required: ["title", "channel", "url"]
                    }
                  }
                },
                required: ["month", "topics", "miniProject", "recommendedVideos"]
              }
            },
            growth: {
              type: Type.OBJECT,
              properties: {
                year1: { type: Type.STRING },
                year3: { type: Type.STRING },
                year5: { type: Type.STRING },
                growthPercentage: { type: Type.STRING },
                futureRoles: { type: Type.ARRAY, items: { type: Type.STRING } },
                stabilityLevel: { type: Type.STRING }
              },
              required: ["year1", "year3", "year5", "growthPercentage", "futureRoles", "stabilityLevel"]
            },
            certifications: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  provider: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  link: { type: Type.STRING }
                },
                required: ["name", "provider", "duration", "difficulty", "link"]
              }
            },
            masterclasses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  channel: { type: Type.STRING },
                  url: { type: Type.STRING }
                },
                required: ["title", "channel", "url"]
              }
            },
            simulation: {
              type: Type.OBJECT,
              properties: {
                timeline: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      year: { type: Type.NUMBER },
                      progress: { type: Type.STRING },
                      skillGrowth: { type: Type.STRING }
                    }
                  }
                },
                advantages: { type: Type.ARRAY, items: { type: Type.STRING } },
                risks: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["timeline", "advantages", "risks"]
            }
          },
          required: ["skillGap", "skillDemand", "roadmap", "growth", "simulation", "certifications", "masterclasses"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  },

  async analyzeResume(text: string): Promise<ResumeAnalysis> {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: `Score resume (0-100) and extract skills for the 2026 market. Resume: ${text}`,
      config: {
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            extractedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            score: { type: Type.NUMBER },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  },

  async optimizeResume(text: string, career: string): Promise<ResumeOptimization> {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: `Optimize resume for "${career}" aiming for 2026 roles. Resume: ${text}`,
      config: {
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            optimizedText: { type: Type.STRING },
            keywordBoost: { type: Type.ARRAY, items: { type: Type.STRING } },
            formattingTips: { type: Type.ARRAY, items: { type: Type.STRING } },
            atsStrategy: { type: Type.STRING }
          },
          required: ["optimizedText", "keywordBoost", "formattingTips", "atsStrategy"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  },

  async chat(message: string, context?: string): Promise<string> {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: `Answer: ${message}. Context: ${context}. Speed is key. Focus on professional certification advice for 2026 if relevant.`,
      config: { 
        thinkingConfig: { thinkingBudget: 0 },
        tools: [{ googleSearch: {} }] 
      }
    });
    return response.text || "Connection error.";
  }
};
