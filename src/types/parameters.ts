export const enumToSet = (enumObj: any): Set<string> => {
  return new Set(Object.values(enumObj));
};

export enum DefaultQueryParameters {
  Offset = "offset",
  Order = "order",
  Prefer = "Prefer",
  Range = "Range",
  RangeUnit = "Range_Unit",
  Select = "select",
}

export const DefaultQueryParametersSet: Set<String> = new Set(
  Object.values(DefaultQueryParameters)
);

export enum CleanSatMiningDatabaseTables {
  apis = "apis",
  asics = "asics",
  containers = "containers",
  contracts = "contracts",
  energies = "energies",
  farms = "farms",
  financialStatements = "financialStatements",
  flows = "flows",
  locations = "locations",
  mining = "mining",
  operators = "operators",
  pools = "pools",
  powerPlants = "powerPlants",
  providers = "providers",
  sites = "sites",
  societies = "societies",
  tokens = "tokens",
  vaults = "vaults",
}
