import axios from 'axios'
import * as cheerio from 'cheerio'

const urlSrc = 'https://www.ambev.com.br/marcas/cervejas';

async function getHTML(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (err) {
    console.error('Error', err.message);
  }
}

async function getCorrectUrl(url) {
  const axiosInstance = axios.create();

  axiosInstance.defaults.maxRedirects = 0; // Set to 0 to prevent automatic redirects
  axiosInstance.interceptors.response.use(
    response => response,
    async (error) => {
      if (error.response && [301, 302, 307].includes(error.response.status)) {
        const redirectUrl = error.response.headers.location;
        try {
          const response = await axiosInstance.get(redirectUrl);
          return response;
        } catch (redirectError) {
          return Promise.reject(redirectError);
        }
      }
      return Promise.reject(error);
    }
  );

  console.log('axios instance gets url:', url);

  try {
    const response = await axiosInstance.get(url);
    console.log(response.headers.redirectUrl);
  } catch (error) {
    console.error(url, 'falhou');
  }
}

(async () => {
  const html = await getHTML(urlSrc);
  const $ = cheerio.load(html);

  const urls = [];

  $('a[href^="/produto/"]').each((index, element) => {
    const originalUrl = $(element).attr('href');
    const fullURL = 'https://www.ambev.com.br' + originalUrl;
    urls.push(fullURL);
  });

  for (const url of urls) {
    await getCorrectUrl(url);
  }
})()
