import { readFile } from "fs/promises";

export const getForgeDataForEvent = async (event_id: string): Promise<any> => {
  const json_data = JSON.parse(await readFile(`event/event_${event_id}.json`, "utf8"));
  const forge_data = json_data.SpawningCart[0];
  return forge_data;

};
