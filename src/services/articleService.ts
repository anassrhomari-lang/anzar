import { GoogleGenAI, Type } from "@google/genai";
import { Course, LearningPath, Paper } from "../types";

export interface LiveArticle {
  id: string;
  pmid: string;
  pmcid?: string;
  doi: string;
  title: string;
  abstract: string;
  journal: string;
  authors: string[];
  publicationDate: string;
  clinical_significance?: string;
  key_takeaways?: string[];
  impact_score?: number;
  abstract_summary?: string;
  future_research?: string;
  ai_confidence_score?: number;
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Helper for exponential backoff
async function withRetry<T>(fn: () => Promise<T>, retries = 7, delay = 3000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errorStr = JSON.stringify(error);
    const isRateLimit = error.status === 429 || 
                        error.message?.includes('429') || 
                        error.message?.includes('RESOURCE_EXHAUSTED') ||
                        errorStr.includes('429') ||
                        errorStr.includes('RESOURCE_EXHAUSTED');

    if (retries > 0 && isRateLimit) {
      console.warn(`Gemini Rate Limit hit. Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

// Deterministic hash function for visual consistency
function getDeterministicSeed(text: string): number {
  let hash = 0;
  // Normalize text: lowercase, remove special chars, sort words
  const normalized = text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(' ')
    .filter(w => w.length > 3)
    .sort()
    .join('_');
    
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

async function structureArticleWithAI(article: LiveArticle): Promise<LiveArticle> {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY missing, returning raw data");
    return { ...article, ai_confidence_score: 0 };
  }

  const prompt = `
    You are a medical AI expert. Structure the following PubMed article into a high-impact clinical summary for busy doctors.
    
    Title: ${article.title}
    Abstract: ${article.abstract}
    
    Return a JSON object with these fields:
    - clinical_significance: A 1-2 sentence summary of why this matters to a clinician.
    - key_takeaways: An array of 3-4 bullet points.
    - impact_score: A number from 0-100 representing clinical importance.
    - abstract_summary: A concise 3-sentence summary of the abstract.
    - future_research: What still needs to be studied.
    - ai_confidence_score: Your confidence in this extraction (0-1).
  `;

  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            clinical_significance: { type: Type.STRING },
            key_takeaways: { type: Type.ARRAY, items: { type: Type.STRING } },
            impact_score: { type: Type.NUMBER },
            abstract_summary: { type: Type.STRING },
            future_research: { type: Type.STRING },
            ai_confidence_score: { type: Type.NUMBER },
          },
          required: ["clinical_significance", "key_takeaways", "impact_score", "abstract_summary", "future_research", "ai_confidence_score"],
        },
      },
    }));

    // Generate dynamic illustration
    let generatedIllustrationUrl = "";
    try {
      const seed = getDeterministicSeed(article.title);
      const imageResponse = await withRetry(() => ai.models.generateContent({
        model: "gemini-3.1-flash-image-preview",
        contents: {
          parts: [{ text: `A professional medical vectorial illustration, clean academic style, scientific precision, representing the theme: ${article.title}. Minimalist, professional medical journal aesthetic, high contrast, no text.` }]
        },
        config: {
          seed,
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: "1K"
          }
        }
      }));

      const imagePart = imageResponse.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (imagePart?.inlineData) {
        generatedIllustrationUrl = `data:image/png;base64,${imagePart.inlineData.data}`;
      }
    } catch (imgErr) {
      console.error("Image Generation Error:", imgErr);
    }

    const structured = JSON.parse(response.text);
    const fullArticle = { ...article, ...structured, generatedIllustrationUrl };
    
    // Update server cache
    fetch('/api/articles/cache', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullArticle),
    }).catch(err => console.error('Cache update failed:', err));

    return fullArticle;
  } catch (error) {
    console.error("AI Structuring Error:", error);
    return { ...article, ai_confidence_score: 0 };
  }
}

export const articleService = {
  async getLiveFeed(specialty: string = 'cardiology', limit: number = 10): Promise<LiveArticle[]> {
    try {
      const response = await fetch(`/api/articles/feed?specialty=${specialty}&limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch articles');
      const articles: LiveArticle[] = await response.json();
      
      // Return articles immediately to avoid blocking the UI
      // AI structuring will happen on-demand or in the background if needed
      return articles;
    } catch (error) {
      console.error('Error fetching live feed:', error);
      return [];
    }
  },

  async getFullText(pmcid: string): Promise<any> {
    try {
      const response = await fetch(`/api/articles/fulltext/${pmcid}`);
      if (!response.ok) throw new Error('Failed to fetch full text');
      return await response.json();
    } catch (error) {
      console.error('Error fetching full text:', error);
      return null;
    }
  },

  async getPdfData(pmcid: string): Promise<{ base64: string, mimeType: string } | null> {
    try {
      const response = await fetch(`/api/articles/pdf-proxy/${pmcid}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`[Reader] PDF Proxy failed (${response.status}):`, errorData);
        throw new Error(errorData.error || 'Failed to fetch PDF proxy');
      }
      return await response.json();
    } catch (error: any) {
      console.error(`[Reader] Error fetching PDF data for PMC${pmcid}:`, error.message);
      return null;
    }
  },

  async extractTextFromPdf(pdfBase64: string): Promise<{ title: string, content: string }[]> {
    if (!pdfBase64 || pdfBase64.length < 1000) {
      console.warn(`[Reader] PDF data too small (${pdfBase64?.length || 0} chars), skipping AI extraction.`);
      return [];
    }
    
    try {
      console.log(`[Reader] Sending PDF to AI for digitized extraction (${pdfBase64.length} chars)...`);
      const prompt = `
        You are an expert e-book digitizer for medical journals. 
        Analyze the provided PDF of a clinical study and extract its full text into a structured JSON format.
        
        Rules:
        1. Break the content into logical sections (e.g., Introduction, Methods, Results, Discussion, Conclusion).
        2. Preserve the scientific tone.
        3. Do not include references or bibliography lists.
        4. Focus on the core manuscript text.
        5. If the PDF is mostly images or contains tables, try to describe the key findings in text format.
        
        Return a JSON object with an array of objects:
        {
          "sections": [
            { "title": "Introduction", "content": "..." },
            ...
          ]
        }
      `;

      const response = await withRetry(() => ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [
          { text: prompt },
          { inlineData: { data: pdfBase64, mimeType: "application/pdf" } }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    content: { type: Type.STRING },
                  },
                  required: ["title", "content"],
                }
              }
            },
            required: ["sections"],
          }
        }
      }));

      const data = JSON.parse(response.text);
      return data.sections;
    } catch (error) {
      console.error('Error extracting text from PDF with AI:', error);
      return [];
    }
  },

  async generateFeaturedCourses(specialties: string[] = ['cardiology', 'neurology', 'oncology']): Promise<Course[]> {
    const CACHE_KEY = 'featured_courses_cache';
    try {
      // Check local cache first
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        // Cache for 24 hours
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          return data;
        }
      }

      const courses: Course[] = [];
      for (const specialty of specialties) {
        try {
          const response = await fetch(`/api/courses/generate?specialty=${specialty}`);
          if (!response.ok) continue;
          const articles: LiveArticle[] = await response.json();
          if (articles.length === 0) continue;

          const prompt = `
            You are a medical education expert. Create a "Featured Course" title and summary based on these recent PubMed articles for the specialty: ${specialty}.
            
            Articles:
            ${articles.map(a => `- ${a.title}`).join('\n')}
            
            Return a JSON object with:
            - title: A compelling course title (e.g., "Advanced Heart Failure: 2024 Guidelines").
            - modules: Estimated number of modules (between 5 and 15).
            - progress: Set to 0.
          `;

          const aiResponse = await withRetry(() => ai.models.generateContent({
            model: "gemini-3.1-pro-preview",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  modules: { type: Type.NUMBER },
                },
                required: ["title", "modules"],
              },
            },
          }));

          const data = JSON.parse(aiResponse.text);
          courses.push({
            id: `course-${specialty}`,
            title: data.title,
            specialtyId: specialty,
            progress: 0,
            modules: data.modules,
            imageUrl: `https://picsum.photos/seed/${specialty}_course/800/600`,
          } as Course);
          
          // Increased delay between specialties to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 3000));
        } catch (innerError) {
          console.warn(`Failed to generate course for ${specialty}, using fallback`, innerError);
          // Fallback for this specific specialty
          courses.push({
            id: `course-${specialty}`,
            title: `${specialty.charAt(0).toUpperCase() + specialty.slice(1)} Clinical Essentials`,
            specialtyId: specialty,
            progress: 0,
            modules: 8,
            imageUrl: `https://picsum.photos/seed/${specialty}_course/800/600`,
          } as Course);
        }
      }

