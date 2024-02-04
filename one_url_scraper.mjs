import axios from 'axios'

const url = 'https://www.ambev.com.br/produto/patagonia-bohemian-pilsener';

(async () => {
  console.log('iniciando função')
  try {
    const res = await axios.get(url,
      {
        headers: {
          'User-Agent': 'Mozilla / 5.0(Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari / 537.3'
        }
      })
    console.log(res.status)
  }
  catch (err) {
    console.log('deu erro')
  }
})()