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
    outbound: (parent, args, context, info) => {
      const session = context.driver.session()
      return session
        .run('MATCH (n { id: $id })-[r:NODDED_AT]->(other:User) RETURN other', {
          id: parent.id,
        })
        .then((result) => {
          session.close()
          return result.records.map((record) => record.get('other').properties)
        })
    },
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
    inbound: (parent, args, context, info) => {
      const session = context.driver.session()
      return session
        .run('MATCH (n { id: $id })<-[r:NODDED_AT]-(other:User) RETURN other', {
          id: parent.id,
        })
        .then((result) => {
          session.close()
          return result.records.map((record) => record.get('other').properties)
        })
    },
    inboundCount: (parent, args, context, info) => {
      const session = context.driver.session()
      return session
        .run('MATCH (n { id: $id })<-[r:NODDED_AT]-(:User) RETURN COUNT(r)', {
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
    sendNod: (parent, args, context) => {
      const session = context.driver.session()
      return session
        .run(
          'MATCH (a:User),(b:User) WHERE a.id = $from AND b.id = $to CREATE (a)-[r:NODDED_AT]->(b) RETURN a.id, b.id',
          { from: args.from, to: args.to }
        )
        .then((result) => {
          session.close()
          return {
            from: result.records[0].get('a.id'),
            to: result.records[0].get('b.id'),
          }
        })
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
