import { QueryfarmsArgs, RequireFields, Resolvers } from "./.mesh";
import { addFieldValueSupabaseEquality } from "./src/tools/request";
import { CleanSatMiningDatabaseTables } from "./src/types/parameters";

const resolvers: Resolvers = {
  Query: {},
};

// Create the resolvers of supabases equality for all tables
for (const table of Object.values(CleanSatMiningDatabaseTables)) {
  if (resolvers.Query) {
    resolvers.Query[table.toString()] = createResolver(table);
  }
}

export default resolvers;

function createResolver(tableName: string) {
  return {
    selectionSet: /* GraphQL */ `
      {
        id
      }
    `,
    resolve(root, _args, context, info) {
      let args = addFieldValueSupabaseEquality(_args);

      return context.CSM.Query[tableName]({
        root,
        args: args,
        context,
        info,
      });
    },
  };
}
