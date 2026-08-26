import neo4j, { Driver, Session } from "neo4j-driver";
import { mockGraphData, getMockRecommendations, getMockShortestPath, getMockCollaborators } from "./mock-data";
import { DbStatus, GraphData } from "@/types";

let driver: Driver | null = null;

export function getDriver(): Driver | null {
  const uri = process.env.COGNODB_URI;
  const user = process.env.COGNODB_USER || "cognodb";
  const password = process.env.COGNODB_PASSWORD;

  if (!uri || !password) {
    return null;
  }

  if (!driver) {
    try {
      driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
        maxConnectionPoolSize: 50,
        connectionAcquisitionTimeout: 5000,
        connectionTimeout: 5000,
        disableLosslessIntegers: true, // converts neo4j integers directly to JS numbers
      });
    } catch (error) {
      console.error("Failed to initialize CognoDB driver:", error);
      driver = null;
    }
  }

  return driver;
}

export async function runCypher<T = any>(
  query: string,
  params: Record<string, any> = {}
): Promise<{ records: T[]; summary?: any; executionTimeMs: number }> {
  const d = getDriver();
  const startTime = Date.now();

  if (!d) {
    throw new Error("COGNODB_NOT_CONFIGURED: Missing COGNODB_URI or COGNODB_PASSWORD.");
  }

  const session: Session = d.session();
  try {
    const result = await session.run(query, params);
    const executionTimeMs = Date.now() - startTime;
    const records = result.records.map((r) => r.toObject() as T);
    return { records, summary: result.summary, executionTimeMs };
  } finally {
    await session.close();
  }
}

export async function checkDatabaseHealth(): Promise<DbStatus> {
  const d = getDriver();
  if (!d) {
    return {
      connected: false,
      isMock: true,
      latencyMs: 0,
      nodeCount: mockGraphData.nodes.length,
      edgeCount: mockGraphData.edges.length,
      labels: {
        Movie: mockGraphData.nodes.filter((n) => n.label === "Movie").length,
        Person: mockGraphData.nodes.filter((n) => n.label === "Person").length,
        Genre: mockGraphData.nodes.filter((n) => n.label === "Genre").length,
        Trope: mockGraphData.nodes.filter((n) => n.label === "Trope").length,
      },
      errorMessage: "Running in Demo Fallback Mode. Configure COGNODB_URI and COGNODB_PASSWORD in .env.local to query live CognoDB instance.",
    };
  }

  const start = Date.now();
  const session = d.session();
  try {
    const nodeCountRes = await session.run("MATCH (n) RETURN count(n) AS totalNodes");
    const edgeCountRes = await session.run("MATCH ()-[r]->() RETURN count(r) AS totalEdges");
    const labelsRes = await session.run("CALL db.labels() YIELD label RETURN label");

    const latencyMs = Date.now() - start;
    const nodeCount = nodeCountRes.records[0]?.get("totalNodes") || 0;
    const edgeCount = edgeCountRes.records[0]?.get("totalEdges") || 0;
    const labels: Record<string, number> = {};

    for (const record of labelsRes.records) {
      const label = record.get("label");
      labels[label] = 1;
    }

    return {
      connected: true,
      isMock: false,
      latencyMs,
      nodeCount: Number(nodeCount),
      edgeCount: Number(edgeCount),
      labels,
    };
  } catch (err: any) {
    console.warn("CognoDB connection health check failed, falling back to mock mode:", err.message);
    return {
      connected: false,
      isMock: true,
      latencyMs: 0,
      nodeCount: mockGraphData.nodes.length,
      edgeCount: mockGraphData.edges.length,
      labels: {
        Movie: mockGraphData.nodes.filter((n) => n.label === "Movie").length,
        Person: mockGraphData.nodes.filter((n) => n.label === "Person").length,
        Genre: mockGraphData.nodes.filter((n) => n.label === "Genre").length,
        Trope: mockGraphData.nodes.filter((n) => n.label === "Trope").length,
      },
      errorMessage: `CognoDB unreachable (${err.message}). Demo Fallback Mode is active.`,
    };
  } finally {
    await session.close();
  }
}
