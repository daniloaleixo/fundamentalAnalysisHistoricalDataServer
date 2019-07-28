import * as firebase from "firebase-admin";
import { Db, MongoClient } from "mongodb";
require('dotenv').config();



const comparadores = {
  patrLiq: { value: 2000000000, checked: 1 },
  liqCorr: { value: 1.5, checked: 1 },
  roe: { value: 20, checked: 1 },
  divPat: { value: 50, checked: 1 },
  cresc: { value: 5, checked: 1 },
  pvp: { value: 1.5, checked: 1 },
  pl: { value: 15, checked: 1 },
  dy: { value: 2.5, checked: 1 },
  plxpvp: { value: 22.5, checked: 1 },
}


// 
//  Function to save stocks inside mongo 
// 


// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

interface IStock {
  stockCode: string,
  score: number,
  stockPrice: number,
  patrimonioLiquido: number,
  liquidezCorrente: number,
  ROE: number,
  divSobrePatrimonio: number,
  crescimentoCincoAnos: number,
  precoSobreVP: number,
  precoSobreLucro: number,
  dividendos: number,
  PSR: number,
  precoSobreAtivo: number,
  precoSobreCapitalGiro: number,
  precoSobreEBIT: number,
  precoSobreAtivoCirculante: number,
  EVSobreEBIT: number,
  margemEBIT: number,
  margemLiquida: number,
  ROIC: number,
  liquidezDoisMeses: number,
  timestamp: Date,
}



export const saveStockHistory = () => {
  // export const saveStockHistory = functions.database.ref('/stocks')
  //   .onWrite((change: Change<DataSnapshot>, context) => {


  return saveAllStocks()
    .then((res) => {
      console.log(res);
      // console.log('Payload:', change, "Context", context);

    })
    .catch(err => {
      console.log(err);
    });

};

async function saveAllStocks(): Promise<void> {

  // Init firebase
  firebase.initializeApp({
    credential: firebase.credential.cert(
      <any>{
        "type": "service_account",
        "project_id": process.env.project_id,
        "private_key_id": process.env.private_key_id,
        "client_email": process.env.client_email,
        "client_id": process.env.client_id,
        "auth_uri": process.env.auth_uri,
        "token_uri": process.env.token_uri,
        "auth_provider_x509_cert_url": process.env.auth_provider_x509_cert_url,
        "client_x509_cert_url": process.env.client_x509_cert_url,
        "private_key": process.env.private_key,
      }
    ),
    databaseURL: process.env.FIREBASE_URL
  });

  let allStocks: IStock[] = await getFirebasePayload(firebase.database());
  console.log("Now I have all the stocks from firebase", Object.keys(allStocks).length);
  allStocks = calculateScores(allStocks);

  // console.log(allStocks);
  console.log("Agora tenho todos os stocks, tamanho: ", allStocks.length);

  const databaseName = "stocks";

  const mongoClient: MongoClient = await getConnection();
  const dbConn: Db = mongoClient.db(databaseName);

  try {
    let inserted = 0;
    try {
      for (let index = 0; index < allStocks.length; index++) {
        const stock = allStocks[index];
        const collection = dbConn.collection(stock.stockCode);
        const results = await collection.insertOne(stock);
        console.log(`Saved stock ${index + 1} of ${allStocks.length}`);
        inserted = results.insertedCount ? inserted + 1 : inserted;
      }
    } catch (e) {
      console.log(e);
    }
    console.log("Inserted a total of ", inserted, " stoks");
    await closeConnection(mongoClient);
    process.exit(0);
  } catch (e) {
    console.log("ERRO", e);
    process.exit(-1);
  }

}

async function getFirebasePayload(database: any): Promise<IStock[]> {
  return new Promise<IStock[]>((resolve: any) => {
    database.ref().child('stocks').once('value').then((snapshot: any) => {

      console.log("Consegui as infos do firebase ", snapshot.val() != undefined);
      const arrayStocksHistory: any[] = [];

      // console.log(snapshot.val())

      Object.keys(snapshot.val()).forEach(function (key) {
        // console.log(snapshot.val()[key])
        var object = JSON.parse(snapshot.val()[key]);
        arrayStocksHistory.push(object)
        // console.log(object);
      })

      // Sort by date, the first one will be the newest
      arrayStocksHistory.sort((a, b) => {
        const date1 = new Date(a.date);
        const date2 = new Date(b.date);
        return date2 > date1 ? 1 : -1;
      })

      // console.log(arrayStocksHistory);
      const arrayObjects = [];
      Object.keys(arrayStocksHistory[0]).forEach(function (key) {
        arrayObjects.push(arrayStocksHistory[0][key])
      });


      resolve(arrayStocksHistory[0]);
    });
  });
}


async function getConnection(): Promise<MongoClient> {
  return new Promise(async (resolve, reject) => {
    try {
      const url = 'mongodb+srv://' + process.env.USER + ':' + process.env.PASSWORD + '@' + process.env.HOST;
      const client = new MongoClient(url, { useNewUrlParser: true });
      await client.connect();
      resolve(client);
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
}

async function closeConnection(mongoClient: MongoClient): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    mongoClient.close((err) => {
      if (err) reject(err);
      else resolve();
    })
  });
}