      if (courses.length > 0) {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data: courses, timestamp: Date.now() }));
      }

      return courses;
    } catch (error) {
      console.error('Error generating featured courses:', error);
      // Final fallback if everything fails
      return specialties.map(s => ({
        id: `course-${s}`,
        title: `${s.charAt(0).toUpperCase() + s.slice(1)} Mastery`,
        specialtyId: s,
        progress: 0,
        modules: 10,
        imageUrl: `https://picsum.photos/seed/${s}_course/800/600`,
      } as Course));
    }
  },

  async generateLearningPaths(specialties: string[] = ['cardiology', 'neurology']): Promise<LearningPath[]> {
    const CACHE_KEY = 'learning_paths_cache';
    try {
      // Check local cache first
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        // Cache for 24 hours
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          return data;
        }
      }

      const paths: LearningPath[] = [];
      for (const specialty of specialties) {
        try {
          const response = await fetch(`/api/courses/generate?specialty=${specialty}`);
          if (!response.ok) continue;
          const articles: LiveArticle[] = await response.json();
          if (articles.length === 0) continue;

          const prompt = `
            You are a medical education expert. Create a "Learning Path" title and subtitle based on these recent PubMed articles for the specialty: ${specialty}.
            
            Articles:
            ${articles.map(a => `- ${a.title}`).join('\n')}
            
            Return a JSON object with:
            - title: A professional learning path title (e.g., "Foundations of Modern Cardiology").
            - subtitle: A brief description of what will be learned.
          `;

          const aiResponse = await withRetry(() => ai.models.generateContent({
            model: "gemini-3.1-pro-preview",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  subtitle: { type: Type.STRING },
                },
                required: ["title", "subtitle"],
              },
            },
          }));

          const data = JSON.parse(aiResponse.text);
          paths.push({
            id: `path-${specialty}`,
            title: data.title,
            subtitle: data.subtitle,
            lessons: articles.map((a, i) => ({
              id: `lesson-${a.pmid}`,
              paperId: a.pmid,
              isLocked: i > 0,
              isCompleted: false,
            })),
          } as LearningPath);

          // Increased delay between specialties to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 3000));
        } catch (innerError) {
          console.warn(`Failed to generate path for ${specialty}, using fallback`, innerError);
          // Fallback for this specific specialty
          paths.push({
            id: `path-${specialty}`,
            title: `${specialty.charAt(0).toUpperCase() + specialty.slice(1)} Curriculum`,
            subtitle: `Comprehensive guide to the latest developments in ${specialty}.`,
            lessons: [],
          } as LearningPath);
        }
      }

      if (paths.length > 0) {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data: paths, timestamp: Date.now() }));
      }

      return paths;
    } catch (error) {
      console.error('Error generating learning paths:', error);
      // Final fallback
      return specialties.map(s => ({
        id: `path-${s}`,
        title: `${s.charAt(0).toUpperCase() + s.slice(1)} Core`,
        subtitle: `Master the essentials of ${s}.`,
        lessons: [],
      } as LearningPath));
    }
  },

  async searchArticle(query: string): Promise<LiveArticle | null> {
    try {
      const response = await fetch(`/api/articles/search?q=${encodeURIComponent(query)}&limit=1`);
      if (!response.ok) return null;
      const results: LiveArticle[] = await response.json();
      return results.length > 0 ? results[0] : null;
    } catch (e) {
      console.error('Search error:', e);
      return null;
    }
  },

  async generateRelatedPath(paper: Paper): Promise<LearningPath | null> {
    if (!process.env.GEMINI_API_KEY) return null;

    try {
      const prompt = `
        You are a medical education AI. A doctor is currently reading this article:
        Title: ${paper.title}
        Journal: ${paper.journal}
        Description: ${paper.description}
        
        Create a 4-step "Clinical Mastery Path" related to this specific topic. 
        The path should follow this medical logic:
        1. Context/Review: A foundational review or pathophysiology.
        2. Evidence: A recent landmark trial or meta-analysis.
        3. Guidelines: Current international clinical guidelines.
        4. Application: Practical implementation or case study.

        For each step, generate a realistic search query that would find a REAL article on PubMed.
        
        Return a JSON object:
        {
          "title": "Mastery Path: [Specific Topic]",
          "subtitle": "A structured journey from evidence to clinical application.",
          "steps": [
            { "title": "Human Readable Title", "description": "Goal", "type": "article|review|guideline|meta-analysis", "searchQuery": "Term1 AND Term2..." }
          ]
        }
      `;

      const aiResponse = await withRetry(() => ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              subtitle: { type: Type.STRING },
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    type: { type: Type.STRING },
                    searchQuery: { type: Type.STRING }
                  },
                  required: ["title", "description", "type", "searchQuery"]
                }
              }
            },
            required: ["title", "subtitle", "steps"]
          }
        }
      }));

      const data = JSON.parse(aiResponse.text);
      
      // Search for real articles for each step
      const stepResults = await Promise.all(
        data.steps.map(async (step: any) => {
          const article = await this.searchArticle(step.searchQuery);
          return { step, article };
        })
      );

      return {
        id: `rel-path-${paper.id}`,
        title: data.title,
        subtitle: data.subtitle,
        lessons: stepResults.map(({ step, article }, i) => ({
          id: `step-${i}-${paper.id}`,
          paperId: article?.pmid || paper.id,
          isLocked: i > 0,
          isCompleted: false,
          title: article?.title || step.title,
          description: step.description,
          contentType: step.type,
          // Attach the real article if found, to be added to the global pool later
          article: article
        })),
      } as any;
    } catch (error) {
      console.error('Error generating related path:', error);
      return null;
    }
  }
};
