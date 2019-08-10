import { ApolloServer, gql } from 'apollo-server';

// This is a (sample) collection of books we'll be able to query
// the GraphQL server for.  A more complete example might fetch
// from an existing data source like a REST API or database.
const stocks = [
  {
    stockCode: "PETR4",
    score: 8,
    stockPrice: 26.09,
    patrimonioLiquido: 282659000000.00,
    liquidezCorrente: 1.15,
    ROE: 8.08,
    divSobrePatrimonio: 1.46,
    crescimentoCincoAnos: 0.56,
    precoSobreVP: 1.20,
    precoSobreLucro: 14.89,
    dividendos: 3.72,
    PSR: 0.958,
    precoSobreAtivo: 0.359,
    precoSobreCapitalGiro: 19.94,
    precoSobreEBIT: 3.47,
    precoSobreAtivoCirculante: -0.64,
    EVSobreEBIT: 7.26,
    margemEBIT: 27.64,
    margemLiquida: 6.70,
    ROIC: 11.09,
    liquidezDoisMeses: 1639450000.00,
    timestamp: "2019-02-01T02:00:00.000Z",
  },
  {
    stockCode: "PETR4",
    score: 8,
    stockPrice: 27.09,
    patrimonioLiquido: 282659000000.00,
    liquidezCorrente: 1.15,
    ROE: 8.08,
    divSobrePatrimonio: 1.46,
    crescimentoCincoAnos: 0.56,
    precoSobreVP: 1.20,
    precoSobreLucro: 14.89,
    dividendos: 3.72,
    PSR: 0.958,
    precoSobreAtivo: 0.359,
    precoSobreCapitalGiro: 19.94,
    precoSobreEBIT: 3.47,
    precoSobreAtivoCirculante: -0.64,
    EVSobreEBIT: 7.26,
    margemEBIT: 27.64,
    margemLiquida: 6.70,
    ROIC: 11.09,
    liquidezDoisMeses: 1639450000.00,
    timestamp: "2019-08-10T19:25:34.739Z",
  },
  {
    stockCode: "PETR4",
    score: 8,
    stockPrice: 28.09,
    patrimonioLiquido: 282659000000.00,
    liquidezCorrente: 1.15,
    ROE: 8.08,
    divSobrePatrimonio: 1.46,
    crescimentoCincoAnos: 0.56,
    precoSobreVP: 1.20,
    precoSobreLucro: 14.89,
    dividendos: 3.72,
    PSR: 0.958,
    precoSobreAtivo: 0.359,
    precoSobreCapitalGiro: 19.94,
    precoSobreEBIT: 3.47,
    precoSobreAtivoCirculante: -0.64,
    EVSobreEBIT: 7.26,
    margemEBIT: 27.64,
    margemLiquida: 6.70,
    ROIC: 11.09,
    liquidezDoisMeses: 1639450000.00,
    timestamp: "2019-06-01T03:00:00.000Z",
  },
  {
    stockCode: "ITSA4",
    score: 8,
    stockPrice: 28.09,
    patrimonioLiquido: 282659000000.00,
    liquidezCorrente: 1.15,
    ROE: 8.08,
    divSobrePatrimonio: 1.46,
    crescimentoCincoAnos: 0.56,
    precoSobreVP: 1.20,
    precoSobreLucro: 14.89,
    dividendos: 3.72,
    PSR: 0.958,
    precoSobreAtivo: 0.359,
    precoSobreCapitalGiro: 19.94,
    precoSobreEBIT: 3.47,
    precoSobreAtivoCirculante: -0.64,
    EVSobreEBIT: 7.26,
    margemEBIT: 27.64,
    margemLiquida: 6.70,
    ROIC: 11.09,
    liquidezDoisMeses: 1639450000.00,
    timestamp: "2019-06-01T03:00:00.000Z",
  }
];

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
    allStockCodes: () => stocks.map(s => s.stockCode),
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
    return stocks.filter(s => s.stockCode == id && new Date(s.timestamp) >= new Date(startDate) && new Date(s.timestamp) <= new Date(endDate));
  else if (startDate)
    return stocks.filter(s => s.stockCode == id && new Date(s.timestamp) >= new Date(startDate));
  else
    return stocks.filter(s => s.stockCode == id);
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