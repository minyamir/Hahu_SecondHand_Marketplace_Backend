import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../../.env")
});

console.log("PORT =", process.env.PORT);
console.log("MONGO_URI raw =", process.env.MONGO_URI);
console.log("All env keys sample =", Object.keys(process.env).filter(k =>
  k.includes("MONGO") || k.includes("PORT") || k.includes("JWT") || k.includes("CLIENT")
));

export const env = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || "",
  jwtSecret: process.env.JWT_SECRET || "",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  nodeEnv: process.env.NODE_ENV || "development"
};