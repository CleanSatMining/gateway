# Updating the OpenAPI File for the Supabase CSM Database

This guide explains how to update the OpenAPI file for the Supabase CSM database. Follow these steps to ensure the OpenAPI file is correctly updated.

## Steps

### 1. Retrieve the Swagger 2.0 JSON

- Make a GET request to the following URL:
https://zlczywhctfaosxqtjwee.supabase.co/rest/v1/

- Include the `apiKey` in the headers of your request. Use the API key for your project.

### 2. Open the Swagger Editor

- Go to [Swagger Editor](https://editor.swagger.io/).

### 3. Paste the Swagger JSON

- Copy the Swagger 2.0 JSON you retrieved in step 1.
- Paste it into the editor on the Swagger Editor website.

### 4. Convert to OpenAPI 3.0

- In the Swagger Editor, go to `Edit -> Convert to OpenAPI 3`.

### 5. Export the YAML as JSON

- In the Swagger Editor, go to `File -> Convert and save as JSON`.
- Save the file to your local machine.

### 6. Copy the File to Your Project

- Copy the JSON file you saved in step 5.
- Paste it into the `openapi.json` file in your project directory.

### 7. Run the Update Script

- Ensure you have `ts-node` installed. If not, install it using:
```sh
npm install -g ts-node


Run the update script:
```sh
ts-node scripts\openapi.ts

By following these steps, you will successfully update the OpenAPI file for the Supabase CSM database.