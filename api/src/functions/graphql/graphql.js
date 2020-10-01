// This module can be used to serve the GraphQL endpoint
// as a lambda function

const { ApolloServer } = require('apollo-server-lambda')
const neo4j = require('neo4j-driver')

// This module is copied during the build step
// Be sure to run `npm run build`
const { typeDefs } = require('./graphql-schema')
const resolvers = require('../../resolvers')

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
const session = driver.session()

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: { driver, session, neo4jDatabase: process.env.NEO4J_DATABASE },
})

exports.handler = server.createHandler({
  cors: {
    origin: '*',
    credentials: true,
  },
})
