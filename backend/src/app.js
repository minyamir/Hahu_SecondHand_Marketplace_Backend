import express from "express";
import morgan from "morgan";
import { corsMiddleware } from "./config/cors.js";
import routes from "./routes/index.js";
import { notFoundMiddleware } from "./middleware/notFound.middleware.js";
import { errorMiddleware } from "./middleware/error.middleware.js";

const app = express();

// 1. Global Middleware - Define these only once!
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));

// 2. Base Route - Centralized through routes/index.js
// This covers /api/wallet, /api/escrow, /api/transactions, etc.
app.use("/api", routes);

// 3. Root check
app.get("/", (req, res) => {
  res.json({ success: true, message: "Marketplace API is running" });
});

// 4. Error Handling
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;