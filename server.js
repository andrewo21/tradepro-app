import express from "express";
import cors from "cors";
import coverLetterGenerate from "./routes/coverLetterGenerate.js";

app.use("/cover-letter/generate", coverLetterGenerate);

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/", (req, res) => {
  res.send("Backend is running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

