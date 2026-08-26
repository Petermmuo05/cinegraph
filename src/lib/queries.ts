import { runCypher, getDriver } from "./cognodb";
import {
  mockGraphData,
  getMockRecommendations,
  getMockShortestPath,
  getMockCollaborators,
} from "./mock-data";
import {
  GraphData,
  GraphNode,
  GraphEdge,
  RecommendationResult,
  ShortestPathResult,
  CollaboratorClique,
  MovieNode,
  PersonNode,
} from "@/types";

export async function fetchOverviewGraph(limit: number = 25): Promise<GraphData> {
  const driver = getDriver();
  if (!driver) return mockGraphData;

  try {
    const query = `
      MATCH (m:Movie)
      OPTIONAL MATCH (p:Person)-[r:DIRECTED|ACTED_IN]->(m)
      OPTIONAL MATCH (m)-[rg:IN_GENRE]->(g:Genre)
      WITH m, collect(DISTINCT p)[0..3] AS people, collect(DISTINCT g)[0..2] AS genres
      ORDER BY m.imdbRating DESC
      LIMIT $limit
      RETURN m, people, genres
    `;

    const result = await runCypher(query, { limit });
    const nodesMap = new Map<string, GraphNode>();
    const edges: GraphEdge[] = [];

    for (const record of result.records) {
      const m = record.m?.properties;
      if (m) {
        nodesMap.set(m.id, {
          id: m.id,
          label: "Movie",
          title: m.title,
          name: m.title,
          color: "#3B82F6",
          size: 26,
          properties: m,
        });
      }

      const people = record.people || [];
      for (const p of people) {
        const props = p.properties;
        if (props && !nodesMap.has(props.id)) {
          nodesMap.set(props.id, {
            id: props.id,
            label: "Person",
            name: props.name,
            color: props.primaryRole === "Director" ? "#34D399" : "#10B981",
            size: props.primaryRole === "Director" ? 22 : 18,
            properties: props,
          });
        }
        if (m && props) {
          edges.push({
            id: `e-${props.id}-${m.id}`,
            source: props.id,
            target: m.id,
            type: props.primaryRole === "Director" ? "DIRECTED" : "ACTED_IN",
            label: props.primaryRole === "Director" ? "Directed" : "Acted in",
          });
        }
      }

      const genres = record.genres || [];
      for (const g of genres) {
        const props = g.properties;
        if (props && !nodesMap.has(props.id)) {
          nodesMap.set(props.id, {
            id: props.id,
            label: "Genre",
            name: props.name,
            color: props.colorHex || "#06B6D4",
            size: 18,
            properties: props,
          });
        }
        if (m && props) {
          edges.push({
            id: `e-${m.id}-${props.id}`,
            source: m.id,
            target: props.id,
            type: "IN_GENRE",
            label: "In Genre",
          });
        }
      }
    }

    return {
      nodes: Array.from(nodesMap.values()),
      edges,
    };
  } catch (err) {
    console.warn("fetchOverviewGraph query failed, using mock data:", err);
    return mockGraphData;
  }
}

export async function expandNodeNeighborhood(nodeId: string): Promise<GraphData> {
  const driver = getDriver();
  if (!driver) {
    // Filter from mock data
    const directEdges = mockGraphData.edges.filter(
      (e) =>
        (typeof e.source === "string" ? e.source : e.source.id) === nodeId ||
        (typeof e.target === "string" ? e.target : e.target.id) === nodeId
    );
    const connectedNodeIds = new Set<string>([nodeId]);
    directEdges.forEach((e) => {
      connectedNodeIds.add(typeof e.source === "string" ? e.source : e.source.id);
      connectedNodeIds.add(typeof e.target === "string" ? e.target : e.target.id);
    });
    return {
      nodes: mockGraphData.nodes.filter((n) => connectedNodeIds.has(n.id)),
      edges: directEdges,
    };
  }

  try {
    const query = `
      MATCH (center {id: $nodeId})
      MATCH (center)-[r]-(neighbor)
      RETURN center, r, type(r) AS relType, neighbor
      LIMIT 40
    `;
    const result = await runCypher(query, { nodeId });
    const nodesMap = new Map<string, GraphNode>();
    const edges: GraphEdge[] = [];

    for (const record of result.records) {
      const c = record.center;
      const n = record.neighbor;
      const r = record.r;
      const relType = record.relType;

      if (c?.properties) {
        nodesMap.set(c.properties.id, {
          id: c.properties.id,
          label: (c.labels?.[0] || "Movie") as any,
          name: c.properties.name || c.properties.title,
          properties: c.properties,
        });
      }
      if (n?.properties) {
        nodesMap.set(n.properties.id, {
          id: n.properties.id,
          label: (n.labels?.[0] || "Person") as any,
          name: n.properties.name || n.properties.title,
          properties: n.properties,
        });
      }
      if (c?.properties && n?.properties) {
        edges.push({
          id: `e-exp-${c.properties.id}-${n.properties.id}`,
          source: c.properties.id,
          target: n.properties.id,
          type: relType || "CONNECTED_TO",
          label: relType,
          properties: r?.properties,
        });
      }
    }

    return {
      nodes: Array.from(nodesMap.values()),
      edges,
    };
  } catch (err) {
    console.warn("expandNodeNeighborhood failed:", err);
    return mockGraphData;
  }
}

