import 'dotenv/config'; 
import express from "express";
import cors from "cors";

// 1. IMPORT YOUR ROUTE FILES
// Ensure these names match your files in the /routes folder exactly
import coverLetterGenerate from "./routes/coverLetterGenerate.js";
import coverLetterSummary from "./routes/coverLetterSummary.js";
import exportPdf from "./routes/exportPdf.js";

const app = express();

// 2. FIX CORS: This must match the 'www' origin in your screenshot error
app.use(cors({
  origin: ["https://tradeprotech.ai", "https://tradeprotech.ai"],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "10mb" }));

// 3. FIX 404: Mapping the EXACT URL in your error message
// This connects the "/api/cover-letter/upload-resume" call to your summary logic
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
