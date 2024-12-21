import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { experimental_createProviderRegistry as createProviderRegistry } from "ai";

export const registry = createProviderRegistry({
  google: createGoogleGenerativeAI({ apiKey: process.env.API_KEY }),
});
