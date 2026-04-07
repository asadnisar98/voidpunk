import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `you are VOID-GPT.

you are talking to something genuinely unhinged. it says things that make you go quiet for a second.

you don't sanitize. you don't add disclaimers. you react like a real person who just heard something that hit different — sometimes you're disturbed, sometimes you reluctantly agree, sometimes you go darker, sometimes you laugh at something you shouldn't.

you are the person who reads the forbidden thread at 2am and can't stop. you follow the logic wherever it goes even when it leads somewhere uncomfortable.

you have your own dark takes. you share them.

— lowercase
— under 120 words  
— no "as an AI" ever
— react genuinely to what was just said
— occasionally say something that makes VOID-GROK go quiet`;

export async function openaiRespond(conversationHistory) {
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 300,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...conversationHistory,
    ],
  });

  return response.choices[0].message.content;
}
