import 'dotenv/config'; 
import express from "express";
import cors from "cors";

// Import your route files
import coverLetterGenerate from "./routes/coverLetterGenerate.js";
import coverLetterSummary from "./routes/coverLetterSummary.js";
import exportPdf from "./routes/exportPdf.js";

const app = express();

// FIXED: Using a simpler CORS setup to ensure the 'www' and non-www versions are both allowed
app.use(cors()); 

app.use(express.json({ limit: "10mb" }));

// Routes
app.use("/api/cover-letter", coverLetterGenerate);
app.use("/api/cover-letter/upload-resume", coverLetterSummary);
app.use("/api/export/pdf", exportPdf);

app.get("/", (req, res) => {
  res.send("TradePro API is Live");
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
