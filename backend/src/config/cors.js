import cors from "cors";
import { env } from "./env.js";

export const corsMiddleware = cors({
  origin: '*',
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
});