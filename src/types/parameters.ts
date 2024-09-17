export enum DefaultQueryParameters {
  Offset = "offset",
  Order = "order",
  Prefer = "Prefer",
  Range = "Range",
  RangeUnit = "Range_Unit",
  Select = "select",
}

// eslint-disable-next-line @typescript-eslint/ban-types
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
