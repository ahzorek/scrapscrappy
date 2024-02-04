const cheerio = require('cheerio')
const axios = require('axios')

const urlSrc = 'https://www.ambev.com.br/marcas/cervejas'

async function getHTML(url) {
  try {
    const response = await axios.get(url)
    return response.data
  } catch (err) {
    console.error('Error', err.message)
  }
}

(async () => {
  const html = await getHTML(urlSrc)

  const $ = cheerio.load(html)

  const urls = []

  $('a[href^="/produto/"]').each((index, element) => {
    const originalUrl = $(element).attr('href')
    const correctProductURL = originalUrl.replace('/produto/', '/marcas/cervejas/')
    const fullURL = 'https://www.ambev.com.br' + correctProductURL
    urls.push(fullURL)
  })

  console.log('urls:', urls)
})() 
