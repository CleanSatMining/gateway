import { getMesh } from "@graphql-mesh/runtime";
import { serveMesh, findAndParseConfig } from "@graphql-mesh/cli";
import { Logger } from "@graphql-mesh/types";

const logger: Logger = {
  log: (message) => console.log(message),
  info: (message) => console.info(message),
  debug: (message) => console.debug(message),
  warn: (message) => console.warn(message),
  error: (message) => console.error(message),
  child: () => logger,
};

async function startServer() {
  const meshConfig = await findAndParseConfig();
  const getBuiltMesh = async () => await getMesh(meshConfig);

  await serveMesh(
    {
      baseDir: process.cwd(),
      getBuiltMesh,
      logger,
      rawServeConfig: meshConfig.config.serve,
      registerTerminateHandler: () => {}, // Add a dummy function as the terminate handler
    },
    {
      commandName: "serve",
      initialLoggerPrefix: "",
      configName: ".meshrc.yaml",
      artifactsDir: "artifacts",
      serveMessage: "Server is running at http://localhost:3000",
      playgroundTitle: "GraphQL Playground",
      builtMeshFactoryName: "builtMeshFactory",
      builtMeshSDKFactoryName: "builtMeshSDKFactory",
      devServerCommand: "dev",
      prodServerCommand: "start",
      buildArtifactsCommand: "build",
      sourceServerCommand: "source",
      validateCommand: "validate",
      additionalPackagePrefixes: [],
    }
  );
}

startServer().catch((err) => console.error(err));
