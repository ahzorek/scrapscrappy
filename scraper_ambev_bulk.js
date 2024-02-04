const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs')


const productsInfoArray = []
const failedUrls = []

async function getHTML(url, retryCount = 2, delay = 50) {
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
        nomeCerveja: $('h1.coh-heading').text().trim(),
        descriCerveja: $('.product-description div').first().text().trim(),
        valorIBU: $('.product-ibu-info .properties-value-top').first().text().trim(),
        teorAlcoolico: $('.product-alcoholic-info .properties-description-top').first().text().trim().split('%')[0],
        corpo: $('.product-body-info .properties-value-top').first().text().trim(),
        tempIdeal: $('.product-ideal-temperature-info .properties-description-top').first().text().trim(),
        ingredientes: [],
        informacaoAlergen: $('.coh-wysiwyg span').last().text().trim(),
        tipoCerveja: $('.product-style-info h3.properties-description-top').first().text().trim()
      }

      productInfo.imagensProduto = []
      $('.product-image img').each((index, element) => {
        const imageUrl = $(element).attr('src');
        productInfo.imagensProduto.push(`https://www.ambev.com.br${imageUrl}`)
      })

      const tamanhosEmbalagemSet = new Set()

      $('.product-size').each((index, element) => {
        tamanhosEmbalagemSet.add($(element).first().text().trim())
      });

      productInfo.tamanhosEmbalagem = [...tamanhosEmbalagemSet]

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
      $('.section-product_good_with h3').each((index, element) => {
        harmonizationInfo.push($(element).text().trim())
      })

      productInfo.harmonizacoes = harmonizationInfo

      //salva a cervej no arrayzao
      productsInfoArray.push(productInfo)
    }
  }

  console.log('Informações scrapeadas:', productsInfoArray.length, 'cervejas puxadas.')

  saveAsJSON(productsInfoArray, failedUrls)
}

const urls = require('./urls.js')

processHTML(urls)