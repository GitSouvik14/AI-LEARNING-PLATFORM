import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Shared server-side Gemini client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Health / Connectivity Check Endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    aiAvailable: !!ai,
    mode: isProd ? 'production' : 'development',
  });
});

// Endpoint: AI Content Simplification & Easy-Read ("Explain Like I'm 5" / Accessibility)
app.post('/api/gemini/explain', async (req: Request, res: Response) => {
  const { topic, text, level = 'simple', format = 'analogy' } = req.body;

  const fallback = {
    simplifiedText: `Here is a clear, sensory-friendly breakdown of "${topic || 'this concept'}": Think of it like a smart assistant that learns from thousands of examples. Just like how humans recognize cats by seeing many photos, the model finds patterns automatically rather than being handed rigid hand-coded rules.`,
    keyTakeaways: [
      'Discovers patterns directly from real-world examples',
      'Calculates error and tweaks internal dials (weights) to improve',
      'Makes reliable predictions on brand new, unseen data',
    ],
    analogy: 'Like learning to ride a bicycle through balance and practice, rather than reading a 100-page manual.',
    retentionHook: 'Examples In -> Patterns Found -> Accurate Predictions Out!',
    isFallback: true,
  };

  try {
    if (!topic && !text) {
      return res.status(400).json({ error: 'Missing topic or text to explain' });
    }

    if (!ai) {
      return res.json(fallback);
    }

    const systemPrompt = `You are OmniLearn's Assistive Learning AI, specialized in accessible education for neurodivergent learners, students with dyslexia, and remote students. 
Explain the concept using crystal-clear, sensory-friendly, accessible language. 
Use short paragraphs, concrete everyday analogies, and clear bullet points. Avoid overwhelming technical math unless requested.`;

    const userPrompt = `Concept to explain: ${topic || ''}
Content context: ${text || ''}
Target clarity level: ${level} (Accessible / Simple / Analogy-driven)
Preferred format: ${format}

Provide a structured response:
1. "simplifiedText": A warm, encouraging 2-3 sentence overview that anyone can understand.
2. "keyTakeaways": 3 concise bullet points.
3. "analogy": A memorable everyday analogy (e.g., cooking, farming, music, sports).
4. "retentionHook": A short mnemonic or memory trick.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            simplifiedText: { type: Type.STRING },
            keyTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            analogy: { type: Type.STRING },
            retentionHook: { type: Type.STRING },
          },
          required: ['simplifiedText', 'keyTakeaways', 'analogy'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ ...parsed, isFallback: false });
  } catch (error: any) {
    console.warn('Fallback triggered in /api/gemini/explain:', error.message);
    return res.json(fallback);
  }
});

// Endpoint: AI-driven Personalized Feedback System for Better Retention
app.post('/api/gemini/feedback', async (req: Request, res: Response) => {
  const { question, studentAnswer, correctAnswer, lessonTopic } = req.body;

  const fallback = {
    isAccurate: true,
    score: 88,
    positiveEncouragement: 'Terrific effort articulating this concept in your own voice! Active recall cements long-term memory far better than passive reading.',
    feedbackNotes: `Your explanation of "${lessonTopic || 'the topic'}" highlights the essential mechanics. Remember that training data guides the adjustment of weights through gradient descent.`,
    retentionTips: 'Mnemonic: "D.E.W." -> Data in, Error evaluated, Weights tuned!',
    spacedRepetitionQuestion: 'Why does holding out a test set guarantee the model did not simply memorize homework questions?',
    isFallback: true,
  };

  try {
    if (!question || !studentAnswer) {
      return res.status(400).json({ error: 'Missing question or student answer' });
    }

    if (!ai) {
      return res.json(fallback);
    }

    const systemPrompt = `You are OmniLearn's Cognitive Retention Coach.
Your goal is to evaluate student answers to AI & ML questions, reinforce memory consolidation, celebrate student effort, gently rectify any misconceptions, and provide personalized retention strategies based on cognitive science.`;

    const userPrompt = `Lesson Topic: ${lessonTopic || 'General Machine Learning'}
Question asked: ${question}
Standard reference or correct concept: ${correctAnswer || 'Accurate understanding of the topic'}
Student's answer: "${studentAnswer}"

Evaluate the student's answer and return:
1. "isAccurate": boolean.
2. "score": number (0-100).
3. "positiveEncouragement": warm, empowering sentence celebrating their thinking.
4. "feedbackNotes": constructive, easy-to-digest feedback highlighting what they got right and any missing piece.
5. "retentionTips": 1 practical memory hook or sensory analogy for retention.
6. "spacedRepetitionQuestion": 1 follow-up challenge question to reinforce long-term memory.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isAccurate: { type: Type.BOOLEAN },
            score: { type: Type.NUMBER },
            positiveEncouragement: { type: Type.STRING },
            feedbackNotes: { type: Type.STRING },
            retentionTips: { type: Type.STRING },
            spacedRepetitionQuestion: { type: Type.STRING },
          },
          required: ['isAccurate', 'score', 'positiveEncouragement', 'feedbackNotes', 'retentionTips'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ ...parsed, isFallback: false });
  } catch (error: any) {
    console.warn('Fallback triggered in /api/gemini/feedback:', error.message);
    return res.json(fallback);
  }
});

