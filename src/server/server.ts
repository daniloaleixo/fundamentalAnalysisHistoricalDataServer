import { ApolloServer } from 'apollo-server';
import { typeDefs } from "./typeDefs";
import { resolvers } from "./resolvers";
import { MongoDB } from "../db/mongo";
require('dotenv').config();



async function initServer() {

  await MongoDB.init();

  // In the most basic sense, the ApolloServer can be started
  // by passing type definitions (typeDefs) and the resolvers
  // responsible for fetching the data for those types.
  const server: ApolloServer = new ApolloServer({ typeDefs, resolvers });

  // This `listen` method launches a web-server.  Existing apps
  // can utilize middleware options, which we'll discuss later.
  server.listen((process.env.PORT || 4000)).then((a: any) => {
    console.log(`🚀  Server ready at ${a.url}`);
  });

}

initServer();