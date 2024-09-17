import { Resolvers } from "./.mesh";
import { SelectionSetNode, SelectionNode, FieldNode } from "graphql";
import { addFieldValueSupabaseEquality } from "./src/tools/request";
import { CleanSatMiningDatabaseTables } from "./src/types/parameters";
import { databaseTypes } from "./src/tools/config";

const resolvers: Resolvers = {
  Query: {
    choco: createResolver("farms"),
  },
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
    async resolve(root, _args, context, info) {
      if (!context.CSM.Query[tableName]) {
        console.error("Query " + tableName + " not found in context.CSM.Query");
      }

      const requestedFields = await getRequestedFields(
        info.fieldNodes[0].selectionSet
      );

      console.log(
        "Requested fields:",
        JSON.stringify(requestedFields, null, 2)
      );
      let args = addFieldValueSupabaseEquality(_args);
      if (requestedFields.hasSubObect) {
        args = { ...args, select: requestedFields.requestValue };
      }
      //console.log("root", JSON.stringify(root, null, 2));
      console.log("args", JSON.stringify(args, null, 2));
      //console.log("context", JSON.stringify(context, null, 2));
      //console.log("info", JSON.stringify(info, null, 2));

      const response = context.CSM.Query[tableName]({
        root,
        args: { id: "eq.1" },
        context,
        info,
      });

      return response;
    },
  };
}

const getRequestedFields = async (
  selectionSet: SelectionSetNode | undefined
): Promise<{ requestValue: string; hasSubObect: boolean }> => {
  let fields: string = "";

  const traverseSelections = (
    selections: readonly SelectionNode[] | undefined
  ) => {
    if (!selections) return;

    let counter: number = 0;
    selections.forEach((selection) => {
      if (selection.kind === "Field") {
        const field = selection as FieldNode;

        // Récursion pour les sous-champs
        if (field.selectionSet) {
          const nodeType = databaseTypes[field.name.value] ?? field.name.value;

          if (counter > 0) {
            fields += ",";
          }
          fields += nodeType + "(";
          traverseSelections(field.selectionSet.selections);
          fields += ")";
        } else {
          if (counter > 0) {
            fields += ",";
          }
          fields += field.name.value;
        }
        counter++;
      }
    });
  };

  traverseSelections(selectionSet?.selections);
  return { requestValue: fields, hasSubObect: fields.includes("(") };
};
