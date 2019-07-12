import * as lodash from "lodash";
import { MongoClient, Db } from "mongodb";
import * as firebase from "firebase-admin";
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
  stockCode: String,
  score: Number,
  stockPrice: Number,
  patrimonioLiquido: String,
  liquidezCorrente: String,
  ROE: Number,
  divSobrePatrimonio: Number,
  crescimentoCincoAnos: Number,
  precoSobreVP: Number,
  precoSobreLucro: Number,
  dividendos: Number,
  PSR: Number,
  precoSobreAtivo: Number,
  precoSobreCapitalGiro: Number,
  precoSobreEBIT: Number,
  precoSobreAtivoCirculante: Number,
  EVSobreEBIT: Number,
  margemEBIT: Number,
  margemLiquida: Number,
  ROIC: Number,
  liquidezDoisMeses: Number,
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
  allStocks = calculateScores(allStocks);

  // console.log(allStocks);
  console.log("Agora tenho todos os stocks, tamanho: ", allStocks.length);

  const databaseName = "stocks";
  const tableName = "historicalData";

  const dbConn: Db = await getConnection(databaseName);
  const collection = dbConn.collection(tableName);
  const bulkWriteReqArray: any[] = lodash.map(allStocks, (item: IStock) => {
    return {
      insertOne: {
        document: {
          ...item,
          timestamp: new Date()
        }
      }
    }
  });

  try {
    const results = await collection.bulkWrite(bulkWriteReqArray);
    console.log('Modified mongodb doc count : ', results.modifiedCount);
    console.log('Inserted mongodb doc count : ', results.upsertedCount);
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


async function getConnection(database: string): Promise<Db> {
  return new Promise(async (resolve, reject) => {
    try {
      const url = 'mongodb+srv://' + process.env.USER + ':' + process.env.PASSWORD + '@' + process.env.HOST;
      const client = new MongoClient(url, { useNewUrlParser: true });
      await client.connect();
      resolve(client.db(database));
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
}

const calculateScores = function (stockArray: any[]): IStock[] {
  console.log('calculando socres');
  let dividePor = 0;
  Object.keys(comparadores).forEach(function (elem: any) {
    if ((comparadores as any)[elem].checked) dividePor += 1;
  })
  console.log('dividePor', dividePor);

  for (var i = 0; i < stockArray.length; i++) {
    if (typeof (stockArray[i]) == "object") {
      Object.keys(stockArray[i]).forEach(function (stock) {
        var nota = 0.0;

        var patrLiq = parseFloat(stockArray[i][stock]["Pat.Liq"].replace(/\./g, '').replace(/\,/g, '.'));
        if (comparadores.patrLiq.checked && patrLiq > comparadores.patrLiq.value)
          nota = nota + 1
        var liqCorr = parseFloat(stockArray[i][stock]["Liq.Corr."].replace(/\./g, '').replace(/,/g, '.'));
        if (comparadores.liqCorr.checked && liqCorr > comparadores.liqCorr.value)
          nota = nota + 1
        var roe = parseFloat(stockArray[i][stock]["ROE"].replace(/\./g, '').replace(/\,/g, '.').replace(/%/g, ''));
        if (comparadores.roe.checked && roe > comparadores.roe.value)
          nota = nota + 1
        var divPat = parseFloat(stockArray[i][stock]["Div.Brut/Pat."].replace(/\./g, '').replace(/\,/g, '.').replace(/%/g, ''));
        if (comparadores.divPat.checked && divPat * 100 < comparadores.divPat.value && divPat > 0)
          nota = nota + 1
        var cresc = parseFloat(stockArray[i][stock]["Cresc.5a"].replace(/\./g, '').replace(/\,/g, '.').replace(/%/g, ''));
        if (comparadores.cresc.checked && cresc > comparadores.cresc.value)
          nota = nota + 1
        var pvp = parseFloat(stockArray[i][stock]["P/VP"].replace(/\./g, '').replace(/\,/g, '.').replace(/%/g, ''));
        if (comparadores.pvp.checked && pvp < comparadores.pvp.value && pvp > 0)
          nota = nota + 1
        var pl = parseFloat(stockArray[i][stock]["P/L"].replace(/\./g, '').replace(/\,/g, '.').replace(/%/g, ''));
        if (comparadores.pl.checked && pl < comparadores.pl.value && pl > 0)
          nota = nota + 1
        var dy = parseFloat(stockArray[i][stock]["DY"].replace(/\./g, '').replace(/\,/g, '.').replace(/%/g, ''));
        if (comparadores.dy.checked && dy > comparadores.dy.value)
          nota = nota + 1
        if (comparadores.plxpvp.checked && pl * pvp < comparadores.plxpvp.value)
          nota = nota + 1;

        stockArray[i][stock]["nota"] = (nota / dividePor * 10.0).toFixed(2);

        // console.log([stock, stockArray[i][stock]["nota"], patrLiq, liqCorr, roe, divPat, cresc, pvp, pl, dy])

      });
    }
  }

  return stockArray;
}


saveStockHistory();