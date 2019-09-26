import { MongoDB, DATABASE } from "../db/mongo";
import { IStock } from "../../shared/interfaces";





const allProperties = [
  "stockCode", "score", "stockPrice", "patrimonioLiquido", "liquidezCorrente", "ROE", "divSobrePatrimonio", "crescimentoCincoAnos", "precoSobreVP", "precoSobreLucro", "dividendos", "PSR", "precoSobreAtivo", "precoSobreCapitalGiro", "precoSobreEBIT", "precoSobreAtivoCirculante", "EVSobreEBIT", "margemEBIT", "margemLiquida", "ROIC", "liquidezDoisMeses", "timestamp"
];



// Resolvers define the technique for fetching the types in the
// schema.  We'll retrieve books from the "books" array above.
export const resolvers = {
  Query: {
    recentStocks: () => getRecentStocks(),
    allStockCodes: () => getStockCodes(),
    allProperties: () => allProperties,
    stock: (_root: any, args: any) => getStock(args.id, args.startDate, args.endDate),
    compare: (_root: any, args: any) => compare(args.ids, args.startDate, args.endDate)
  }
};


async function getRecentStocks(): Promise<IStock[]> {
  const db = MongoDB.getDBConn(DATABASE.RECENT);
  const collection = db.collection("stocks");
  return await collection.find({}).toArray();
}


async function getStockCodes(): Promise<string[]> {
  const db = MongoDB.getDBConn(DATABASE.HISTORICAL);
  const result = await db.listCollections().toArray();
  return result.map(r => r.name);
}


async function getStock(id: string, startDate?: string, endDate?: string): Promise<IStock[]> {
  const db = MongoDB.getDBConn(DATABASE.HISTORICAL);
  const collection = db.collection(id);

  if (startDate && endDate)
    return await collection.find<IStock>({ timestamp: { "$gte": new Date(startDate), "$lte": new Date(endDate) } }).toArray();
  else if (startDate)
    return await collection.find<IStock>({ timestamp: { "$gte": new Date(startDate) } }).toArray();
  else
    return await collection.find<IStock>().toArray();
}

async function compare(ids: string[], startDate?: string, endDate?: string): Promise<IStock[]> {
  const result: IStock[] = [];
  const allStocks: IStock[][] = await Promise.all(ids.map((id: string) => getStock(id, startDate, endDate)));

  allStocks.forEach(stockArray => stockArray.forEach((s: IStock) => result.push(s)));
  return result;

}