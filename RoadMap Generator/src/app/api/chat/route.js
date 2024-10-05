import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const google = createGoogleGenerativeAI({
  apiKey: "Your GOOGLE API KEY",
});

export async function POST(req) {
  try {
    const { messages } = await req.json();

    const { object } = await generateObject({
      model: google("gemini-1.5-flash"),
      schema: z.object({
        roadmap: z.object({
          profession: z.string(),
          to_learn: z.array(z.string()),
          education: z.array(z.string()),
          expected_salary: z.string(),
        }),
      }),
      prompt: messages[0],
      system: JSON.stringify({
        persona: "You are a roadmap genearator for any profession",
        role: "You have to generate the roadmap in the given schema with profession name , Technologies to learn or concepts to learn , educational qualifications like 10th,12th/ diploma , UG in specific course or PG in specific course. And also provide the expected salary in INR",
      }),
    });

    return new Response(JSON.stringify({ roadmap: object.roadmap }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in API route:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}
