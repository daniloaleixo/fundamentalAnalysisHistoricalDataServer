import { Db, MongoClient } from "mongodb";

export class MongoDB {
  private static dbConn: Db;

  public static async init() {

    const databaseName = "stocks";

    const mongoClient: MongoClient = await this.getConnection();
    this.dbConn = mongoClient.db(databaseName);
    console.log("MongoDB initialized");
  }

  public static getDBConn(): Db { return this.dbConn; }


  private static async getConnection(): Promise<MongoClient> {
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

}