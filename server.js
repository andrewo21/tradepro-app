import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();

// 1. FIX CORS
app.use(cors({
  origin: ["https://tradeprotech.ai", "https://tradeprotech.ai"],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "10mb" }));

// 2. SAFE ROUTE LOADING
// This prevents the "Status 1" crash by checking if the file is there first
const loadRoute = async (routeName, filePath) => {
  if (fs.existsSync(path.resolve(filePath))) {
    const module = await import(filePath);
    app.use(routeName, module.default);
    console.log(`✅ Loaded route: ${routeName}`);
  } else {
    console.error(`❌ MISSING FILE: Could not find ${filePath}. Check your spelling/capitalization!`);
  }
};

// Map your routes (Make sure these match your actual folder structure)
loadRoute("/api/cover-letter", "./routes/coverLetterGenerate.js");
loadRoute("/api/cover-letter/upload-resume", "./routes/coverLetterSummary.js");
loadRoute("/api/export/pdf", "./routes/exportPdf.js");

app.get("/", (req, res) => {
  res.send("TradePro API is Live");
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
