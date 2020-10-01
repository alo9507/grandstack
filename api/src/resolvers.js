const resolvers = {
  Query: {
    user: (parent, args, context, info) => {
      return context.session
        .run('MATCH (n:User) WHERE n.id=$id RETURN n', { id: args.id })
        .then((result) => {
          return result.records[0].get(0).properties
        })
    },
    users: (parent, args, context, info) => {
      return context.session.run('MATCH (n) RETURN n').then((result) => {
        const users = result.records.map((record) => record.get(0).properties)
        return users
      })
    },
  },
  User: {
    outbound: (parent) => {
      return context.session
      .run('MATCH (n:User) WHERE n.id=$id RETURN n', { id: args.id })
      .then((result) => {
        return result.records[0].get(0).properties
      })
    }
  }
  Mutation: {
    message: (parent, args) => {
      return { message: args.message, success: true }
    },
  },
}

export default resolvers
