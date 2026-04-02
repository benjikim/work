export const {QuoteClient, Quote, CannedQuotes} = require('@qa/node-quote-client');
export const env = Cypress.env('host');
export const awsIndicator = Cypress.env('awsIndicator');
export const baseUrl = Cypress.env('baseUrl');
export const client = new QuoteClient(env);
export const dayjs = require("dayjs");

Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false
})
