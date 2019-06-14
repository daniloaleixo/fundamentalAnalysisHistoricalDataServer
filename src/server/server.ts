import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';

import express from "express";
import { buildSchema } from 'graphql';


const app: express.Express = express();

app.get("/", (_, res) => {
  res.send("Hello ts-node!");
});






// GraphQL schema
var schema = buildSchema(`
    type Query {
        message: String
    }
`);
// Root resolver
var root = {
    message: () => 'Hello World!'
};

// app.use('/graphql', express_graphql({
//     schema: schema,
//     rootValue: root,
//     graphiql: true
// }));

app.use('/graphql', graphqlExpress((req: any) => ({
  schema,
  rootValue: root,
  // context: {user: req.user && db.users.get(req.user.sub)}
  graphiql: true
})));
// app.use('/graphiql', graphiqlExpress({endpointURL: '/graphql'}));

export default app;