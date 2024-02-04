const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs')


const productsInfoArray = []
const failedUrls = []

async function getHTML(url, retryCount = 2, delay = 500) {
  console.log('iniciando tentativa em:::', url)
  try {
    await new Promise(resolve => setTimeout(resolve, delay))
    const response = await axios.get(url)
    console.log('dados retornaram ok')
    return response.data
  } catch (err) {
    if (err.response && retryCount > 0) {
      console.error(`Erro ${err.response.status} na URL ${url}. vamos de novo (${retryCount} tentativas restantes)...`)
      return getHTML(url, retryCount - 1, delay)
    } else {
      console.error('Erro', err.message, 'na URL:', url)
      failedUrls.push(url)
    }
  }
}

function saveAsJSON(successArray, failedArray) {
  const jsonDataSuccess = JSON.stringify(successArray, null, 2)
  const jsonDataFailed = JSON.stringify(failedArray, null, 2)

  fs.writeFileSync('cervejas.json', jsonDataSuccess)
  fs.writeFileSync('failed.json', jsonDataFailed)

  console.log('jéssons estão salvos.')
}

async function processHTML(urls) {
  for (const url of urls) {
    const html = await getHTML(url)

    if (html) {
      const $ = cheerio.load(html)

      const productInfo = {
        nomeProduto: $('h1.coh-heading').text().trim(),
        tamanhoEmbalagem: $('.js-product-nav.product-size.is-active').first().text().trim(),
        descricaoProduto: $('.product-description div').first().text().trim(),
        valorIBU: $('.product-ibu-info .properties-value-top').first().text().trim(),
        teorAlcoolico: $('.product-alcoholic-info .properties-description-top').first().text().trim().split('%')[0],
        classificacaoCorpo: $('.product-body-info .properties-value-top').first().text().trim(),
        temperaturaIdeal: $('.product-ideal-temperature-info .properties-description-top').first().text().trim(),
        ingredientes: [],
        informacaoAlergenica: $('.coh-wysiwyg span').last().text().trim(),
        imagemProduto: `https://www.ambev.com.br${$('.product-image img').attr('src')}`
      }


      $('.section-product_ingredients h3').each((index, element) => {
        productInfo.ingredientes.push($(element).text().trim())
      })

      const nutrientInfo = []

      $('.nutrient-content-item').each((index, element) => {
        const nutrientItem = {
          nutrientName: $(element).find('.properties-subtitle-bottom').text().trim(),
          nutrientValue: $(element).find('.properties-description-bottom').text().trim(),
        }
        nutrientInfo.push(nutrientItem);
      })

      productInfo.informacoesNutricionais = nutrientInfo

      const harmonizationInfo = []

      $('.term-list-item').each((index, element) => {
        const harmonizationItem = $(element).find('.properties-subtitle-bottom').text().trim()
        harmonizationInfo.push(harmonizationItem);
      })

      productInfo.harmonizacoes = harmonizationInfo

      productsInfoArray.push(productInfo)
    }
  }

  console.log('Informações scrapeadas:', productsInfoArray)

  saveAsJSON(productsInfoArray, failedUrls)
}

const urls = [
  'https://www.ambev.com.br/marcas/cervejas/adriatica',
  'https://www.ambev.com.br/marcas/cervejas/andes',
  'https://www.ambev.com.br/marcas/cervejas/antarctica',
  'https://www.ambev.com.br/marcas/cervejas/becks',
  'https://www.ambev.com.br/marcas/cervejas/berrio-do-piaui',
  'https://www.ambev.com.br/marcas/cervejas/bohemia-puro-malte',
  'https://www.ambev.com.br/marcas/cervejas/brahma-chopp',
  'https://www.ambev.com.br/marcas/cervejas/budweiser',
  'https://www.ambev.com.br/marcas/cervejas/caracu',
  'https://www.ambev.com.br/marcas/cervejas/colorado-appia',
  'https://www.ambev.com.br/marcas/cervejas/corona',
  'https://www.ambev.com.br/marcas/cervejas/esmera-do-goias',
  'https://www.ambev.com.br/marcas/cervejas/franziskaner-hell',
  'https://www.ambev.com.br/marcas/cervejas/goose-island-ipa',
  'https://www.ambev.com.br/marcas/cervejas/hoegaarden-wit-blanche',
  'https://www.ambev.com.br/marcas/cervejas/kona-big-wave',
  'https://www.ambev.com.br/marcas/cervejas/leffe-blonde',
  'https://www.ambev.com.br/marcas/cervejas/legitima',
  'https://www.ambev.com.br/marcas/cervejas/magnifica',
  'https://www.ambev.com.br/marcas/cervejas/modelo',
  'https://www.ambev.com.br/marcas/cervejas/nossa-de-pernambuco',
  'https://www.ambev.com.br/marcas/cervejas/antarctica-original',
  'https://www.ambev.com.br/marcas/cervejas/patagonia-bohemian-pilsener',
  'https://www.ambev.com.br/marcas/cervejas/polar',
  'https://www.ambev.com.br/marcas/cervejas/polar-puro-malte-gaucho',
  'https://www.ambev.com.br/marcas/cervejas/serramalte',
  'https://www.ambev.com.br/marcas/cervejas/serrana',
  'https://www.ambev.com.br/marcas/cervejas/michelob-ultra',
  'https://www.ambev.com.br/marcas/cervejas/spaten',
  'https://www.ambev.com.br/marcas/cervejas/stella-artois',
  'https://www.ambev.com.br/marcas/cervejas/tres-fidalgas',
  'https://www.ambev.com.br/marcas/cervejas/wals-42',
  'https://www.ambev.com.br/marcas/cervejas/abiuda-de-sergipe'
]

processHTML(urls)