import { ApolloServer, gql } from 'apollo-server';
import db from "../db/stocks";

const allProperties = [
  "stockCode", "score", "stockPrice", "patrimonioLiquido", "liquidezCorrente", "ROE", "divSobrePatrimonio", "crescimentoCincoAnos", "precoSobreVP", "precoSobreLucro", "dividendos", "PSR", "precoSobreAtivo", "precoSobreCapitalGiro", "precoSobreEBIT", "precoSobreAtivoCirculante", "EVSobreEBIT", "margemEBIT", "margemLiquida", "ROIC", "liquidezDoisMeses", "timestamp"
];

// Type definitions define the "shape" of your data and specify
// which ways the data can be fetched from the GraphQL server.
const typeDefs = gql`
  # Comments in GraphQL are defined with the hash (#) symbol.

  # This "Book" type can be used in other type declarations.
  type Stock {
    stockCode: ID
    score: Float
    stockPrice: Float
    patrimonioLiquido: Int
    liquidezCorrente: Float
    ROE: Float
    divSobrePatrimonio: Float
    crescimentoCincoAnos: Float
    precoSobreVP: Float
    precoSobreLucro: Float
    dividendos: Float
    PSR: Float
    precoSobreAtivo: Float
    precoSobreCapitalGiro: Float
    precoSobreEBIT: Float
    precoSobreAtivoCirculante: Float
    EVSobreEBIT: Float
    margemEBIT: Float
    margemLiquida: Float
    ROIC: Float
    liquidezDoisMeses: Float
    timestamp: String
  }

  # The "Query" type is the root of all GraphQL queries.
  # (A "Mutation" type will be covered later on.)
  type Query {
    allStockCodes: [String]
    allProperties: [String]
    stock(id: ID!, startDate: String, endDate: String): [Stock]
    compare(ids: [ID!], startDate: String, endDate: String): [Stock]
  }
`;

// Resolvers define the technique for fetching the types in the
// schema.  We'll retrieve books from the "books" array above.
const resolvers = {
  Query: {
    allStockCodes: () => db.map(s => s.stockCode),
    allProperties: () => allProperties,
    stock: (_root: any, args: any) => getStock(args.id, args.startDate, args.endDate),
    compare: (_root: any, args: any) => {
      const result = [].concat.apply([], args.ids.map((id: string) => getStock(id, args.startDate, args.endDate)));
      console.log(result);
      return result;
    },
  }
};

function getStock(id: string, startDate?: string, endDate?: string): any[] {
  if (startDate && endDate)
    return db.filter(s => s.stockCode == id && new Date(s.timestamp) >= new Date(startDate) && new Date(s.timestamp) <= new Date(endDate));
  else if (startDate)
    return db.filter(s => s.stockCode == id && new Date(s.timestamp) >= new Date(startDate));
  else
    return db.filter(s => s.stockCode == id);
}

// In the most basic sense, the ApolloServer can be started
// by passing type definitions (typeDefs) and the resolvers
// responsible for fetching the data for those types.
const server = new ApolloServer({ typeDefs, resolvers });

// This `listen` method launches a web-server.  Existing apps
// can utilize middleware options, which we'll discuss later.
server.listen().then((a: any) => {
  console.log(`🚀  Server ready at ${a.url}`);
});