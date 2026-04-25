export const CARD_TITLE_MAX_CHARS = 42;

export const normalizeCardTitle = (value = "") =>
  value.replace(/\s+/g, " ").trim();

export const getCardTitleValidationError = (value = "") => {
  const normalized = normalizeCardTitle(value);

  if (!normalized) return "Title is required.";

  if (normalized.length > CARD_TITLE_MAX_CHARS) {
    return `Title can have at most ${CARD_TITLE_MAX_CHARS} characters.`;
  }

  return "";
};
