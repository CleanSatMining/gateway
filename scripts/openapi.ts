import { promises as fs } from "fs";
import * as path from "path";
import { ObjectDescription, OpenApiConfig } from "../src/types/config";
import { updateOpenapiSwagger } from "./utils/openApiSwagger";

const openapiFilePath = path.join(__dirname, "../openapi.json");
const configFilePath = path.join(__dirname, "../openapi.config.json");

interface Schema {
  [key: string]: any;
}

async function readConfigFile(): Promise<{
  delete: string[];
  extend: {
    [key: string]: ObjectDescription[];
  };
  explain: {
    [key: string]: ObjectDescription;
  };
}> {
  let deleteFields: string[] = [];
  let extendFields: {
    [key: string]: ObjectDescription[];
  } = {};
  let explainFields: {
    [key: string]: ObjectDescription;
  } = {};
  try {
    // Lire le fichier openapi.config.json
    const data = await fs.readFile(configFilePath, "utf8");
    const config: OpenApiConfig = JSON.parse(data);

    // Lire le champ "delete"
    deleteFields = config.nodes.delete;
    extendFields = config.nodes.schemas.extend;
    explainFields = config.nodes.schemas.explain;

    if (
      deleteFields &&
      deleteFields.length > 0 &&
      extendFields &&
      explainFields
    ) {
      console.log("Recuperation du fichier de config fait avec succes");
      console.log("Delete field: OK, ", deleteFields.length);
      console.log("Extend field:  OK, ");
      console.log("Explain field:  OK, ");
      console.log("");
      console.log("");
    } else {
      console.error("Delete field not found in the configuration file.");
    }
  } catch (err) {
    console.error("Error reading the configuration file:", err);
  }
  return { delete: deleteFields, extend: extendFields, explain: explainFields };
}

async function removeEmptyContentFields(obj: any): Promise<void> {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (key === "content" && Object.keys(obj[key]).length === 0) {
        delete obj[key];
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        await removeEmptyContentFields(obj[key]);
      }
    }
  }
}

async function processRemoveEmptyInOpenApiFile() {
  console.log("#Suppression des champs vides");
  try {
    const data = await fs.readFile(openapiFilePath, "utf8");
    const openapiJson = JSON.parse(data);

    await removeEmptyContentFields(openapiJson);

    // Convertir l'objet JSON en chaîne de caractères
    const updatedData = JSON.stringify(openapiJson, null, 2);

    // Écrire les modifications dans le fichier openapi.json
    await fs.writeFile(openapiFilePath, updatedData, "utf8");
    console.log("Le fichier openapi.json a été mis à jour avec succès.");
  } catch (err) {
    console.error("Erreur lors de la lecture ou du parsing du fichier:", err);
  }
  console.log(
    "#Fin Suppression des champs vides #############################"
  );
  console.log("-");
  console.log("-");
}

async function removeFieldNode(obj: any, fieldKey: string): Promise<void> {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      //console.log(`Champ: ${key}`);
      if (key === fieldKey) {
        //console.log(`Suppression du champ ${key}`);
        delete obj[key];
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        await removeFieldNode(obj[key], fieldKey);
      }
    }
  }
}

async function processRemoveNodesInOpenApiFile(deleteFields: string[]) {
  console.log("#Suppression des champs spécifiques");
  try {
    const data = await fs.readFile(openapiFilePath, "utf8");
    const openapiJson = JSON.parse(data);

    for (const field of deleteFields) {
      await removeFieldNode(openapiJson, field);
    }

    // Convertir l'objet JSON en chaîne de caractères
    const updatedData = JSON.stringify(openapiJson, null, 2);

    // Écrire les modifications dans le fichier openapi.json
    await fs.writeFile(openapiFilePath, updatedData, "utf8");
    console.log("Le fichier openapi.json a été mis à jour avec succès.");
  } catch (err) {
    console.error("Erreur lors de la lecture ou du parsing du fichier:", err);
  }
  console.log(
    "#Fin Suppression des champs spécifiques #############################"
  );
  console.log("-");
  console.log("-");
}

function setExplainField(
  schema: Schema,
  currentPath: string = "",
  searchKey: string,
  explainField: ObjectDescription
): string[] {
  let paths: string[] = [];

  for (const key in schema) {
    if (schema.hasOwnProperty(key)) {
      const newPath = currentPath ? `${currentPath}.${key}` : key;

      if (key === searchKey) {
        paths.push(newPath);

        // Ajouter le champ "searchValue" au même niveau que "searchKey"
        console.log(
          `Ajout du champ ${explainField.name} au chemin ${currentPath}`
        );

        if (explainField.type === "array") {
          schema[explainField.name] = {
            type: explainField.type,
            description: explainField.name,
            items: {
              $ref: `#/components/schemas/${explainField.reference}`,
            },
          };
        } else {
          schema[explainField.name] = {
            type: explainField.type,
            description: explainField.name,
            $ref: `#/components/schemas/${explainField.reference}`,
          };
        }
      }

      if (typeof schema[key] === "object" && schema[key] !== null) {
        paths = paths.concat(
          setExplainField(schema[key], newPath, searchKey, explainField)
        );
      }
    }
  }

  return paths;
}

