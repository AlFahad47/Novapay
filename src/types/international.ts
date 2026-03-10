// Supported currencies (must match exchange-rate/route.ts)
export type SupportedCurrency = "USD" | "EUR" | "GBP" | "PHP" | "INR" | "SGD" | "AUD" | "JPY" | "CAD";

// Currency display info for the UI (flag, symbol, name)
export const CURRENCY_META: Record<SupportedCurrency, { symbol: string; name: string; flag: string; countryCode: string }> = {
  USD: { symbol: "$",  name: "US Dollar",        flag: "🇺🇸", countryCode: "us" },
  EUR: { symbol: "€",  name: "Euro",              flag: "🇪🇺", countryCode: "eu" },
  GBP: { symbol: "£",  name: "British Pound",     flag: "🇬🇧", countryCode: "gb" },
  PHP: { symbol: "₱",  name: "Philippine Peso",   flag: "🇵🇭", countryCode: "ph" },
  INR: { symbol: "₹",  name: "Indian Rupee",      flag: "🇮🇳", countryCode: "in" },
  SGD: { symbol: "S$", name: "Singapore Dollar",  flag: "🇸🇬", countryCode: "sg" },
  AUD: { symbol: "A$", name: "Australian Dollar", flag: "🇦🇺", countryCode: "au" },
  JPY: { symbol: "¥",  name: "Japanese Yen",      flag: "🇯🇵", countryCode: "jp" },
  CAD: { symbol: "C$", name: "Canadian Dollar",   flag: "🇨🇦", countryCode: "ca" },
};

// FX fee percentage (2% charged on every international transfer)
export const FX_FEE_PERCENT = 2;

// Shape of one international transaction saved in history
export interface InternationalTransaction {
  transactionId: string;
  type: "international_send" | "international_receive";
  fromCurrency: SupportedCurrency;
  toCurrency: SupportedCurrency;
  amountSent: number;       // what the sender paid (in fromCurrency)
  amountReceived: number;   // what the receiver got (in toCurrency)
  rate: number;             // exchange rate used at time of transfer
  fee: number;              // FX fee charged (in fromCurrency)
  senderEmail: string;
  recipientEmail: string;
  description?: string;
  status: "completed" | "failed" | "pending";
  date: Date | string;
}

// Shape of the exchange rate API response
export interface ExchangeRateResponse {
  base: SupportedCurrency;
  date: string;
  rates: Partial<Record<SupportedCurrency, number>>;
}

// Input for the international transfer form
export interface InternationalTransferInput {
  senderEmail: string;
  recipientEmail: string;
  fromCurrency: SupportedCurrency;
  toCurrency: SupportedCurrency;
  amount: number;
  description?: string;
}

// Preview data shown to user before they confirm the transfer
export interface TransferPreview {
  amountSent: number;
  fromCurrency: SupportedCurrency;
  amountReceived: number;
  toCurrency: SupportedCurrency;
  rate: number;
  fee: number;
  feePercent: number;
  totalDeducted: number; // amountSent + fee
}
