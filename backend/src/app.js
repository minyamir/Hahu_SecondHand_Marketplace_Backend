import express from "express";
import morgan from "morgan";
import { corsMiddleware } from "./config/cors.js";
import routes from "./routes/index.js";
import { notFoundMiddleware } from "./middleware/notFound.middleware.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import transactionRoutes from './routes/transaction.routes.js';
import walletRoutes from './routes/wallet.routes.js';

const app = express();

app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));
app.use('/api/transactions', transactionRoutes);
// --- ADD THESE LINES ---
app.use(express.json()); // Essential for parsing JSON bodies
app.use(express.urlencoded({ extended: true })); // Essential for parsing form data
// -----------------------

// Your routes
app.use("/api/wallet", walletRoutes);
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Marketplace API is running"
  });
});

app.use("/api", routes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;