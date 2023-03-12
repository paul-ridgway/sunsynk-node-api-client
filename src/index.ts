import { readFileSync } from "fs";
import { Client } from "./client";


const { username, password } = JSON.parse(readFileSync('./credentials.json', 'utf8'));

async function demo() {
  console.log("API Client demo");

  const client = new Client(username, password);
  console.log("User:", JSON.stringify(await client.getUser(), null, 2));
  const plants = await client.getPlants();
  console.log("Plants:", plants.data.infos.length);
  const flow = await client.getFlow(plants.data.infos[0].id, new Date());
  console.log("Flow:", JSON.stringify(flow, null, 2));
  console.log("Finished!");
}

demo().catch((err) => console.error('Error running demo:', err));