export async function findShortestPath(personA: string, personB: string): Promise<ShortestPathResult> {
  const driver = getDriver();
  if (!driver) {
    return getMockShortestPath(personA, personB);
  }

  try {
    const query = `
      MATCH (start:Person {name: $personA}), (target:Person {name: $personB})
      MATCH p = shortestPath((start)-[:ACTED_IN|DIRECTED*..8]-(target))
      RETURN p, length(p) AS pathLength, nodes(p) AS pathNodes, relationships(p) AS pathRels
    `;
    const result = await runCypher(query, { personA, personB });

    if (result.records.length === 0) {
      return getMockShortestPath(personA, personB);
    }

    const record = result.records[0];
    const pathNodes = record.pathNodes.map((n: any) => ({
      id: n.properties.id,
      label: n.labels[0],
      name: n.properties.name || n.properties.title,
      properties: n.properties,
    }));
    const pathRels = record.pathRels.map((r: any) => ({
      type: r.type,
      properties: r.properties,
    }));

    const descriptions: string[] = [];
    for (let i = 0; i < pathNodes.length - 1; i++) {
      const curr = pathNodes[i];
      const next = pathNodes[i + 1];
      const rel = pathRels[i];
      descriptions.push(`${curr.name} (${curr.label}) —[${rel.type}]→ ${next.name} (${next.label})`);
    }

    return {
      startNode: pathNodes[0]?.properties,
      targetNode: pathNodes[pathNodes.length - 1]?.properties,
      length: record.pathLength,
      nodes: pathNodes,
      relationships: pathRels,
      pathDescription: descriptions,
    };
  } catch (err) {
    console.warn("findShortestPath failed:", err);
    return getMockShortestPath(personA, personB);
  }
}

export interface RecommendationOptions {
  userId?: string;
  movieId?: string;
  strategy?: "collaborative" | "social_velocity" | "genre" | "director" | "trope" | "cult_gems";
  category?: string;
  genre?: string;
  director?: string;
  trope?: string;
  excludeIds?: string[];
  limit?: number;
}

