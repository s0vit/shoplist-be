export const RECEIPT_AI_ERROR = {
  GEMINI_REJECTED: 'receiptAi.errors.geminiRejected',
  RECOGNITION_FAILED: 'receiptAi.errors.recognitionFailed',
  INVALID_JSON: 'receiptAi.errors.invalidJson',
  UNKNOWN: 'receiptAi.errors.unknown',
  NO_EXPENSE: 'receiptAi.errors.noExpense',
  MISSING_IMAGE: 'receiptAi.errors.missingImage',
  UNSUPPORTED_IMAGE_TYPE: 'receiptAi.errors.unsupportedImageType',
  NO_CATEGORIES: 'receiptAi.errors.noCategories',
  NO_PAYMENT_SOURCES: 'receiptAi.errors.noPaymentSources',
  INVALID_AMOUNT: 'receiptAi.errors.invalidAmount',
  CATEGORY_NOT_SELECTED: 'receiptAi.errors.categoryNotSelected',
  PAYMENT_SOURCE_NOT_SELECTED: 'receiptAi.errors.paymentSourceNotSelected',
  UNKNOWN_CATEGORY_ID: 'receiptAi.errors.unknownCategoryId',
  UNKNOWN_PAYMENT_SOURCE_ID: 'receiptAi.errors.unknownPaymentSourceId',
  INVALID_RESPONSE: 'receiptAi.errors.invalidResponse',
  NO_CANDIDATES: 'receiptAi.errors.noCandidates',
  NO_TEXT_PART: 'receiptAi.errors.noTextPart',
} as const;

export const RECEIPT_AI_PROMPT = {
  MAX_COMMENT_LENGTH: 100,
  REQUEST_TIMEOUT_MS: 20000,
} as const;
