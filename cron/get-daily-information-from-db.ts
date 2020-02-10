import { Db, MongoClient } from "mongodb";
import { IStock } from "../shared/interfaces";
import * as sgMail from '@sendgrid/mail';
require('dotenv').config();



// 
//  Function to save historical fundamental data about stocks inside mongo once a week
// 


sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

export const saveStockHistory = () => {
  return saveAllStocks()
    .then((res) => {
      console.log(res);
      const msg = {
        to: process.env.EMAIL_TO,
        from: "danilo_aleixo@hotmail.com",
        subject: 'O cron de análise histórica rodou certinho',
        text: 'Deu tudo certo',
      };
      sgMail.send(msg);
    })
    .catch(err => {
      console.log(err);
      const msg = {
        to: process.env.EMAIL_TO,
        from: "danilo_aleixo@hotmail.com",
        subject: 'ERRO: O cron de análise histórica deu erro',
        text: 'Deu merda em \n\n' + JSON.stringify(err),
      };
      sgMail.send(msg);
    });
};

async function saveAllStocks(): Promise<void> {

  // Get payload from target mongoDB
  const sourceDatabaseName = process.env.SOURCE_DB;
  const sourceMongoClient: MongoClient = await getConnection(process.env.SOURCE_URI as string);
  const sourceDBConn: Db = sourceMongoClient.db(sourceDatabaseName);
  const sourceCollection = sourceDBConn.collection(process.env.SOURCE_COLLECTION as string);
  const allStocks: IStock[] = await sourceCollection.find({}).toArray();
  console.log("Agora tenho todos os stocks, tamanho: ", allStocks.length);


  // Save the payload from the targetDB
  const databaseName = process.env.TARGET_DB;
  const mongoClient: MongoClient = await getConnection(process.env.TARGET_URI as string);
  const dbConn: Db = mongoClient.db(databaseName);

  try {
    let inserted = 0;
    try {
      for (let index = 0; index < allStocks.length; index++) {
        const stock = allStocks[index];
        // Save each stock in a collection
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



async function getConnection(uri: string): Promise<MongoClient> {
  return new Promise(async (resolve, reject) => {
    try {
      const url = uri;
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




// Run once a week
if ((new Date()).getDay() == 0) {
  saveStockHistory();
} else
  process.exit(0);
