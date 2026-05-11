// lib/ats/utils/normalize.ts
// Pure normalization functions. No AI. No side effects. Deterministic.

/** Normalize a single string: lowercase, trim, remove punctuation, collapse spaces */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[.,;:!?()\[\]{}'"`\-\/\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Normalize an array of strings and remove duplicates */
export function normalizeList(arr: string[]): string[] {
  return [...new Set(arr.map(normalize).filter(Boolean))];
}

/**
 * Portuguese synonym groups for skill matching.
 * If a required skill matches any variant in a group,
 * all variants are considered equivalent.
 */
const SYNONYM_GROUPS: string[][] = [
  ["atendimento ao cliente", "customer service", "suporte ao cliente", "atendimento"],
  ["gestão de projetos", "gerenciamento de projetos", "project management", "gestao de projetos"],
  ["liderança", "lider", "liderar", "liderança de equipe", "gestão de equipe", "lideranca"],
  ["excel", "microsoft excel", "planilha excel", "excel avançado", "excel avancado"],
  ["pacote office", "microsoft office", "office", "ms office", "suite office"],
  ["inglês", "ingles", "english", "idioma inglês", "idioma ingles"],
  ["comunicação", "comunicacao", "habilidade de comunicação", "comunicação oral e escrita"],
  ["trabalho em equipe", "trabalho em time", "teamwork", "colaboração", "colaboracao"],
  ["redes sociais", "social media", "mídias sociais", "midias sociais"],
  ["análise de dados", "data analysis", "analise de dados", "analisar dados"],
  ["python", "linguagem python", "programação python"],
  ["excel avançado", "excel avancado", "excel", "planilha"],
  ["marketing digital", "marketing online", "marketing em redes sociais"],
  ["gestão financeira", "gestao financeira", "controle financeiro", "finanças"],
  ["recursos humanos", "rh", "human resources", "gestão de pessoas"],
];

/** Return all synonym variants for a given term */
export function expandSynonyms(term: string): string[] {
  const normalized = normalize(term);
  for (const group of SYNONYM_GROUPS) {
    const normalizedGroup = group.map(normalize);
    if (normalizedGroup.includes(normalized)) {
      return normalizedGroup;
    }
  }
  return [normalized];
}
