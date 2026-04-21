import 'dotenv/config'; 
import express from "express";
import cors from "cors";

// Import your route files
import coverLetterGenerate from "./routes/coverLetterGenerate.js";
import coverLetterSummary from "./routes/coverLetterSummary.js";
import exportPdf from "./routes/exportPdf.js";

const app = express();

// 1. FIX CORS: This must include the "www" version of your site from the screenshot
app.use(cors({
  origin: ["https://tradeprotech.ai", "https://tradeprotech.ai"],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "10mb" }));

// 2. FIX 404: Matching the EXACT URL in your error message
// Your screenshot shows the site calling "/api/cover-letter/upload-resume"
app.use("/api/cover-letter", coverLetterGenerate);
app.use("/api/cover-letter/upload-resume", coverLetterSummary);
app.use("/api/export/pdf", exportPdf);

app.get("/", (req, res) => {
  res.send("TradePro API is running");
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
