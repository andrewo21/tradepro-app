import 'dotenv/config'; 
import express from "express";

// Import your route files
import coverLetterGenerate from "./routes/coverLetterGenerate.js";
import coverLetterSummary from "./routes/coverLetterSummary.js";
import exportPdf from "./routes/exportPdf.js";

const app = express();

// 1. MANUAL IRONCLAD CORS (Bypasses the library)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  // Handle the "pre-flight" request browsers send
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: "10mb" }));

// 2. CONNECT ROUTES
app.use("/api/cover-letter", coverLetterGenerate);
app.use("/api/cover-letter/upload-resume", coverLetterSummary);
app.use("/api/export/pdf", exportPdf);

app.get("/", (req, res) => {
  res.send("TradePro API is Live and Forced Open");
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
