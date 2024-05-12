const { GraphQLError } = require('graphql');
const Person = require('../models/person');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../utils/config');

const resolvers = {
  Query: {
    // personCount: () => persons.length,
    personCount: async () => Person.collection.countDocuments(),
    allPersons: async (root, args) => {
      if (!args.phone) {
        return Person.find({});
      }

      return Person.find({ phone: { $exists: args.phone === 'YES' } });
    },
    findPerson: async (root, args) => Person.findOne({ name: args.name }),
    me: (root, args, context) => context.currentUser,
  },
  Person: {
    address: (root) => {
      return {
        street: root.street,
        city: root.city,
      };
    },
  },
  Mutation: {
    addPerson: async (root, args) => {
      const person = new Person({ ...args });

      try {
        await person.save();
      } catch (error) {
        throw new GraphQLError('Saving person failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error,
          },
        });
      }
      return person;
    },

    editNumber: async (root, args) => {
      const person = await Person.findOne({ name: args.name });
      person.phone = args.phone;

      try {
        await person.save();
      } catch (error) {
        throw new GraphQLError('Edit number failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error,
          },
        });
      }
    },

    createUser: async (root, args) => {
      const user = new User({ username: args.username });

      return user.save().catch((err) => {
        throw new GraphQLError('Create new user failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.username,
            err,
          },
        });
      });
    },

    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });

      if (!user || args.password !== 'secret') {
        throw new GraphQLError('wrong credentails', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        });
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      };

      return { value: jwt.sign(userForToken, JWT_SECRET) };
    },
  },
};

module.exports = {
  resolvers,
};