function extendFieldNode(
  schema: Schema,
  currentPath: string = "",
  fieldNode: string,
  childrenFields: ObjectDescription[]
): string[] {
  let paths: string[] = [];

  for (const key in schema) {
    if (schema.hasOwnProperty(key)) {
      const newPath = currentPath ? `${currentPath}.${key}` : key;

      if (key === fieldNode && schema[key] && schema[key]["properties"]) {
        paths.push(`${newPath}.${"properties"}`);
        const currentSchema = schema[key]["properties"];

        for (const child of childrenFields) {
          // Ajouter le champ "searchValue" au même niveau que "searchKey"
          console.log(`Ajout du champ ${child.name} au chemin ${currentPath}`);
          if (child.type === "array") {
            currentSchema[child.name] = {
              type: child.type,
              description: child.name,
              items: {
                $ref: `#/components/schemas/${child.reference}`,
              },
            };
          } else {
            currentSchema[child.name] = {
              type: child.type,
              description: child.name,
              $ref: `#/components/schemas/${child.reference}`,
            };
          }
        }
      }

      if (typeof schema[key] === "object" && schema[key] !== null) {
        paths = paths.concat(
          extendFieldNode(schema[key], newPath, fieldNode, childrenFields)
        );
      }
    }
  }

  return paths;
}

async function explainFieldInOpenApi(
  fieldKey: string,
  explainField: ObjectDescription
): Promise<void> {
  try {
    const data = await fs.readFile(openapiFilePath, "utf8");
    const openapiJson = JSON.parse(data);

    if (openapiJson.components && openapiJson.components.schemas) {
      const schemas = openapiJson.components.schemas;
      const paths = setExplainField(schemas, "", fieldKey, explainField);

      if (paths.length > 0) {
        console.log(
          "Le champ " +
            fieldKey +
            " a été trouvé aux chemins suivants et le champ " +
            explainField.name +
            " a été ajouté:"
        );
        paths.forEach((path) => console.log(path));

        // Convertir l'objet JSON en chaîne de caractères
        const updatedData = JSON.stringify(openapiJson, null, 2);

        // Écrire les modifications dans le fichier openapi.json
        await fs.writeFile(openapiFilePath, updatedData, "utf8");
        console.log("Le fichier openapi.json a été mis à jour avec succès.");
      } else {
        console.log(`Le champ ${fieldKey} n'a pas été trouvé.`);
      }
    } else {
      console.error("Les schémas n'existent pas dans components.schemas.");
    }
  } catch (err) {
    console.error("Erreur lors de la lecture ou du parsing du fichier:", err);
  }
}

async function extendFieldNodeInOpenApi(
  fieldNode: string,
  childreFields: ObjectDescription[]
): Promise<void> {
  try {
    const data = await fs.readFile(openapiFilePath, "utf8");
    const openapiJson = JSON.parse(data);

    if (openapiJson.components && openapiJson.components.schemas) {
      const schemas = openapiJson.components.schemas;
      const paths = extendFieldNode(schemas, "", fieldNode, childreFields);

      if (paths.length > 0) {
        console.log(
          "Le champ " +
            fieldNode +
            " a été trouvé aux chemins suivants et les champs " +
            JSON.stringify(childreFields) +
            " a été ajouté:"
        );
        paths.forEach((path) => console.log(path));

        // Convertir l'objet JSON en chaîne de caractères
        const updatedData = JSON.stringify(openapiJson, null, 2);

        // Écrire les modifications dans le fichier openapi.json
        await fs.writeFile(openapiFilePath, updatedData, "utf8");
        console.log("Le fichier openapi.json a été mis à jour avec succès.");
      } else {
        console.log(`Le champ ${fieldNode} n'a pas été trouvé.`);
      }
    } else {
      console.error("Les schémas n'existent pas dans components.schemas.");
    }
  } catch (err) {
    console.error("Erreur lors de la lecture ou du parsing du fichier:", err);
  }
}

async function processExplainFieldInOpenApiFile(explainFields: {
  [key: string]: ObjectDescription;
}) {
  console.log("# Recherche des champs id et ajouter des objets frères");
  for (const key of Object.keys(explainFields)) {
    console.log(
      `Recherche de la clé: ${key}, pour ajout de l'object: ${JSON.stringify(
        explainFields[key]
      )}`
    );
    await explainFieldInOpenApi(key, explainFields[key]);
    console.log("--------------------------------------------------");
    console.log("");
  }
  console.log(
    "#Fin Recherche des champs id et ajout des objets correspondants #############################"
  );
  console.log("-");
  console.log("-");
}

async function processExtendFieldNodeInOpenApiFile(extendFields: {
  [key: string]: ObjectDescription[];
}) {
  console.log("# Recherche object parent et ajout des objets enfants");
  for (const fieldNode of Object.keys(extendFields)) {
    console.log(
      `Recherche de la clé: ${fieldNode}, pour ajout de les objects enfants: ${JSON.stringify(
        extendFields[fieldNode]
      )}`
    );
    await extendFieldNodeInOpenApi(fieldNode, extendFields[fieldNode]);
    console.log("--------------------------------------------------");
    console.log("");
  }
  console.log(
    "#Fin Recherche des champs id et ajout des objets correspondants #############################"
  );
  console.log("-");
  console.log("-");
}

async function processOpenApi() {
  await updateOpenapiSwagger();

  const { explain, extend, delete: deleteFields } = await readConfigFile();

  // Appeler la fonction pour supprimer les champs vides
  await processRemoveEmptyInOpenApiFile();

  // Appeler la fonction pour supprimer les champs spécifiques
  await processRemoveNodesInOpenApiFile(deleteFields);

  // Appeler la fonction pour trouver les champs id et ajouter les objets correspondants
  await processExplainFieldInOpenApiFile(explain);

  // Appeler la fonction pour trouver les champs et ajouter les enfants correspondants
  await processExtendFieldNodeInOpenApiFile(extend);
}

processOpenApi();
