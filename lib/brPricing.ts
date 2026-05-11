// lib/brPricing.ts
// Brazilian product IDs — safe to import from both client and server components

export enum BrProductId {
  BUNDLE = "br_pacote_premium",
  // Legacy IDs kept for webhook/grant compatibility
  RESUME       = "br_curriculo_padrao",
  COVER_LETTER = "br_carta_apresentacao",
}

export const BR_PRODUCT_LABELS: Record<BrProductId, string> = {
  [BrProductId.BUNDLE]:       "Pacote Completo",
  [BrProductId.RESUME]:       "Currículo",
  [BrProductId.COVER_LETTER]: "Carta de Apresentação",
};

export const BR_PRODUCT_PRICES: Record<BrProductId, string> = {
  [BrProductId.BUNDLE]:       "R$ 49",
  [BrProductId.RESUME]:       "R$ 49",
  [BrProductId.COVER_LETTER]: "R$ 49",
};
