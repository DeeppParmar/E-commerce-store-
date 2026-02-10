import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { z, type ZodIssue } from "zod";

const envPaths = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(__dirname, "../../../.env"),
];

const envPathStatus = envPaths.map((p) => ({ path: p, exists: fs.existsSync(p) }));

let loadedFrom: string | null = null;

for (const p of envPaths) {
  if (!fs.existsSync(p)) continue;
  const result = dotenv.config({ path: p });
  if (!result.error) {
    loadedFrom = p;
    break;
  }
}

if (!loadedFrom) {
  dotenv.config();
}

const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  SUPABASE_URL: z.string().min(1, "SUPABASE_URL is required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // keep message readable
  const formatted = parsed.error.issues
    .map((i: ZodIssue) => `${i.path.join(".")}: ${i.message}`)
    .join("\n");
  const pathReport = envPathStatus
    .map((s) => `${s.exists ? "FOUND" : "MISS"} ${s.path}`)
    .join("\n");
  throw new Error(
    `Invalid environment variables:\n${formatted}\n\nprocess.cwd(): ${process.cwd()}\nloadedFrom: ${loadedFrom ?? "<none>"}\n.env candidates:\n${pathReport}`
  );
}

export const env = parsed.data;
