const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { connectToDatabase } = require('./utils/db');
const { PORT } = require('./utils/config');
const { typeDefs } = require('./graphql/schema');
const { resolvers } = require('./graphql/resolvers');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./utils/config');
const User = require('./models/user');

connectToDatabase();

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: PORT },
  context: async ({ req, res }) => {
    const auth = req ? req.headers.authorization : null;

    if (auth && auth.startsWith('Bearer ')) {
      const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET);

      const currentUser = await User.findById(decodedToken.id).populate(
        'friends'
      );
      return { currentUser };
    }
  },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
