import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { ZodError, z } from "zod";
import { ChatRequestSchema } from "./schemas/recipe";
import { generateTeaRecipe } from "./services/ai";

type Bindings = {
  OPENROUTER_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.post("/chat", zValidator("json", ChatRequestSchema), async (c) => {
  const { OPENROUTER_API_KEY } = c.env;
  if (!OPENROUTER_API_KEY) {
    throw new HTTPException(500, {
      message: "OPENROUTER_API_KEY is not configured",
    });
  }

  const { preferences } = c.req.valid("json");
  const recipe = await generateTeaRecipe(OPENROUTER_API_KEY, preferences);

  return c.json({ recipe }, 201);
});

app.onError((err, c) => {
  console.error(err);

  if (err instanceof ZodError) {
    return c.json(
      {
        message: "Invalid request body",
        issues: z.flattenError(err).fieldErrors,
      },
      400,
    );
  }

  if (err instanceof HTTPException) {
    return c.json({ message: err.message }, err.status);
  }

  return c.json({ message: "Internal Server Error" }, 500);
});

export default app;
