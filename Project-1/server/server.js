import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from root directory
dotenv.config({ path: join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
  res.json({
    status: 'ok',
    service: 'GiftGenie API',
    geminiKeyConfigured: hasKey,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Safely parse JSON from model output which might include markdown code fences or conversational text.
 */
function extractAndParseJSON(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Empty or invalid response received from AI model');
  }

  // Remove markdown code blocks if present
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
  cleaned = cleaned.replace(/\s*```$/i, '');
  cleaned = cleaned.trim();

  // If there's still text surrounding the JSON array, try to find the array bracket boundaries
  const firstBracket = cleaned.indexOf('[');
  const lastBracket = cleaned.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    cleaned = cleaned.substring(firstBracket, lastBracket + 1);
  }

  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed)) {
    // If it's an object with a "gifts" or "recommendations" key
    if (parsed && Array.isArray(parsed.gifts)) return parsed.gifts;
    if (parsed && Array.isArray(parsed.recommendations)) return parsed.recommendations;
    throw new Error('Model response is not an array of gift recommendations');
  }

  return parsed;
}

// Model candidate list in priority order (fastest & most stable first)
const MODEL_CANDIDATES = [
  'gemini-flash-latest',
  'gemini-3.5-flash',
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-pro-latest',
];

// Generate gift recommendations
app.post('/api/recommendations', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || !apiKey.trim()) {
      return res.status(500).json({
        error: 'Gemini API key is missing. Please configure GEMINI_API_KEY in the .env file.',
        code: 'MISSING_API_KEY',
      });
    }

    const {
      gender = 'Any',
      age = 'Not specified',
      occasion = 'General Gift',
      relationship = 'Friend',
      budget = 'Flexible',
      interests = '',
      additionalInfo = '',
    } = req.body || {};

    if (!occasion && !relationship && !age) {
      return res.status(400).json({
        error: 'Please provide recipient information to generate recommendations.',
        code: 'EMPTY_FORM',
      });
    }

    const prompt = `You are an expert personalized gift advisor.

Based on the following information about the gift recipient:

Gender: ${gender}
Age: ${age}
Occasion: ${occasion}
Relationship: ${relationship}
Budget: ${budget}
Interests/Hobbies: ${interests ? interests : 'Not specified'}
Additional information: ${additionalInfo ? additionalInfo : 'None'}

Suggest exactly 6 thoughtful, highly creative, and practical gift ideas.

For each gift, provide:
1. Gift name (catchy and specific, e.g. "Minimalist Leather Cardholder Wallet" or "Smart Plant Hydration Monitor")
2. Short description (1-2 sentences about what the gift is)
3. Why it is suitable for this person (clear reasoning linking to their age, relationship, occasion, or interests)
4. Estimated price in INR (e.g. "₹1,200" or "₹3,500" - keep within or close to the requested budget)
5. A suitability score from 1-10 (e.g. 9.2 or 9.8)
6. A category (e.g. Tech & Gadgets, Fashion & Style, Home & Living, Books & Stationery, Wellness & Self-Care, Gourmet & Food, Experiences & Activities, Creative & Hobby)
7. One alternative gift (a similar or related alternative item)

Consider the person's age, gender, occasion, relationship, interests, and budget.
Avoid generic recommendations when enough information is provided.

IMPORTANT: Respond ONLY with a valid JSON array of 6 objects. Do not include any explanations, greetings, or commentary outside the JSON array.

Expected JSON format:
[
  {
    "name": "Gift Name Here",
    "description": "Short description of the item.",
    "whySuitable": "Why this gift is perfect for this person.",
    "estimatedPrice": "₹1,999",
    "suitabilityScore": 9.5,
    "category": "Tech & Gadgets",
    "alternative": "Alternative gift idea"
  }
]`;

    const genAI = new GoogleGenerativeAI(apiKey.trim());

    let responseText = null;
    let lastError = null;

    // Try candidate models with JSON mode
    for (const modelName of MODEL_CANDIDATES) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            topK: 40,
            responseMimeType: 'application/json',
          },
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        responseText = response.text();
        if (responseText) {
          break; // successfully generated
        }
      } catch (err) {
        lastError = err;
        console.warn(`Attempt with model ${modelName} failed:`, err.message || err);
        // Continue to next candidate model
      }
    }

    // Fallback: try candidate models without responseMimeType if JSON mode failed
    if (!responseText) {
      for (const modelName of MODEL_CANDIDATES.slice(0, 3)) {
        try {
          const fallbackModel = genAI.getGenerativeModel({ model: modelName });
          const result = await fallbackModel.generateContent(prompt);
          const response = await result.response;
          responseText = response.text();
          if (responseText) break;
        } catch (err) {
          lastError = err;
        }
      }
    }

    if (!responseText) {
      console.error('All Gemini model invocations failed. Last error:', lastError);
      const errMsg = lastError?.message || 'Failed to generate recommendations from Gemini API';
      
      // Check for rate limit or quota
      if (errMsg.includes('429') || errMsg.toLowerCase().includes('quota') || errMsg.toLowerCase().includes('resource_exhausted')) {
        return res.status(429).json({
          error: 'Gemini API quota or rate limit reached. Please wait a moment and try again.',
          code: 'RATE_LIMIT_EXCEEDED',
        });
      }
      if (errMsg.toLowerCase().includes('api_key') || errMsg.toLowerCase().includes('api key') || errMsg.includes('400')) {
        return res.status(401).json({
          error: 'Invalid or expired Gemini API key. Please verify your GEMINI_API_KEY in .env.',
          code: 'INVALID_API_KEY',
        });
      }

      return res.status(500).json({
        error: "Oops! We couldn't generate gift ideas right now. Please try again in a moment.",
        details: errMsg,
        code: 'GENERATION_FAILED',
      });
    }

    // Parse and sanitize the recommendations
    const rawGifts = extractAndParseJSON(responseText);

    const sanitizedGifts = rawGifts.map((gift, index) => {
      // Ensure price has INR symbol
      let priceStr = String(gift.estimatedPrice || gift.price || '₹1,500').trim();
      if (!priceStr.includes('₹') && !priceStr.toLowerCase().includes('inr') && !priceStr.includes('Rs')) {
        priceStr = `₹${priceStr}`;
      }

      // Ensure suitability score is a clean number between 1 and 10
      let score = parseFloat(gift.suitabilityScore || gift.score || 9);
      if (isNaN(score) || score <= 0) score = 9.0;
      if (score > 10) score = 10;

      return {
        id: `gift-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}`,
        name: gift.name || `Thoughtful Gift Idea #${index + 1}`,
        description: gift.description || 'A wonderfully tailored gift idea.',
        whySuitable: gift.whySuitable || gift.why_suitable || gift.reason || 'Matches the recipient profile and occasion.',
        estimatedPrice: priceStr,
        suitabilityScore: score,
        category: gift.category || 'Special Picks',
        alternative: gift.alternative || gift.alternativeGift || 'Custom Gift Card',
      };
    });

    return res.json({
      success: true,
      count: sanitizedGifts.length,
      gifts: sanitizedGifts,
      recipientSummary: {
        gender,
        age,
        occasion,
        relationship,
        budget,
      },
    });
  } catch (error) {
    console.error('Error in /api/recommendations:', error);
    return res.status(500).json({
      error: "Oops! We couldn't generate gift ideas right now. Please try again.",
      details: error.message,
      code: 'SERVER_ERROR',
    });
  }
});

app.listen(PORT, () => {
  console.log(`🎁 GiftGenie backend server running at http://localhost:${PORT}`);
});
