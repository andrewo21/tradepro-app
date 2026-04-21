import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// 1. IMPORT ALL YOUR ROUTE FILES
import coverLetterGenerate from "./routes/coverLetterGenerate.js";
import coverLetterSummary from "./routes/coverLetterSummary.js";
import exportPdf from "./routes/exportPdf.js";

dotenv.config();

const app = express();

// 2. FIX CORS: This tells Render to trust your website domain
app.use(cors({
  origin: ["https://tradeprotech.ai", "https://tradeprotech.ai"],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Increase limits for resume uploads
app.use(express.json({ limit: "10mb" }));

// 3. FIX 404: Map your Route Files to the URLs the website is calling
// These MUST match the fetch() calls in your Vercel frontend
app.use("/api/cover-letter/generate", coverLetterGenerate);
app.use("/api/cover-letter/summary", coverLetterSummary);
app.use("/api/export/pdf", exportPdf);

app.get("/", (req, res) => {
  res.send("TradePro API is Live and Connected");
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
