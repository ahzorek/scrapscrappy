const axios = require('axios')
const cheerio = require('cheerio')
const readline = require('readline')

const productInfo = {}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

async function getHTML(url) {
  try {
    const response = await axios.get(url)
    return response.data
  } catch (error) {
    console.error('Erro ao obter HTML:', error.message)
  }
}

async function processHTML() {
  rl.question('URL QUE VAMOS SCRAPEAR: ', async (userInput) => {
    const url = userInput.trim()

    if (!url) {
      console.error('url invalida.')
      rl.close()
      return
    }

    const html = await getHTML(url)

    if (html) {
      const $ = cheerio.load(html)

      productInfo.nomeProduto = $('.product-title').text().trim()
      productInfo.tamanhoEmbalagem = $('.js-product-nav.product-size.is-active').first().text().trim()
      productInfo.descricaoProduto = $('.product-description div').first().text().trim()

      productInfo.valorIBU = $('.product-ibu-info .properties-value-top').first().text().trim()
      productInfo.teorAlcoolico = $('.product-alcoholic-info .properties-description-top').first().text().trim().split('%')[0]
      productInfo.classificacaoCorpo = $('.product-body-info .properties-value-top').first().text().trim()
      productInfo.temperaturaIdeal = $('.product-ideal-temperature-info .properties-description-top').first().text().trim()

      productInfo.ingredientes = []
      $('.section-product_ingredients h3').each((index, element) => {
        productInfo.ingredientes.push($(element).text().trim())
      })

      productInfo.informacaoAlergenica = $('.coh-wysiwyg p').last().text().trim()

      productInfo.imagemProduto = `https://www.ambev.com.br${$('.product-image img').attr('src')}`

      console.log('Informação scrapeada:', productInfo)

      rl.close()
    }
  })
}

processHTML() 
