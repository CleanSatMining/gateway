export type ObjectDescription = {
  name: string;
  reference: string;
  type: string;
};

export type OpenApiConfig = {
  openapi: string;
  info: {
    title: string;
    version: string;
  };
  nodes: {
    delete: string[];
    schemas: {
      explain: {
        [key: string]: ObjectDescription;
      };
      extend: {
        [key: string]: ObjectDescription[];
      };
    };
  };
};
