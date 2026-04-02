export {};

declare global {
  interface Window {
    imtQuoteAttributionLogging?: {
      nonce: string;
      api_url: string;
    };
  }
}