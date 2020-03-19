const Quote = require('../modules/quote');

describe('QuoteModule', () => {
  it('getPreferredQuoteOfTheDay - should return a quote or a specific error object', async () => {
    try {
      const quote = await Quote.getPreferredQuoteOfTheDay();
      expect(quote).toHaveProperty('quote');
    } catch (error) {
      expect(error).toEqual(new Error('Couldn\'t fetch quote of the day'));
    }
  });
});
