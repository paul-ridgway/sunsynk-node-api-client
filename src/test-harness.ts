import fs from "fs";
import path from "path";
import { Client } from "./client";

interface Credentials {
  username: string;
  password: string;
}

function loadCredentials(): Credentials {
  if (process.env.SUNSYNK_USERNAME && process.env.SUNSYNK_PASSWORD) {
    return {
      username: process.env.SUNSYNK_USERNAME,
      password: process.env.SUNSYNK_PASSWORD,
    };
  }

  const credPath = path.resolve(__dirname, "..", "credentials.json");
  if (fs.existsSync(credPath)) {
    const raw = fs.readFileSync(credPath, "utf-8");
    const parsed = JSON.parse(raw);
    if (parsed.username && parsed.password) {
      return { username: parsed.username, password: parsed.password };
    }
  }

  console.error(
    "No credentials found. Provide them via:\n" +
      "  1. Environment variables: SUNSYNK_USERNAME and SUNSYNK_PASSWORD\n" +
      "  2. A credentials.json file in the project root (see credentials.json.example)"
  );
  process.exit(1);
}

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

async function runTest(
  name: string,
  fn: () => Promise<string>
): Promise<TestResult> {
  try {
    const summary = await fn();
    console.log(`  ✓ ${name} — ${summary}`);
    return { name, passed: true };
  } catch (err: any) {
    const msg = err.message || String(err);
    console.log(`  ✗ ${name} — ${msg}`);
    return { name, passed: false, error: msg };
  }
}

async function main() {
  const creds = loadCredentials();
  console.log(`\nSunsynk API Test Harness`);
  console.log(`Authenticating as: ${creds.username}\n`);

  const client = new Client(creds.username, creds.password);
  const results: TestResult[] = [];
  let plantId: number | undefined;

  results.push(
    await runTest("getUser", async () => {
      const user = await client.getUser();
      return `id=${user.id}, nickname="${user.nickname}"`;
    })
  );

  results.push(
    await runTest("getPlants", async () => {
      const plants = await client.getPlants();
      if (!plants.infos.length) {
        throw new Error("No plants returned");
      }
      plantId = plants.infos[0].id;
      const names = plants.infos.map((p) => p.name).join(", ");
      return `${plants.total} plant(s): ${names}`;
    })
  );

  if (!plantId) {
    console.log("\n  Skipping plant-specific tests (no plantId available)\n");
  } else {
    results.push(
      await runTest("getPlant", async () => {
        const plant = await client.getPlant(plantId!);
        return `"${plant.name}" — ${plant.totalPower}W total, status=${plant.status}`;
      })
    );

    results.push(
      await runTest("getRealtimeData", async () => {
        const rt = await client.getRealtimeData(plantId!);
        return `pac=${rt.pac}W, etoday=${rt.etoday}kWh, etotal=${rt.etotal}kWh`;
      })
    );

    results.push(
      await runTest("getFlow", async () => {
        const flow = await client.getFlow(plantId!, new Date());
        return `pv=${flow.pvPower}W, load=${flow.loadOrEpsPower}W, grid=${flow.gridOrMeterPower}W, soc=${flow.soc}%`;
      })
    );

    results.push(
      await runTest("getInverters", async () => {
        const inv = await client.getInverters(plantId!);
        if (!inv.infos.length) {
          return `0 inverters`;
        }
        const descs = inv.infos
          .map((i) => `${i.sn} (${i.model})`)
          .join(", ");
        return `${inv.total} inverter(s): ${descs}`;
      })
    );
  }

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`\nResults: ${passed} passed, ${failed} failed out of ${results.length} tests`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
