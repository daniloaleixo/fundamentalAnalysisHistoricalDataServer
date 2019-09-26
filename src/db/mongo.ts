import { Db, MongoClient } from "mongodb";

export enum DATABASE {
  HISTORICAL = "stocks",
  RECENT = "recentStocks"
}

export class MongoDB {
  private static mongo: MongoClient;

  public static async init() {
    console.log("Connecting to mongo client: ", process.env.MAIN_DB_URI);
    this.mongo = await this.getConnection(process.env.MAIN_DB_URI as string);
    console.log("MongoDB initialized");
  }

  public static getDBConn(databaseName: DATABASE): Db { 
    return this.mongo.db(databaseName);
  }


  private static getConnection(uri: string): Promise<MongoClient> {
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

}