import { MongoDB } from "../db/mongo";





const allProperties = [
  "stockCode", "score", "stockPrice", "patrimonioLiquido", "liquidezCorrente", "ROE", "divSobrePatrimonio", "crescimentoCincoAnos", "precoSobreVP", "precoSobreLucro", "dividendos", "PSR", "precoSobreAtivo", "precoSobreCapitalGiro", "precoSobreEBIT", "precoSobreAtivoCirculante", "EVSobreEBIT", "margemEBIT", "margemLiquida", "ROIC", "liquidezDoisMeses", "timestamp"
];



// Resolvers define the technique for fetching the types in the
// schema.  We'll retrieve books from the "books" array above.
export const resolvers = {
  Query: {
    allStockCodes: () => getStockCodes(),
    allProperties: () => allProperties,
    stock: (_root: any, args: any) => getStock(args.id, args.startDate, args.endDate),
    compare: (_root: any, args: any) =>
      [].concat.apply([], args.ids.map((id: string) => getStock(id, args.startDate, args.endDate)))
  }
};

async function getStockCodes(): Promise<string[]> {
  const db = MongoDB.getDBConn();
  const result = await db.listCollections().toArray();
  return result.map(r => r.name);
}


async function getStock(id: string, _startDate?: string, _endDate?: string): Promise<any[]> {
  const db = MongoDB.getDBConn();
  const collection = db.collection(id);

  // if (startDate && endDate)
  //   return db.filter(s => s.stockCode == id && new Date(s.timestamp) >= new Date(startDate) && new Date(s.timestamp) <= new Date(endDate));
  // else if (startDate)
  //   return db.filter(s => s.stockCode == id && new Date(s.timestamp) >= new Date(startDate));
  // else
  return await collection.find({ stockCode: id }).toArray();
}