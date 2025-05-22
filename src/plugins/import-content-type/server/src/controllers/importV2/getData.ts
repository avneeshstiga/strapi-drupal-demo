import { mapToStrapiAcType } from '../../parsers/taxonomy/ac_type/ac_type';
import https from 'https';
const axios = require('axios');

const PAGE_SIZE = 10; // Number of data per request

export async function fetchAll(baseUrl: string) {
  let allData = [];
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    const offset = (page - 1) * PAGE_SIZE;
    const url = `${baseUrl}?page[limit]=${PAGE_SIZE}&page[offset]=${offset}`;

    console.log('url', url);

    try {
      const httpsAgent = new https.Agent({
        rejectUnauthorized: false,
      });
      const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url,
        headers: { Accept: 'application/vnd.api+json' },
        httpsAgent,
      };

      const response = await axios(config);

      const batchData = response.data.data;
      if (batchData.length === 0) {
        console.log(`No more data found. Stopping at page ${page}.`);
        hasNextPage = false;
      } else {
        console.log(`--- Page ${page} ---`);
        const mappedData = batchData.map((data) => {
          console.log(`- ${data.attributes.name}`);
          return mapToStrapiAcType(data);
        });
        allData = allData.concat(mappedData);
        page++;
      }
    } catch (error) {
      console.error(`Error fetching page ${page}:`, error.message);
      hasNextPage = false; // stop on error
    }
  }

  console.log(`\n✅ Finished. Total data fetched: ${allData.length}`);
  return allData;
}