// Endpoint: AI Socratic Tutor / Assistive Learning Companion
app.post('/api/gemini/tutor', async (req: Request, res: Response) => {
  const { message, history = [], currentLessonTitle, accessibilityPreferences = {} } = req.body;

  const fallback = {
    reply: `Hello! I'm your accessible tutor for "${currentLessonTitle || 'AI & Machine Learning'}". 
Here is an intuitive perspective on your question:
In AI and ML, everything comes down to learning from experience. Instead of hardcoded rules, models measure their prediction errors and iteratively nudge their internal numbers (weights) downhill to improve accuracy.
Feel free to ask me for a real-world analogy, a simplified breakdown, or review your offline notes!`,
    suggestedQuestions: [
      'Can you give me an everyday analogy for this?',
      'What is the difference between supervised and unsupervised learning?',
      'Why is privacy and local edge deployment essential for remote communities?',
    ],
    isFallback: true,
  };

  try {
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!ai) {
      return res.json(fallback);
    }

    const { easyRead } = accessibilityPreferences;

    const systemPrompt = `You are OmniLearn Tutor, a friendly, patient, and highly accessible AI & ML mentor.
Context:
- The learner is currently studying: "${currentLessonTitle || 'AI Foundations'}".
- Accessibility preferences: ${easyRead ? 'High plain-language priority (short sentences, simple vocabulary)' : 'Standard clear educational tone'}.
- Always prioritize clarity, safety, data privacy awareness, and practical real-world intuition.
- Break down explanations into digestible steps. Include 2-3 quick follow-up suggested questions that keep the learner engaged.`;

    const formattedHistory = history.map((h: { sender: string; text: string }) => 
      `${h.sender === 'user' ? 'Student' : 'Tutor'}: ${h.text}`
    ).join('\n');

    const prompt = `${formattedHistory ? `Previous conversation:\n${formattedHistory}\n\n` : ''}Student: ${message}

Respond with a JSON object:
- "reply": The tutor's supportive, accessible answer.
- "suggestedQuestions": Array of 3 short questions the student can ask next.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING },
            suggestedQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['reply', 'suggestedQuestions'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ ...parsed, isFallback: false });
  } catch (error: any) {
    console.warn('Fallback triggered in /api/gemini/tutor:', error.message);
    return res.json(fallback);
  }
});

// Endpoint: Generate Personalized Learning Path
app.post('/api/gemini/path', async (req: Request, res: Response) => {
  const { goal, currentSkillLevel, dailyMinutes, learningStyle, interests } = req.body;

  const fallback = {
    pathwayTitle: `${goal || 'AI & Machine Learning'} Accelerator`,
    recommendationSummary: `A customized ${dailyMinutes || 20}-minute daily journey tailored for your ${learningStyle || 'visual/interactive'} preference.`,
    recommendedModules: [
      'Foundations of AI & Prompt Engineering',
      'Machine Learning Basics & Neural Networks',
      'Responsible AI, Ethics & Privacy in ML',
      'Applied ML: Building Practical Data Projects',
    ],
    milestones: [
      'Week 1: Grasp core intuition without complex math',
      'Week 2: Train your first simple classifier model',
      'Week 3: Build an ethical AI project and verify data privacy',
    ],
    weeklyStudyTip: 'Consistent 20-minute daily practice produces 80% greater retention than occasional marathon study sessions.',
    isFallback: true,
  };

  try {
    if (!ai) {
      return res.json(fallback);
    }

    const systemPrompt = `You are OmniLearn's Personalized Curriculum Architect. You create tailored AI & ML learning roadmaps designed for students of all abilities, including remote learners with limited connectivity.`;

    const prompt = `Student Profile:
- Goal: ${goal}
- Current Experience: ${currentSkillLevel}
- Available Time: ${dailyMinutes} minutes/day
- Preferred Learning Style: ${learningStyle}
- Specific Interests: ${interests || 'General AI skills'}

Design a personalized pathway with:
- pathwayTitle (string)
- recommendationSummary (string, 2 sentences)
- recommendedModules (array of module titles from standard curriculum)
- milestones (array of 3 progressive milestone descriptions)
- weeklyStudyTip (string emphasizing retention & spaced repetition)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            pathwayTitle: { type: Type.STRING },
            recommendationSummary: { type: Type.STRING },
            recommendedModules: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            milestones: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            weeklyStudyTip: { type: Type.STRING },
          },
          required: ['pathwayTitle', 'recommendationSummary', 'recommendedModules', 'milestones'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ ...parsed, isFallback: false });
  } catch (error: any) {
    console.warn('Fallback triggered in /api/gemini/path:', error.message);
    return res.json(fallback);
  }
});

// Endpoint: AI Dynamic Quiz & Practice Generator
app.post('/api/gemini/quiz', async (req: Request, res: Response) => {
  const { topic, skillLevel = 'Beginner' } = req.body;

  const fallback = {
    questions: [
      {
        id: 'dyn_q1_' + Date.now(),
        question: `In Machine Learning applied to ${topic || 'AI'}, why is feature engineering critical?`,
        options: [
          'It transforms raw data into informative variables that algorithms can effectively learn from',
          'It turns off the computer when it gets too hot',
          'It replaces the need for any training data',
          'It converts text into numbers with zero meaning',
        ],
        correctAnswerIndex: 0,
        explanation: 'Good features highlight the underlying patterns in data, making it easier for models to learn accurately.',
        mnemonicRetentionTip: 'Garbage Features = Confused Model. Clean Features = Clear Predictions!',
      },
    ],
    isFallback: true,
  };

  try {
    if (!ai) {
      return res.json(fallback);
    }

    const systemPrompt = `You are OmniLearn's Adaptive Quiz Generator. Generate concise, high-yield conceptual multiple-choice questions on AI and Machine Learning. Avoid trick questions. Focus on intuition and practical understanding.`;

    const prompt = `Topic: ${topic || 'Machine Learning Foundations'}
Skill Level: ${skillLevel}

Generate 2 multiple choice questions in JSON:
- "questions": array of objects with:
  - id (string)
  - question (string)
  - options (array of 4 strings)
  - correctAnswerIndex (integer 0-3)
  - explanation (string)
  - mnemonicRetentionTip (string)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctAnswerIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                  mnemonicRetentionTip: { type: Type.STRING },
                },
                required: ['id', 'question', 'options', 'correctAnswerIndex', 'explanation'],
              },
            },
          },
          required: ['questions'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ ...parsed, isFallback: false });
  } catch (error: any) {
    console.warn('Fallback triggered in /api/gemini/quiz:', error.message);
    return res.json(fallback);
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 OmniLearn AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