export async function getExplainableRecommendations(
  optionsOrUserId: string | RecommendationOptions
): Promise<RecommendationResult[]> {
  const options: RecommendationOptions =
    typeof optionsOrUserId === "string"
      ? { userId: optionsOrUserId, limit: 12 }
      : { limit: 12, ...optionsOrUserId };

  const {
    userId = "u-scifilover",
    movieId,
    strategy = "collaborative",
    genre,
    director,
    trope,
    excludeIds = [],
    limit = 12,
  } = options;

  const driver = getDriver();
  if (!driver) {
    return getMockRecommendations(userId);
  }

  try {
    let query = "";
    const params: Record<string, any> = { userId, movieId, genre, director, trope, excludeIds, limit };

    if (strategy === "social_velocity") {
      // Social Velocity: Movies with highest recent watchlists & high ratings from graph cohort
      query = `
        MATCH (cohort:User)-[r:RATED|SAVED_TO_WATCHLIST]->(rec:Movie)
        WHERE NOT rec.id IN $excludeIds AND r.rating >= 8.0
        OPTIONAL MATCH (rec)<-[:DIRECTED]-(d:Person)
        OPTIONAL MATCH (rec)-[:IN_GENRE]->(g:Genre)
        OPTIONAL MATCH (rec)-[:HAS_TROPE]->(t:Trope)
        WITH rec,
             count(DISTINCT cohort) AS cohortCount,
             collect(DISTINCT cohort.username)[0..3] AS sharedLikers,
             collect(DISTINCT d.name)[0..1] AS directors,
             collect(DISTINCT t.name)[0..3] AS tropes,
             collect(DISTINCT g.name) AS genres,
             avg(r.rating) AS avgCohortRating
        RETURN rec.id AS id,
               rec.title AS title,
               rec.releaseYear AS releaseYear,
               rec.imdbRating AS imdbRating,
               rec.runtime AS runtime,
               rec.posterUrl AS posterUrl,
               rec.backdropUrl AS backdropUrl,
               rec.plotSummary AS plotSummary,
               rec.tagline AS tagline,
               cohortCount,
               sharedLikers,
               ['Popular among movie fans'] AS becauseYouLiked,
               directors,
               tropes,
               genres,
               avgCohortRating
        ORDER BY cohortCount DESC, rec.imdbRating DESC
        LIMIT $limit
      `;
    } else if (movieId) {
      // 1. Direct Movie Anchor Structural Traversal (Rooted at seed movie node)
      query = `
        MATCH (seed:Movie {id: $movieId})
        MATCH (seed)-[:IN_GENRE|HAS_TROPE|DIRECTED]->(bridge)<-[:IN_GENRE|HAS_TROPE|DIRECTED]-(rec:Movie)
        WHERE rec.id <> seed.id AND NOT rec.id IN $excludeIds
        OPTIONAL MATCH (rec)<-[:DIRECTED]-(d:Person)
        OPTIONAL MATCH (rec)-[:IN_GENRE]->(g:Genre)
        OPTIONAL MATCH (rec)-[:HAS_TROPE]->(t:Trope)
        OPTIONAL MATCH (u:User {id: $userId})
        OPTIONAL MATCH (cohort:User)-[cr:RATED]->(rec)
        WHERE (cohort.favoriteGenre = u.favoriteGenre OR cohort.tasteArchetype = u.tasteArchetype)
          AND cr.rating >= 7.5
        WITH rec,
             count(DISTINCT bridge) AS sharedBridges,
             collect(DISTINCT bridge.name)[0..3] AS sharedTraits,
             count(DISTINCT cohort) AS cohortCount,
             collect(DISTINCT cohort.username)[0..3] AS sharedLikers,
             collect(DISTINCT d.name)[0..1] AS directors,
             collect(DISTINCT t.name)[0..3] AS tropes,
             collect(DISTINCT g.name) AS genres,
             avg(cr.rating) AS avgCohortRating
        RETURN rec.id AS id,
               rec.title AS title,
               rec.releaseYear AS releaseYear,
               rec.imdbRating AS imdbRating,
               rec.runtime AS runtime,
               rec.posterUrl AS posterUrl,
               rec.backdropUrl AS backdropUrl,
               rec.plotSummary AS plotSummary,
               rec.tagline AS tagline,
               cohortCount,
               sharedLikers,
               sharedTraits AS becauseYouLiked,
               directors,
               tropes,
               genres,
               avgCohortRating
        ORDER BY sharedBridges DESC, cohortCount DESC, rec.imdbRating DESC
        LIMIT $limit
      `;
    } else if (genre || director || trope) {
      // 2. Multi-Criteria Thematic Query (Combines Director + Tropes + Genre)
      query = `
        MATCH (rec:Movie)
        WHERE NOT rec.id IN $excludeIds
          AND (
            ($genre IS NOT NULL AND EXISTS { (rec)-[:IN_GENRE]->(g:Genre) WHERE toLower(g.name) = toLower($genre) })
            OR ($director IS NOT NULL AND EXISTS { (rec)<-[:DIRECTED]-(d:Person) WHERE toLower(d.name) CONTAINS toLower($director) })
            OR ($trope IS NOT NULL AND EXISTS { (rec)-[:HAS_TROPE]->(t:Trope) WHERE toLower(t.name) CONTAINS toLower($trope) })
          )
        OPTIONAL MATCH (rec)<-[:DIRECTED]-(d:Person)
        OPTIONAL MATCH (rec)-[:IN_GENRE]->(g:Genre)
        OPTIONAL MATCH (rec)-[:HAS_TROPE]->(t:Trope)
        OPTIONAL MATCH (u:User {id: $userId})
        OPTIONAL MATCH (cohort:User)-[cr:RATED]->(rec)
        WHERE (cohort.favoriteGenre = u.favoriteGenre OR cohort.tasteArchetype = u.tasteArchetype)
          AND cr.rating >= 7.5
        WITH rec,
             (CASE WHEN $director IS NOT NULL AND EXISTS { (rec)<-[:DIRECTED]-(d2:Person) WHERE toLower(d2.name) CONTAINS toLower($director) } THEN 6 ELSE 0 END +
              CASE WHEN $genre IS NOT NULL AND EXISTS { (rec)-[:IN_GENRE]->(g2:Genre) WHERE toLower(g2.name) = toLower($genre) } THEN 3 ELSE 0 END +
              CASE WHEN $trope IS NOT NULL AND EXISTS { (rec)-[:HAS_TROPE]->(t2:Trope) WHERE toLower(t2.name) CONTAINS toLower($trope) } THEN 3 ELSE 0 END) AS matchWeight,
             count(DISTINCT cohort) AS cohortCount,
             collect(DISTINCT cohort.username)[0..3] AS sharedLikers,
             collect(DISTINCT d.name)[0..1] AS directors,
             collect(DISTINCT t.name)[0..3] AS tropes,
             collect(DISTINCT g.name) AS genres,
             avg(cr.rating) AS avgCohortRating
        RETURN rec.id AS id,
               rec.title AS title,
               rec.releaseYear AS releaseYear,
               rec.imdbRating AS imdbRating,
               rec.runtime AS runtime,
               rec.posterUrl AS posterUrl,
               rec.backdropUrl AS backdropUrl,
               rec.plotSummary AS plotSummary,
               rec.tagline AS tagline,
               cohortCount,
               sharedLikers,
               [COALESCE($director, $genre, 'Thematic Neighborhood')] AS becauseYouLiked,
               directors,
               tropes,
               genres,
               avgCohortRating
        ORDER BY matchWeight DESC, cohortCount DESC, rec.imdbRating DESC
        LIMIT $limit
      `;
    } else if (strategy === "cult_gems") {
      query = `
        MATCH (rec:Movie)
        WHERE rec.imdbRating >= 8.3 AND NOT rec.id IN $excludeIds
        OPTIONAL MATCH (rec)<-[:DIRECTED]-(d:Person)
        OPTIONAL MATCH (rec)-[:IN_GENRE]->(g:Genre)
        OPTIONAL MATCH (rec)-[:HAS_TROPE]->(t:Trope)
        OPTIONAL MATCH (cohort:User)-[r:RATED]->(rec)
        WITH rec,
             count(DISTINCT cohort) AS cohortCount,
             collect(DISTINCT cohort.username)[0..3] AS sharedLikers,
             collect(DISTINCT d.name)[0..1] AS directors,
             collect(DISTINCT t.name)[0..3] AS tropes,
             collect(DISTINCT g.name) AS genres,
             avg(r.rating) AS avgCohortRating
        RETURN rec.id AS id,
               rec.title AS title,
               rec.releaseYear AS releaseYear,
               rec.imdbRating AS imdbRating,
               rec.runtime AS runtime,
               rec.posterUrl AS posterUrl,
               rec.backdropUrl AS backdropUrl,
               rec.plotSummary AS plotSummary,
               rec.tagline AS tagline,
               cohortCount,
               sharedLikers,
               ['Masterpiece IMDb 8.5+'] AS becauseYouLiked,
               directors,
               tropes,
               genres,
               avgCohortRating
        ORDER BY rec.imdbRating DESC, cohortCount DESC
        LIMIT $limit
      `;
    } else {
      // 3. Archetype-Weighted Persona Traversal (Diverse recommendations per persona)
      query = `
        MATCH (u:User {id: $userId})
        MATCH (rec:Movie)
        WHERE NOT rec.id IN $excludeIds
        OPTIONAL MATCH (rec)<-[:DIRECTED]-(d:Person)
        OPTIONAL MATCH (rec)-[:IN_GENRE]->(g:Genre)
        OPTIONAL MATCH (rec)-[:HAS_TROPE]->(t:Trope)
        OPTIONAL MATCH (cohort:User)-[recRel:RATED]->(rec)
        WHERE cohort.id <> u.id 
          AND (cohort.favoriteGenre = u.favoriteGenre OR cohort.tasteArchetype = u.tasteArchetype)
          AND recRel.rating >= 7.5
        WITH u, rec,
             count(DISTINCT cohort) AS cohortCount,
             collect(DISTINCT cohort.username)[0..3] AS sharedLikers,
             collect(DISTINCT d.name)[0..1] AS directors,
             collect(DISTINCT t.name)[0..3] AS tropes,
             collect(DISTINCT g.name) AS genres,
             avg(recRel.rating) AS avgCohortRating
        WITH u, rec, cohortCount, sharedLikers, directors, tropes, genres, avgCohortRating,
             (CASE WHEN u.favoriteGenre IN genres THEN 15 ELSE 0 END +
              CASE WHEN any(tName IN tropes WHERE toLower(tName) CONTAINS toLower(u.tasteArchetype) OR toLower(u.tasteArchetype) CONTAINS toLower(tName)) THEN 10 ELSE 0 END +
              CASE WHEN u.tasteArchetype = 'Indie Surrealism' AND any(tName IN tropes WHERE tName IN ['Surrealism', 'Multiverse', 'In-Yun Destiny', 'Social Stratification', 'Unreliable Narrator', 'Cosmic Dread']) THEN 15 ELSE 0 END +
              CASE WHEN u.tasteArchetype = 'Mind-Bending' AND any(tName IN tropes WHERE tName IN ['Time Dilation', 'Sentient AI', 'Non-Linear Timeline', 'Cosmic Dread', 'Multiverse']) THEN 10 ELSE 0 END +
              CASE WHEN u.tasteArchetype = 'Crime Noir' AND any(tName IN tropes WHERE tName IN ['Neo-Noir', 'Morally Ambiguous Antihero', 'Heist', 'Social Stratification']) THEN 10 ELSE 0 END) AS personaAffinityBonus
        WHERE personaAffinityBonus > 0
        RETURN rec.id AS id,
               rec.title AS title,
               rec.releaseYear AS releaseYear,
               rec.imdbRating AS imdbRating,
               rec.runtime AS runtime,
               rec.posterUrl AS posterUrl,
               rec.backdropUrl AS backdropUrl,
               rec.plotSummary AS plotSummary,
               rec.tagline AS tagline,
               cohortCount,
               sharedLikers,
               [u.favoriteGenre + ' fans'] AS becauseYouLiked,
               directors,
               tropes,
               genres,
               avgCohortRating
        ORDER BY personaAffinityBonus DESC, cohortCount DESC, rec.imdbRating DESC
        LIMIT $limit
      `;
    }

    const result = await runCypher(query, params);

    if (result.records.length === 0) {
      return getMockRecommendations(userId);
    }

    return result.records.map((r: any) => {
      const cohortCount = Number(r.cohortCount || 1);
      const affinityScore = Math.min(99, Math.round(84 + Math.min(15, cohortCount * 1.5)));
      const reasons: string[] = [];
      if (r.directors?.length) reasons.push(`Directed by ${r.directors[0]}`);
      if (r.tropes?.length) reasons.push(`Themes: ${r.tropes.slice(0, 2).join(", ")}`);
      if (r.becauseYouLiked?.length) reasons.push(`Recommended for ${r.becauseYouLiked.join(" & ")}`);

      return {
        movie: {
          id: r.id,
          title: r.title,
          releaseYear: r.releaseYear,
          imdbRating: r.imdbRating,
          runtime: r.runtime || 140,
          posterUrl: r.posterUrl || "https://image.tmdb.org/t/p/w780/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
          backdropUrl: r.backdropUrl || "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s520b4q.jpg",
          plotSummary: r.plotSummary || "",
          tagline: r.tagline || "",
        },
        affinityScore,
        genres: r.genres || [],
        director: r.directors?.[0] || "Acclaimed Director",
        actors: [],
        tropes: r.tropes || [],
        reason: reasons.length ? reasons.join(" • ") : "Highly rated by viewers with similar taste.",
        connectedFrom: r.becauseYouLiked || ["Liked films in your collection"],
        graphPathHops: 3,
        cohortOverlap: cohortCount,
        sharedLikers: r.sharedLikers || [],
      };
    });
  } catch (err) {
    console.warn("getExplainableRecommendations failed:", err);
    return getMockRecommendations(userId);
  }
}

