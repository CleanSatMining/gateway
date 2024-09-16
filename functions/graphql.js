const { createMeshHTTPHandler } = require('@graphql-mesh/http');
const { getMesh } = require('@graphql-mesh/runtime');
const { findAndParseConfig } = require('@graphql-mesh/config');

let meshHandler;

const getMeshHandler = async () => {
  if (!meshHandler) {
    const meshConfig = await findAndParseConfig();
    const { execute, subscribe } = await getMesh(meshConfig);
    meshHandler = createMeshHTTPHandler({ baseDir: __dirname, execute, subscribe });
  }
  return meshHandler;
};

exports.handler = async (event, context) => {
  const handler = await getMeshHandler();
  return handler(event, context);
};