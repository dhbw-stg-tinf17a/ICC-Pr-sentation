const Quote = require('../modules/quote');

const typeOf = (object) => Object.prototype.toString.call(object).slice(8, -1).toLowerCase();

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
