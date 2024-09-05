import { QueryfarmsArgs, RequireFields, Resolvers } from "./.mesh";
import { addFieldValueSupabaseEquality } from "./src/tools/request";
import { CleanSatMiningDatabaseTables } from "./src/types/parameters";

const resolvers: Resolvers = {
  Query: {},
};

// Create the resolvers of supabases equality for all tables
for (const table of Object.values(CleanSatMiningDatabaseTables)) {
  if (resolvers.Query) {
    resolvers.Query[table.toString()] = createResolver(table.toString());
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
      //console.log("root", JSON.stringify(root, null, 2));
      //console.log("args", JSON.stringify(_args, null, 2));
      //console.log("context", JSON.stringify(context, null, 2));
      //console.log("info", JSON.stringify(info, null, 2));
      let args = addFieldValueSupabaseEquality(_args);

      if (!context.CSM.Query[tableName]) {
        console.error("Query " + tableName + " not found in context.CSM.Query");
      }

      return context.CSM.Query[tableName]({
        root,
        args: args,
        context,
        info,
      });
    },
  };
}
