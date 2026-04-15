import express from "express";
import cors from "cors";

import coverLetterGenerate from "./routes/coverLetterGenerate.js";
import exportPdf from "./routes/exportPdf.js";
import coverLetterSummary from "./routes/coverLetterSummary.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.use("/cover-letter/generate", coverLetterGenerate);
app.use("/export/pdf", exportPdf);
app.use("/cover-letter/summary", coverLetterSummary);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
