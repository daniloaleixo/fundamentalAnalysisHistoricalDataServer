import { Db, MongoClient } from "mongodb";

export class MongoDB {
  private static dbConn: Db;

  public static async init() {

    const databaseName = "stocks";

    const mongoClient: MongoClient = await this.getConnection(process.env.MAIN_DB_URI as string);
    this.dbConn = mongoClient.db(databaseName);
    console.log("MongoDB initialized");
  }

  public static getDBConn(): Db { return this.dbConn; }


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