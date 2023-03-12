import { readFileSync } from "fs";
import { Client } from "./client";


const { username, password } = JSON.parse(readFileSync('./credentials.json', 'utf8'));

async function demo() {
  console.log("API Client demo");

  const client = new Client(username, password);
  console.log("Logged in as:", (await client.getUser()).data.nickname);
  
  const plants = await client.getPlants();
  console.log("Plants:", plants.data.infos.length);
  console.log("First plant, ID:", plants.data.infos[0].id, plants.data.infos[0].name);

  console.log("Plant: ", await client.getPlant(plants.data.infos[0].id));
  
  const flow = await client.getFlow(plants.data.infos[0].id, new Date());
  console.log("Flow:", JSON.stringify(flow, null, 2));

  console.log("Generation: ", await client.getGenerationUse(plants.data.infos[0].id));

  console.log("Realtime", await client.getRealtimeData(plants.data.infos[0].id));

  // const energy = await client.getEnergyByDay(plants.data.infos[0].id, new Date());
  // console.log("Energy:", JSON.stringify(energy, null, 2));


  console.log("Finished!");
}

demo().catch((err) => console.error('Error running demo:', err));