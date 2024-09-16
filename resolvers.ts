import { Resolvers } from "./.mesh";
import { SelectionSetNode, SelectionNode, FieldNode } from "graphql";
import { addFieldValueSupabaseEquality } from "./src/tools/request";
import { CleanSatMiningDatabaseTables } from "./src/types/parameters";
import { databaseTypes } from "./src/tools/config";

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
    async resolve(root, _args, context, info) {
      if (!context.CSM.Query[tableName]) {
        console.error("Query " + tableName + " not found in context.CSM.Query");
      }
      /* 
      // Obtenir les champs demandés
      let primarySelectionSet: SelectionSetNode | undefined =
        info.fieldNodes[0].selectionSet;
      let infoSelectionSet: SelectionSetNode | undefined =
        info.fieldNodes[0].infoSelectionSet;

      const operation: OperationDefinitionNode = info.operation;
      let opeSelectionSet = operation.selectionSet;

      if (primarySelectionSet) {
        // Ajouter le champ farms au SelectionSet
        //console.log("add farms");
        //infoSelectionSet = addFieldToSelectionSet(infoSelectionSet, "farms");
        //newInfo.fieldNodes[0].selectionSet = infoSelectionSet;

        console.log("rename farm");
        primarySelectionSet = renameFieldInSelectionSet(
          primarySelectionSet,
          "farm",
          "farms"
        );

        console.log("end farms");
      }
      if (infoSelectionSet) {
        infoSelectionSet = renameFieldInSelectionSet(
          infoSelectionSet,
          "farm",
          "farms"
        );
      }

      if (opeSelectionSet) {
        opeSelectionSet = renameFieldInSelectionSet(
          opeSelectionSet,
          "farm",
          "farms"
        );
      }

      // Créer un nouvel objet info avec le SelectionSet mis à jour
      const newInfo: GraphQLResolveInfo = {
        ...info,
        fieldNodes: [
          {
            ...info.fieldNodes[0],
            selectionSet: primarySelectionSet,
            infoSelectionSet: infoSelectionSet,
          },
        ],
        operation: {
          ...info.operation,
          selectionSet: opeSelectionSet,
        },
      };
   

      console.log(
        "Selection set:",
        "fieldNodes " + JSON.stringify(newInfo.fieldNodes, null, 2),
        "operation " + JSON.stringify(newInfo.operation, null, 2),
        "parentType " + JSON.stringify(newInfo.parentType, null, 2)
      );
 */
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
        args: args,
        context,
        info,
      });

      await response.then((data) => {
        if (data.error) {
          console.error("Error", data.error);
        } else {
          console.log("Data", JSON.stringify(data, null, 2));
        }
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
