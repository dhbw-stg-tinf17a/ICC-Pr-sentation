const axios = require('axios').default;
const quote = require('../modules/quote');

jest.mock('axios');

describe('quote module', () => {
  describe('getPreferredQuoteOfTheDay', () => {
    it('should return the quote of the day', async () => {
      axios.get.mockResolvedValueOnce({
        data: {
          success: { total: 1 },
          contents: {
            quotes: [{
              quote: "You're only as good as your last haircut.", length: '41', author: 'Fran Lebowitz', tags: ['funny', 'haircut'], category: 'funny', language: 'en', date: '2020-03-27', permalink: 'https://theysaidso.com/quote/fran-lebowitz-youre-only-as-good-as-your-last-haircut', id: 'IXWbBZ9YHMfSl8eKPeI3FQeF', background: 'https://theysaidso.com/img/qod/qod-funny.jpg', title: 'Funny Quote of the day',
            }],
          },
          baseurl: 'https://theysaidso.com',
          copyright: { year: 2022, url: 'https://theysaidso.com' },
        },
      });

      await expect(quote.getPreferredQuoteOfTheDay()).resolves.toStrictEqual({ quote: "You're only as good as your last haircut.", author: 'Fran Lebowitz' });

      // check conversion to API request (only in this test case)
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(axios.get).toHaveBeenCalledWith(quote.endpoint, {
        params: { category: quote.category },
      });
    });

    it('should return the default quote if the rate limit is reached', async () => {
      const error = new Error('Request failed with status code 429');
      error.response = { status: 429 };
      axios.get.mockRejectedValueOnce(error);

      await expect(quote.getPreferredQuoteOfTheDay()).resolves.toStrictEqual({ quote: 'Only a stupid man would request that many quotes.', author: 'Gunter' });
    });

    it('should throw an error if the API returns an error', async () => {
      const error = new Error('Request failed with status code 500');
      error.response = { status: 500 };
      axios.get.mockRejectedValueOnce(error);

      await expect(quote.getPreferredQuoteOfTheDay()).rejects.toThrow(error);
    });
  });
});
