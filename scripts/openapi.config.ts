interface ObjectDescription {
  name: string;
  reference: string;
  type: string;
}
interface ObjectReference {
  [key: string]: ObjectDescription;
}

interface ParentReferences {
  [key: string]: ObjectDescription[];
}

export const objectsFromObjectIds: ObjectReference = {
  siteId: { name: "site", type: "object", reference: "sites" },
  asicId: { name: "asic", type: "object", reference: "asics" },
  farmId: { name: "farm", type: "object", reference: "farms" },
  poolId: { name: "pool", type: "object", reference: "pools" },
  locationId: { name: "location", type: "object", reference: "locations" },
  societyId: { name: "society", type: "object", reference: "societies" },
  powerPlantId: {
    name: "powerPlant",
    type: "object",
    reference: "powerPlants",
  },
  operatorId: { name: "operator", type: "object", reference: "operators" },
};

export const objectsInParentObjects: ParentReferences = {
  sites: [
    { name: "containers", type: "array", reference: "containers" },
    { name: "contract", type: "object", reference: "contracts" },
    { name: "api", type: "object", reference: "apis" },
  ],
  farms: [
    { name: "sites", type: "array", reference: "sites" },
    { name: "token", type: "object", reference: "tokens" },
    { name: "society", type: "object", reference: "societies" },
    { name: "vault", type: "object", reference: "vaults" },
  ],
};

export const removedFields: string[] = [
  "application/vnd.pgrst.object+json;nulls=stripped",
  "application/vnd.pgrst.object+json",
  "text/csv",
];