const calculateScores = function (stockHash: any): IStock[] {
  console.log('calculando socres');
  let dividePor = 0;
  Object.keys(comparadores).forEach(function (elem: any) {
    if ((comparadores as any)[elem].checked) dividePor += 1;
  })
  console.log('dividePor', dividePor);

  const stocks: IStock[] = [];

  const stockArray: any[] = Object.keys(stockHash).map(key => stockHash[key]);

  for (var i = 0; i < stockArray.length; i++) {
    if (typeof (stockArray[i]) == "object") {
      Object.keys(stockArray[i]).forEach(function (stock) {
        var nota = 0.0;

        const patrLiq: number = parseFloat(stockArray[i][stock]["Pat.Liq"].replace(/\./g, '').replace(/\,/g, '.'));
        if (comparadores.patrLiq.checked && patrLiq > comparadores.patrLiq.value)
          nota = nota + 1
        const liqCorr: number = parseFloat(stockArray[i][stock]["Liq.Corr."].replace(/\./g, '').replace(/,/g, '.'));
        if (comparadores.liqCorr.checked && liqCorr > comparadores.liqCorr.value)
          nota = nota + 1
        const roe: number = parseFloat(stockArray[i][stock]["ROE"].replace(/\./g, '').replace(/\,/g, '.').replace(/%/g, ''));
        if (comparadores.roe.checked && roe > comparadores.roe.value)
          nota = nota + 1
        const divPat: number = parseFloat(stockArray[i][stock]["Div.Brut/Pat."].replace(/\./g, '').replace(/\,/g, '.').replace(/%/g, ''));
        if (comparadores.divPat.checked && divPat * 100 < comparadores.divPat.value && divPat > 0)
          nota = nota + 1
        const cresc: number = parseFloat(stockArray[i][stock]["Cresc.5a"].replace(/\./g, '').replace(/\,/g, '.').replace(/%/g, ''));
        if (comparadores.cresc.checked && cresc > comparadores.cresc.value)
          nota = nota + 1
        const pvp: number = parseFloat(stockArray[i][stock]["P/VP"].replace(/\./g, '').replace(/\,/g, '.').replace(/%/g, ''));
        if (comparadores.pvp.checked && pvp < comparadores.pvp.value && pvp > 0)
          nota = nota + 1
        const pl: number = parseFloat(stockArray[i][stock]["P/L"].replace(/\./g, '').replace(/\,/g, '.').replace(/%/g, ''));
        if (comparadores.pl.checked && pl < comparadores.pl.value && pl > 0)
          nota = nota + 1
        const dy: number = parseFloat(stockArray[i][stock]["DY"].replace(/\./g, '').replace(/\,/g, '.').replace(/%/g, ''));
        if (comparadores.dy.checked && dy > comparadores.dy.value)
          nota = nota + 1
        if (comparadores.plxpvp.checked && pl * pvp < comparadores.plxpvp.value)
          nota = nota + 1;

        const newStock: IStock = {
          patrimonioLiquido: patrLiq,
          liquidezCorrente: liqCorr,
          ROE: roe,
          divSobrePatrimonio: divPat,
          crescimentoCincoAnos: cresc,
          precoSobreVP: pvp,
          precoSobreLucro: pl,
          dividendos: dy,
          stockCode: stock.toString(),
          score: (nota / dividePor * 10.0),
          stockPrice: turnIntoFloat(stockArray[i][stock].cotacao),
          PSR: turnIntoFloat(stockArray[i][stock].PSR),
          precoSobreAtivo: turnIntoFloat(stockArray[i][stock]['P/Ativo']),
          precoSobreCapitalGiro: turnIntoFloat(stockArray[i][stock]['P/Cap.Giro']),
          precoSobreEBIT: turnIntoFloat(stockArray[i][stock]['P/EBIT']),
          precoSobreAtivoCirculante: turnIntoFloat(stockArray[i][stock]['P/Ativ.Circ.Liq.']),
          EVSobreEBIT: turnIntoFloat(stockArray[i][stock]['EV/EBIT']),
          margemEBIT: turnIntoFloat(stockArray[i][stock].EBITDA),
          margemLiquida: turnIntoFloat(stockArray[i][stock]['Mrg.Liq.']),
          ROIC: turnIntoFloat(stockArray[i][stock].ROIC),
          liquidezDoisMeses: turnIntoFloat(stockArray[i][stock]['Liq.2m.']),
          timestamp: new Date()
        };
        stocks.push(newStock);

        stockArray[i][stock]["nota"] = (nota / dividePor * 10.0).toFixed(2);
        stockArray[i][stock]["stock"] = stock;
        // console.log([stock, stockArray[i][stock]["nota"], patrLiq, liqCorr, roe, divPat, cresc, pvp, pl, dy])

      });
    }
  }

  console.log("Todas as notas calculadas");

  return stocks;
}

function turnIntoFloat(num: string): number {
  return parseFloat(num.replace(/\./g, '').replace(/\,/g, '.').replace(/%/g, ''));
}

saveStockHistory();