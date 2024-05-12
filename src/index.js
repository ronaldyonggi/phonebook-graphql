const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { connectToDatabase } = require('./utils/db');
const { PORT } = require('./utils/config');
const { typeDefs } = require('./graphql/schema')
const { resolvers } = require('./graphql/resolvers')

connectToDatabase();

const server = new ApolloServer({
  typeDefs,
  resolvers
});

startStandaloneServer(server, {
  listen: { port: PORT },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