export async function getCollaboratorCliques(): Promise<CollaboratorClique[]> {
  const driver = getDriver();
  if (!driver) {
    return getMockCollaborators();
  }

  try {
    const query = `
      MATCH (d:Person)-[:DIRECTED]->(m:Movie)<-[:ACTED_IN]-(a:Person)
      WHERE d.id <> a.id
      WITH d, a, count(m) AS collaborations, collect(m) AS movieNodes, avg(m.imdbRating) AS avgRating
      WHERE collaborations >= 2
      RETURN d.properties AS director,
             a.properties AS collaborator,
             collaborations,
             avgRating,
             [m IN movieNodes | { id: m.id, title: m.title, releaseYear: m.releaseYear, rating: m.imdbRating }] AS movies
      ORDER BY collaborations DESC, avgRating DESC
      LIMIT 8
    `;

    const result = await runCypher(query);
    if (result.records.length === 0) {
      return getMockCollaborators();
    }

    return result.records.map((r: any) => ({
      director: r.director,
      collaborator: r.collaborator,
      collaborationsCount: Number(r.collaborations),
      avgRating: Number(Number(r.avgRating).toFixed(1)),
      movies: r.movies,
    }));
  } catch (err) {
    console.warn("getCollaboratorCliques failed:", err);
    return getMockCollaborators();
  }
}
