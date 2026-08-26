import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();
import neo4j from "neo4j-driver";

async function main() {
  console.log("\n=======================================================");
  console.log("⚡ CineGraph: CognoDB Bolt Connection Diagnostic");
  console.log("=======================================================\n");

  const uri = process.env.COGNODB_URI;
  const user = process.env.COGNODB_USER || "cognodb";
  const password = process.env.COGNODB_PASSWORD;

  if (!uri || !password) {
    console.warn("⚠️ No COGNODB_URI or COGNODB_PASSWORD found in environment.");
    console.warn("CineGraph will operate in high-fidelity Demo Fallback Mode.\n");
    return;
  }

  console.log(`Connecting to: ${uri}`);
  console.log(`User: ${user}`);

  const start = Date.now();
  const driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
    connectionTimeout: 5000,
  });

  const session = driver.session();
  try {
    const res = await session.run("MATCH (n) RETURN count(n) AS nodeCount");
    const latency = Date.now() - start;
    const count = res.records[0]?.get("nodeCount") || 0;

    console.log(`\n✅ Connected to CognoDB successfully!`);
    console.log(`⚡ Roundtrip Latency: ${latency}ms`);
    console.log(`📊 Current Node Count: ${count}\n`);
  } catch (err: any) {
    console.error(`\n❌ Connection failed: ${err.message}\n`);
  } finally {
    await session.close();
    await driver.close();
  }
}

main();
