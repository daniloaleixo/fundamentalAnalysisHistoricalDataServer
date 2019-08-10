import { gql } from 'apollo-server';


// Type definitions define the "shape" of your data and specify
// which ways the data can be fetched from the GraphQL server.
export const typeDefs = gql`
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