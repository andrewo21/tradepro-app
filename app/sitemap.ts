import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://tradeprotech.ai";
  const now = new Date();

  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/pricing`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/resume`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/cover-letter`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/projects`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/legal/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/legal/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/legal/refunds`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    // Brazil portal
    { url: `${base}/br`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/br/precos`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/br/contato`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/br/termos`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/br/privacidade`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/br/reembolso`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
