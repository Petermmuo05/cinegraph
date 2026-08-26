import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();
import neo4j from "neo4j-driver";
import seedData from "./seed-data.json";

async function main() {
  console.log("\n=======================================================");
  console.log("🎬 CineGraph: CognoDB Database Seeding & Schema Engine");
  console.log("=======================================================\n");

  const uri = process.env.COGNODB_URI;
  const user = process.env.COGNODB_USER || "cognodb";
  const password = process.env.COGNODB_PASSWORD;

  if (!uri || !password) {
    console.error("❌ ERROR: Missing COGNODB_URI or COGNODB_PASSWORD in .env.local / environment.");
    console.error("Please configure your CognoDB Bolt credentials.");
    process.exit(1);
  }

  console.log(`Connecting to CognoDB instance: ${uri}...`);
  const driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
    maxConnectionPoolSize: 20,
    disableLosslessIntegers: true,
  });

  const session = driver.session();

  try {
    // 1. Verify connectivity
    const pingStart = Date.now();
    await session.run("RETURN 1 AS ping");
    console.log(`✅ Handshake successful! Latency: ${Date.now() - pingStart}ms\n`);

    // 2. Clear existing database
    console.log("🧹 Clearing existing graph data...");
    await session.run("MATCH (n) DETACH DELETE n");
    console.log("✅ Graph cleared.\n");

    // 3. Batch Create Genres
    console.log(`📦 Seeding ${seedData.genres.length} Genres...`);
    await session.run(
      `
      UNWIND $genres AS g
      CREATE (:Genre {
        id: g.id,
        name: g.name,
        colorHex: g.colorHex,
        icon: g.icon
      })
      `,
      { genres: seedData.genres }
    );

    // 4. Batch Create Tropes
    console.log(`📦 Seeding ${seedData.tropes.length} Tropes...`);
    await session.run(
      `
      UNWIND $tropes AS t
      CREATE (:Trope {
        id: t.id,
        name: t.name,
        category: t.category,
        description: t.description
      })
      `,
      { tropes: seedData.tropes }
    );

    // 5. Batch Create Studios
    const studiosList = (seedData as any).studios || [];
    console.log(`📦 Seeding ${studiosList.length} Studios...`);
    await session.run(
      `
      UNWIND $studios AS s
      CREATE (:Studio {
        id: s.id,
        name: s.name,
        foundedYear: s.foundedYear,
        logoUrl: s.logoUrl
      })
      `,
      { studios: studiosList }
    );

    // 6. Batch Create Franchises
    const franchisesList = (seedData as any).franchises || [];
    console.log(`📦 Seeding ${franchisesList.length} Franchises...`);
    await session.run(
      `
      UNWIND $franchises AS f
      CREATE (:Franchise {
        id: f.id,
        name: f.name,
        universe: f.universe,
        totalGross: f.totalGross
      })
      `,
      { franchises: franchisesList }
    );

    // 7. Batch Create People (Actors & Directors)
    console.log(`📦 Seeding ${seedData.people.length} People (Directors, Actors, Composers)...`);
    await session.run(
      `
      UNWIND $people AS p
      CREATE (:Person {
        id: p.id,
        name: p.name,
        bornYear: p.bornYear,
        photoUrl: p.photoUrl,
        primaryRole: p.primaryRole,
        bio: p.bio
      })
      `,
      { people: seedData.people }
    );

    // 8. Batch Create Movies
    console.log(`📦 Seeding ${seedData.movies.length} Movies...`);
    await session.run(
      `
      UNWIND $movies AS m
      CREATE (:Movie {
        id: m.id,
        title: m.title,
        releaseYear: m.releaseYear,
        runtime: m.runtime,
        imdbRating: m.imdbRating,
        posterUrl: m.posterUrl,
        backdropUrl: m.backdropUrl,
        budget: m.budget,
        boxOffice: m.boxOffice,
        plotSummary: m.plotSummary,
        tagline: m.tagline,
        featured: m.featured
      })
      `,
      { movies: seedData.movies }
    );

    // 9. Batch Create Users
    console.log(`📦 Seeding ${seedData.users.length} Users...`);
    await session.run(
      `
      UNWIND $users AS u
      CREATE (:User {
        id: u.id,
        username: u.username,
        avatarUrl: u.avatarUrl,
        bio: u.bio,
        favoriteGenre: u.favoriteGenre
      })
      `,
      { users: seedData.users }
    );

    // 10. Relationships: DIRECTED
    console.log("🔗 Linking DIRECTED relationships...");
    await session.run(
      `
      UNWIND $rels AS r
      MATCH (p:Person {id: r.personId})
      MATCH (m:Movie {id: r.movieId})
      CREATE (p)-[:DIRECTED {creditedAs: r.creditedAs}]->(m)
      `,
      { rels: seedData.relationships.DIRECTED }
    );

    // 11. Relationships: ACTED_IN
    console.log("🔗 Linking ACTED_IN relationships...");
    await session.run(
      `
      UNWIND $rels AS r
      MATCH (p:Person {id: r.personId})
      MATCH (m:Movie {id: r.movieId})
      CREATE (p)-[:ACTED_IN {characterName: r.characterName, billingOrder: r.billingOrder}]->(m)
      `,
      { rels: seedData.relationships.ACTED_IN }
    );

    // 12. Relationships: COMPOSED_BY
    console.log("🔗 Linking COMPOSED_BY relationships...");
    await session.run(
      `
      UNWIND $rels AS r
      MATCH (p:Person {id: r.personId})
      MATCH (m:Movie {id: r.movieId})
      CREATE (p)-[:COMPOSED_BY]->(m)
      `,
      { rels: (seedData.relationships as any).COMPOSED_BY || [] }
    );

    // 13. Relationships: IN_GENRE
    console.log("🔗 Linking IN_GENRE relationships...");
    await session.run(
      `
      UNWIND $rels AS r
      MATCH (m:Movie {id: r.movieId})
      MATCH (g:Genre {id: r.genreId})
      CREATE (m)-[:IN_GENRE]->(g)
      `,
      { rels: (seedData.relationships as any).IN_GENRE || [] }
    );

    // 14. Relationships: HAS_TROPE
    console.log("🔗 Linking HAS_TROPE relationships...");
    await session.run(
      `
      UNWIND $rels AS r
      MATCH (m:Movie {id: r.movieId})
      MATCH (t:Trope {id: r.tropeId})
      CREATE (m)-[:HAS_TROPE]->(t)
      `,
      { rels: (seedData.relationships as any).HAS_TROPE || [] }
    );

    // 15. Relationships: PART_OF
    console.log("🔗 Linking PART_OF relationships...");
    await session.run(
      `
      UNWIND $rels AS r
      MATCH (m:Movie {id: r.movieId})
      MATCH (f:Franchise {id: r.franchiseId})
      CREATE (m)-[:PART_OF {chronologicalOrder: r.chronologicalOrder}]->(f)
      `,
      { rels: (seedData.relationships as any).PART_OF || [] }
    );

    // 16. Relationships: PRODUCED_BY
    console.log("🔗 Linking PRODUCED_BY relationships...");
    await session.run(
      `
      UNWIND $rels AS r
      MATCH (m:Movie {id: r.movieId})
      MATCH (s:Studio {id: r.studioId})
      CREATE (m)-[:PRODUCED_BY]->(s)
      `,
      { rels: (seedData.relationships as any).PRODUCED_BY || [] }
    );

    // 17. Relationships: RATED
    console.log("🔗 Linking RATED user feedback relationships...");
    await session.run(
      `
      UNWIND $rels AS r
      MATCH (u:User {id: r.userId})
      MATCH (m:Movie {id: r.movieId})
      CREATE (u)-[:RATED {rating: r.rating, review: r.review}]->(m)
      `,
      { rels: (seedData.relationships as any).RATED || [] }
    );

    // 18. Sanity check counts
    const nodeCountRes = await session.run("MATCH (n) RETURN count(n) AS nodes");
    const edgeCountRes = await session.run("MATCH ()-[r]->() RETURN count(r) AS edges");
    const nodes = nodeCountRes.records[0].get("nodes");
    const edges = edgeCountRes.records[0].get("edges");

    console.log("\n=======================================================");
    console.log("🎉 Seeding Completed Successfully!");
    console.log(`📊 Total Nodes in CognoDB: ${nodes}`);
    console.log(`🔗 Total Relationships: ${edges}`);
    console.log("=======================================================\n");
  } catch (error: any) {
    console.error("\n❌ Seeding failed with error:", error);
    process.exit(1);
  } finally {
    await session.close();
    await driver.close();
  }
}

main();
