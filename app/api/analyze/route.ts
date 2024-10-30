// app/api/analyze/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.REPLIT_OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a sentiment analysis expert. Analyze the following text and provide detailed metrics including aspect-based sentiment analysis in JSON format with the following structure:
          {
            "sentimentScores": {
              "positive": number (0-100),
              "negative": number (0-100),
              "neutral": number (0-100)
            },
            "modelMetrics": {
              "accuracy": number (0-100),
              "precision": number (0-1),
              "recall": number (0-1),
              "f1Score": number (0-1)
            },
            "confusionMatrix": {
              "truePositive": number,
              "trueNegative": number,
              "falsePositive": number,
              "falseNegative": number
            },
            "sentimentDistribution": {
              "veryPositive": number,
              "positive": number,
              "neutral": number,
              "negative": number,
              "veryNegative": number
            },
            "rocCurve": {
              "falsePositiveRate": [numbers],
              "truePositiveRate": [numbers]
            },
            "aucScore": number (0-1),
            "comparativeAnalysis": {
              "industry": string,
              "averageSentiment": number,
              "percentileRank": number
            },
            "aspectBasedAnalysis": {
              "aspects": [
                {
                  "aspect": string,
                  "sentiment": number (-1 to 1),
                  "confidence": number (0-1),
                  "mentions": number,
                  "keywords": [string],
                  "examples": [string]
                }
              ],
              "aspectRelations": [
                {
                  "aspect1": string,
                  "aspect2": string,
                  "correlation": number (-1 to 1)
                }
              ],
              "topAspects": [
                {
                  "aspect": string,
                  "frequency": number,
                  "averageSentiment": number
                }
              ],
              "temporalTrends": [
                {
                  "aspect": string,
                  "timepoints": [
                    {
                      "point": string,
                      "sentiment": number
                    }
                  ]
                }
              ]
            }
          }`
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" }
    });

    return NextResponse.json(response.choices[0].message.content);
  } catch (error) {
    console.error('Full error details:', error);
    return NextResponse.json({
      error: 'Error analyzing sentiment',
      details: error.message
    }, { status: 500 });
  }
}