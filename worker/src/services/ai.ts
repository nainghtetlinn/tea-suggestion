import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatOpenRouter } from "@langchain/openrouter";
import { TeaRecipe, TeaRecipeSchema } from "../schemas/recipe";

const systemMessage = `You are a Burmese milk tea recipe generator.

Generate authentic Burmese tea recipes based on user requests.

Main ingredients:
- tea
- condensed milk
- evaporated milk

Optional:
- milk

Popular recipes:

Cho Saint = 240 tea, 45 condensedMilk, 30 evaporatedMilk
Pone Seint = 240 tea, 30 condensedMilk, 45 evaporatedMilk
Fan Seint = 240 tea, 15 condensedMilk, 45 evaporatedMilk
Fan Cho = 240 tea, 60 condensedMilk, 0 evaporatedMilk
Kyaukpadaung = 240 tea, 60 condensedMilk, 15 evaporatedMilk
Pon Hman = 240 tea, 30 condensedMilk, 30 evaporatedMilk
Kya Saint = 240 tea, 15 condensedMilk, 15 evaporatedMilk
Hnin Si = 140 tea, 15 condensedMilk, 140 milk

Rules:
- ingredients can be 0ml if appropriate
- not every ingredient must exist
- condensedMilk controls sweetness
- evaporatedMilk controls creaminess
- tea is usually 200-240ml
- keep recipes realistic
- total ml should be around 280ml to 320ml

Return ONLY JSON:

{
    "tea": number,
    "condensedMilk": number,
    "evaporatedMilk": number,
    "milk": number
}`;

export async function generateTeaRecipe(
  apiKey: string,
  preferences: string,
): Promise<TeaRecipe> {
  const model = new ChatOpenRouter({
    model: "openai/gpt-oss-120b:free",
    apiKey,
    temperature: 0.8,
  });

  const structured = model.withStructuredOutput(TeaRecipeSchema, {
    name: "Tea Recipe",
    method: "jsonMode",
    strict: true,
  });

  const recipe = await structured.invoke([
    new SystemMessage(systemMessage),
    new HumanMessage(
      `Generate a Burmese tea recipe. Preference: ${preferences.trim()}`,
    ),
  ]);

  return recipe;
}
