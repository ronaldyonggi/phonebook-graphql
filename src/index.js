const { ApolloServer } = require('@apollo/server');
const { connectToDatabase } = require('./utils/db');
const { PORT } = require('./utils/config');
const { typeDefs } = require('./graphql/schema');
const { resolvers } = require('./graphql/resolvers');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./utils/config');
const User = require('./models/user');
const http = require('http');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const express = require('express');
const cors = require('cors');
const {
  ApolloServerPluginDrainHttpServer,
} = require('@apollo/server/plugin/drainHttpServer');
const { expressMiddleware } = require('@apollo/server/express4');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');

connectToDatabase();

// Setup is now within a function
const start = async () => {
  const app = express();
  const httpServer = http.createServer(app);

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/',
  });

  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const serverCleanup = useServer({ schema }, wsServer);

  // This ApolloServer object is passed to express as middleware
  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await server.start();

  app.use(
    '/',
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const auth = req ? req.headers.authorization : null;
        if (auth && auth.startsWith('Bearer ')) {
          const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET);
          const currentUser = await User.findById(decodedToken.id).populate(
            'friends'
          );
          return { currentUser };
        }
      },
    })
  );

  httpServer.listen(PORT, () =>
    console.log(`Server is running on http://localhost:${PORT}`)
  );
};

start();
