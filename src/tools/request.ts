import { DefaultQueryParametersSet } from "../types/parameters";

export function addFieldValueSupabaseEquality<T extends Record<string, any>>(
  _args: T
): T {
  let args = { ..._args };

  // Replace string values with eq.<value> for all query parameters except the supabase default ones
  // This allows to fetch the exact value without adding specific supabase keywords
  for (let key in args) {
    if (args.hasOwnProperty(key)) {
      let value = args[key];
      console.log("key", key, "value", value);
      if (
        typeof value === "string" &&
        !DefaultQueryParametersSet.has(key) &&
        value &&
        !value.includes(".")
      ) {
        args[key] = `eq.${value}` as T[Extract<keyof T, string>];
      }
    }
  }
  return args;
}
