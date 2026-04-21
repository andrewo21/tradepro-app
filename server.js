import 'dotenv/config'; 
import express from "express";
import cors from "cors";

// Import your route files - ensure these names match exactly (Case Sensitive)
import coverLetterGenerate from "./routes/coverLetterGenerate.js";
import coverLetterSummary from "./routes/coverLetterSummary.js";
import exportPdf from "./routes/exportPdf.js";

const app = express();

// 1. CONFIGURE CORS
app.use(cors({
  origin: ["https://tradeprotech.ai", "https://tradeprotech.ai"],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "10mb" }));

// 2. CONNECT ROUTES
app.use("/api/cover-letter", coverLetterGenerate);
app.use("/api/cover-letter/upload-resume", coverLetterSummary);
app.use("/api/export/pdf", exportPdf);

app.get("/", (req, res) => {
  res.send("TradePro API is running");
});

// 3. START SERVER
const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ ERROR: OPENAI_API_KEY is missing from environment variables!");
  } else {
    console.log("✅ OpenAI API Key detected.");
  }
});
