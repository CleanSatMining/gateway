//import { createBuiltMeshHTTPHandler } from "./../../../../../.mesh";
//export default createBuiltMeshHTTPHandler();

import { NextApiRequest, NextApiResponse } from "next";
//import { createBuiltMeshHTTPHandler } from '@graphql-mesh/runtime';

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {
  console.log("API GRAPHQL", req, res);
};
