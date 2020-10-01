import { session } from 'neo4j-driver'

function toNumber({ low, high }) {
  let res = high

  for (let i = 0; i < 32; i++) {
    res *= 2
  }

  return low + res
}

const resolvers = {
  Query: {
    user: (parent, args, context, info) => {
      const session = context.driver.session()
      return session
        .run('MATCH (n:User) WHERE n.id=$id RETURN n', { id: args.id })
        .then((result) => {
          session.close()
          return result.records[0].get(0).properties
        })
    },
    users: (parent, args, context, info) => {
      const session = context.driver.session()
      return session.run('MATCH (n) RETURN n').then((result) => {
        const users = result.records.map((record) => record.get(0).properties)
        session.close()
        return users
      })
    },
  },
  User: {
    outboundCount: (parent, args, context, info) => {
      const session = context.driver.session()
      return session
        .run('MATCH (n { id: $id })-[r:NODDED_AT]->(:User) RETURN COUNT(r)', {
          id: parent.id,
        })
        .then((result) => {
          session.close()
          return toNumber(result.records[0].get('COUNT(r)'))
        })
    },
  },
  Mutation: {
    message: (parent, args) => {
      return { message: args.message, success: true }
    },
  },
}

export default resolvers

// outbound: [User] @relation(name: "NODDED_AT", direction: "OUT")
// outboundCount: Int
//   @cypher(statement: "RETURN SIZE( (this)-[:NODDED_AT]->(:User))")
// inbound: [User] @relation(name: "NODDED_AT", direction: "IN")
// inboundCount: Int
//   @cypher(statement: "RETURN SIZE( (this)<-[:NODDED_AT]-(:User))")
