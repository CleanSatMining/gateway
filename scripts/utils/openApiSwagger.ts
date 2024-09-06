import { promises as fs } from "fs";
import * as path from "path";
import * as swagger2openapi from "swagger2openapi";
import * as dotenv from "dotenv";

// Charger les variables d'environnement
dotenv.config();

const swaggerFilePath = path.join(__dirname, "../../openapi.json");
const outputFilePath = path.join(__dirname, "../../openapi.json");

async function fetchSwagger() {
  const apiUrl = "https://zlczywhctfaosxqtjwee.supabase.co/rest/v1/";
  const apiKey = process.env.SUPABASE_CSM_API_KEY;

  if (!apiKey) {
    console.error(
      "SUPABASE_CSM_API_KEY is not defined in the environment variables."
    );
    process.exit(1);
  }

  try {
    const response = await fetch(apiUrl, {
      headers: {
        apiKey: apiKey,
      },
    });

    if (response.ok) {
      console.log("Swagger 2.0 fetched successfully.");
      return await response.json();
    } else {
      console.error(
        "Failed to fetch Swagger 2.0:",
        response.status,
        response.statusText
      );
    }
  } catch (error) {
    console.error("Error fetching Swagger 2.0:", error);
  }
}

async function convertSwaggerToOpenAPI(swaggerDoc: any) {
  try {
    console.log("Convert OpenAPI 2.0 into OpenAPI 3.0");
    // Lire le fichier Swagger 2.0
    //const data = await fs.readFile(swaggerFilePath, "utf8");
    //const swaggerDoc = JSON.parse(data);

    // Convertir en OpenAPI 3.0.1
    const options = { patch: true, targetVersion: "3.0.1" };
    const result = await swagger2openapi.convertObj(swaggerDoc, options);

    // Écrire le fichier OpenAPI 3.0.1
    const openapiDoc = result.openapi;
    const openapiData = JSON.stringify(openapiDoc, null, 2);
    await fs.writeFile(outputFilePath, openapiData, "utf8");
    console.log(
      "Conversion successful. OpenAPI 3.0.1 file saved as openapi_v3.json"
    );
    // Convertir en OpenAPI 3.0
    /*  swagger2openapi.convertObj(
      swaggerDoc,
      { patch: true, targetVersion: "3.0.1" },
      async (err, options) => {
        if (err) {
          console.error("Error during conversion:", err);
          return;
        }

        // Écrire le fichier OpenAPI 3.0
        const openapiDoc = options.openapi;
        const openapiData = JSON.stringify(openapiDoc, null, 2);
        await fs.writeFile(outputFilePath, openapiData, "utf8");
        console.log(
          "Conversion successful. OpenAPI 3.0 file saved as openapi_v3.json"
        );
      }
    ); */
  } catch (err) {
    console.error("Error reading or writing file:", err);
  }
}

export async function updateOpenapiSwagger() {
  // Recuperer le swagger 2.0
  const swagger = await fetchSwagger();
  //console.log("swagger", swagger);

  // Appeler la fonction pour démarrer la conversion
  await convertSwaggerToOpenAPI(swagger);
}

//updateOpenapiSwagger();
