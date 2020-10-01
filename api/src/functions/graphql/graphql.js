// This module can be used to serve the GraphQL endpoint
// as a lambda function

const { ApolloServer } = require('apollo-server-lambda')
const neo4j = require('neo4j-driver')

// This module is copied during the build step
// Be sure to run `npm run build`
const { typeDefs } = require('./graphql-schema')

const driver = neo4j.driver(
  process.env.NEO4J_URI || 'bolt://localhost:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USER || 'neo4j',
    process.env.NEO4J_PASSWORD || 'neo4j'
  ),
  {
    encrypted: process.env.NEO4J_ENCRYPTED ? 'ENCRYPTION_ON' : 'ENCRYPTION_OFF',
  }
)

const user = {
  id: 'df',
  name: 'df',
  bio: 'df',
  whatAmIDoing: 'df',
  location: 'df',
  isVisible: true,
  sex: 'df',
  age: 25,
  outbound: [],
  outboundCount: 0,
  inbound: [],
  inboundCount: 0,
}

const resolvers = {
  Query: {
    user: () => {
      return user
    },
  },
  Mutation: {
    message: (parent, args) => {
      return { message: args.message, success: true }
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: { driver, neo4jDatabase: process.env.NEO4J_DATABASE },
})

exports.handler = server.createHandler({
  cors: {
    origin: '*',
    credentials: true,
  },
})
