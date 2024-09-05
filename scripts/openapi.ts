import { promises as fs } from "fs";
import * as path from "path";
import {
  removedFields,
  objectsFromObjectIds,
  objectsInParentObjects,
} from "./openapi.config";

const openapiFilePath = path.join(__dirname, "../openapi.json");

function isSchemaProperties(path: string): boolean {
  return path.endsWith(".properties");
}

interface Schema {
  [key: string]: any;
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

async function removeSpecificFields(obj: any, fieldKey: string): Promise<void> {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      //console.log(`Champ: ${key}`);
      if (key === fieldKey) {
        //console.log(`Suppression du champ ${key}`);
        delete obj[key];
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        await removeSpecificFields(obj[key], fieldKey);
      }
    }
  }
}

async function processRemoveFieldInOpenApiFile() {
  console.log("#Suppression des champs spécifiques");
  try {
    const data = await fs.readFile(openapiFilePath, "utf8");
    const openapiJson = JSON.parse(data);

    for (const field of removedFields) {
      await removeSpecificFields(openapiJson, field);
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

function findKeyAndAddSibling(
  schema: Schema,
  currentPath: string = "",
  searchKey: string
): string[] {
  let paths: string[] = [];

  for (const key in schema) {
    if (schema.hasOwnProperty(key)) {
      const newPath = currentPath ? `${currentPath}.${key}` : key;

      if (key === searchKey) {
        paths.push(newPath);

        const searchValue = objectsFromObjectIds[searchKey];
        // Ajouter le champ "searchValue" au même niveau que "searchKey"
        console.log(
          `Ajout du champ ${searchValue.name} au chemin ${currentPath}`
        );

        if (searchValue.type === "array") {
          schema[searchValue.name] = {
            type: searchValue.type,
            description: searchValue.name,
            items: {
              $ref: `#/components/schemas/${searchValue.reference}`,
            },
          };
        } else {
          schema[searchValue.name] = {
            type: searchValue.type,
            description: searchValue.name,
            $ref: `#/components/schemas/${searchValue.reference}`,
          };
        }
      }

      if (typeof schema[key] === "object" && schema[key] !== null) {
        paths = paths.concat(
          findKeyAndAddSibling(schema[key], newPath, searchKey)
        );
      }
    }
  }

  return paths;
}

function findKeyAndAddChildren(
  schema: Schema,
  currentPath: string = "",
  searchKey: string
): string[] {
  let paths: string[] = [];

  for (const key in schema) {
    if (schema.hasOwnProperty(key)) {
      const newPath = currentPath ? `${currentPath}.${key}` : key;

      if (key === searchKey && schema[key] && schema[key]["properties"]) {
        paths.push(`${newPath}.${"properties"}`);
        const currentSchema = schema[key]["properties"];

        const searchValues = objectsInParentObjects[searchKey];
        for (const searchValue of searchValues) {
          // Ajouter le champ "searchValue" au même niveau que "searchKey"
          console.log(
            `Ajout du champ ${searchValue.name} au chemin ${currentPath}`
          );
          if (searchValue.type === "array") {
            currentSchema[searchValue.name] = {
              type: searchValue.type,
              description: searchValue.name,
              items: {
                $ref: `#/components/schemas/${searchValue.reference}`,
              },
            };
          } else {
            currentSchema[searchValue.name] = {
              type: searchValue.type,
              description: searchValue.name,
              $ref: `#/components/schemas/${searchValue.reference}`,
            };
          }
        }
      }

      if (typeof schema[key] === "object" && schema[key] !== null) {
        paths = paths.concat(
          findKeyAndAddChildren(schema[key], newPath, searchKey)
        );
      }
    }
  }

  return paths;
}

async function addSiblingInOpenApi(siblingKey: string): Promise<void> {
  try {
    const data = await fs.readFile(openapiFilePath, "utf8");
    const openapiJson = JSON.parse(data);

    if (openapiJson.components && openapiJson.components.schemas) {
      const schemas = openapiJson.components.schemas;
      const paths = findKeyAndAddSibling(schemas, "", siblingKey);

      if (paths.length > 0) {
        console.log(
          "Le champ " +
            siblingKey +
            " a été trouvé aux chemins suivants et le champ " +
            objectsFromObjectIds[siblingKey].name +
            " a été ajouté:"
        );
        paths.forEach((path) => console.log(path));

        // Convertir l'objet JSON en chaîne de caractères
        const updatedData = JSON.stringify(openapiJson, null, 2);

        // Écrire les modifications dans le fichier openapi.json
        await fs.writeFile(openapiFilePath, updatedData, "utf8");
        console.log("Le fichier openapi.json a été mis à jour avec succès.");
      } else {
        console.log(`Le champ ${siblingKey} n'a pas été trouvé.`);
      }
    } else {
      console.error("Les schémas n'existent pas dans components.schemas.");
    }
  } catch (err) {
    console.error("Erreur lors de la lecture ou du parsing du fichier:", err);
  }
}

async function addChildrenInOpenApi(parentKey: string): Promise<void> {
  try {
    const data = await fs.readFile(openapiFilePath, "utf8");
    const openapiJson = JSON.parse(data);

    if (openapiJson.components && openapiJson.components.schemas) {
      const schemas = openapiJson.components.schemas;
      const paths = findKeyAndAddChildren(schemas, "", parentKey);

      if (paths.length > 0) {
        console.log(
          "Le champ " +
            parentKey +
            " a été trouvé aux chemins suivants et le champ " +
            JSON.stringify(objectsInParentObjects[parentKey]) +
            " a été ajouté:"
        );
        paths.forEach((path) => console.log(path));

        // Convertir l'objet JSON en chaîne de caractères
        const updatedData = JSON.stringify(openapiJson, null, 2);

        // Écrire les modifications dans le fichier openapi.json
        await fs.writeFile(openapiFilePath, updatedData, "utf8");
        console.log("Le fichier openapi.json a été mis à jour avec succès.");
      } else {
        console.log(`Le champ ${parentKey} n'a pas été trouvé.`);
      }
    } else {
      console.error("Les schémas n'existent pas dans components.schemas.");
    }
  } catch (err) {
    console.error("Erreur lors de la lecture ou du parsing du fichier:", err);
  }
}

async function processAddSiblingsToObjectIds() {
  console.log("# Recherche des champs id et ajouter des objets frères");
  for (const key of Object.keys(objectsFromObjectIds)) {
    console.log(
      `Recherche de la clé: ${key}, pour ajout de l'object: ${JSON.stringify(
        objectsFromObjectIds[key]
      )}`
    );
    await addSiblingInOpenApi(key);
    console.log("--------------------------------------------------");
    console.log("");
  }
  console.log(
    "#Fin Recherche des champs id et ajout des objets correspondants #############################"
  );
  console.log("-");
  console.log("-");
}

async function processAddChildrensToObject() {
  console.log("# Recherche object parent et ajout des objets enfants");
  for (const key of Object.keys(objectsInParentObjects)) {
    console.log(
      `Recherche de la clé: ${key}, pour ajout de les objects enfants: ${JSON.stringify(
        objectsInParentObjects[key]
      )}`
    );
    await addChildrenInOpenApi(key);
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
  // Appeler la fonction pour supprimer les champs vides
  await processRemoveEmptyInOpenApiFile();

  // Appeler la fonction pour supprimer les champs spécifiques
  await processRemoveFieldInOpenApiFile();

  // Appeler la fonction pour trouver les champs id et ajouter les objets correspondants
  await processAddSiblingsToObjectIds();

  // Appeler la fonction pour trouver les champs et ajouter les enfants correspondants
  await processAddChildrensToObject();
}

processOpenApi();
