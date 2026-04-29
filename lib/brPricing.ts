// lib/brPricing.ts
// Brazilian product IDs — safe to import from both client and server components

export enum BrProductId {
  RESUME       = "br_curriculo_padrao",
  COVER_LETTER = "br_carta_apresentacao",
  BUNDLE       = "br_pacote_premium",
}

export const BR_PRODUCT_LABELS: Record<BrProductId, string> = {
  [BrProductId.RESUME]:       "Currículo Padrão",
  [BrProductId.COVER_LETTER]: "Carta de Apresentação",
  [BrProductId.BUNDLE]:       "Pacote Premium",
};

export const BR_PRODUCT_PRICES: Record<BrProductId, string> = {
  [BrProductId.RESUME]:       "R$ 79",
  [BrProductId.COVER_LETTER]: "R$ 39",
  [BrProductId.BUNDLE]:       "R$ 149",
};
