import * as fs from "fs";
import * as path from "path";

const openapiFilePath = path.join(__dirname, "../openapi.json");

function modifyOpenApiSchema() {
  // Lire le fichier openapi.json
  fs.readFile(openapiFilePath, "utf8", (err, data) => {
    if (err) {
      console.error("Erreur lors de la lecture du fichier:", err);
      return;
    }

    try {
      // Parser le contenu JSON
      const openapiJson = JSON.parse(data);

      // Vérifier si le schéma vault existe
      if (
        openapiJson.components &&
        openapiJson.components.schemas &&
        openapiJson.components.schemas.vaults
      ) {
        // Ajouter le champ "test": 0 au schéma vault
        openapiJson.components.schemas.vaults.properties.test = 0;

        // Convertir l'objet JSON en chaîne de caractères
        const updatedData = JSON.stringify(openapiJson, null, 2);

        // Écrire les modifications dans le fichier openapi.json
        fs.writeFile(openapiFilePath, updatedData, "utf8", (err) => {
          if (err) {
            console.error("Erreur lors de l'écriture du fichier:", err);
            return;
          }
          console.log("Le fichier openapi.json a été mis à jour avec succès.");
        });
      } else {
        console.error("Le schéma vault n'existe pas dans components.schemas.");
      }
    } catch (err) {
      console.error("Erreur lors du parsing du fichier JSON:", err);
    }
  });
}

interface Schema {
  [key: string]: any;
}

function findAndModifySiteId(
  schema: Schema,
  currentPath: string = ""
): string[] {
  let paths: string[] = [];

  for (const key in schema) {
    if (schema.hasOwnProperty(key)) {
      const newPath = currentPath ? `${currentPath}.${key}` : key;

      if (key === "siteId") {
        paths.push(newPath);

        // Ajouter le champ "asics" au même niveau que "siteId"
        schema["asics"] = {
          type: "object",
          description: "asics",
          $ref: "#/components/schemas/asics",
        };
      }

      if (typeof schema[key] === "object" && schema[key] !== null) {
        paths = paths.concat(findAndModifySiteId(schema[key], newPath));
      }
    }
  }

  return paths;
}

function findSiteIdInOpenApi() {
  fs.readFile(openapiFilePath, "utf8", (err, data) => {
    if (err) {
      console.error("Erreur lors de la lecture du fichier:", err);
      return;
    }

    try {
      const openapiJson = JSON.parse(data);

      if (openapiJson.components && openapiJson.components.schemas) {
        const schemas = openapiJson.components.schemas;
        const paths = findAndModifySiteId(schemas);

        if (paths.length > 0) {
          console.log(
            "Le champ siteId a été trouvé aux chemins suivants et le champ asics a été ajouté:"
          );
          paths.forEach((path) => console.log(path));

          // Convertir l'objet JSON en chaîne de caractères
          const updatedData = JSON.stringify(openapiJson, null, 2);

          // Écrire les modifications dans le fichier openapi.json
          fs.writeFile(openapiFilePath, updatedData, "utf8", (err) => {
            if (err) {
              console.error("Erreur lors de l'écriture du fichier:", err);
              return;
            }
            console.log(
              "Le fichier openapi.json a été mis à jour avec succès."
            );
          });
        } else {
          console.log("Le champ siteId n'a pas été trouvé.");
        }
      } else {
        console.error("Les schémas n'existent pas dans components.schemas.");
      }
    } catch (err) {
      console.error("Erreur lors du parsing du fichier JSON:", err);
    }
  });
}

// Appeler la fonction pour trouver siteId et ajouter asics
findSiteIdInOpenApi();

// Appeler la fonction pour modifier le schéma
//modifyOpenApiSchema();
