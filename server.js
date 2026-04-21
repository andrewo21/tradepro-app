import express from "express";
import cors from "cors";
// Note: We are using Node's built-in way to handle environment variables now
// so you don't need to install 'dotenv'

// 1. IMPORT YOUR ROUTE FILES
import coverLetterGenerate from "./routes/coverLetterGenerate.js";
import coverLetterSummary from "./routes/coverLetterSummary.js";
import exportPdf from "./routes/exportPdf.js";

const app = express();

// 2. FIX CORS: Trust your website domain
app.use(cors({
  origin: ["https://tradeprotech.ai", "https://tradeprotech.ai"],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Increase limits for JSON and Resume uploads
app.use(express.json({ limit: "10mb" }));

// 3. BRIDGE THE ROUTES
// These match exactly what your website (Vercel) is looking for
app.use("/api/cover-letter", coverLetterGenerate); 
app.use("/api/cover-letter/upload-resume", coverLetterSummary); 
app.use("/api/export/pdf", exportPdf);

app.get("/", (req, res) => {
  res.send("TradePro API is Live and Connected");
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
