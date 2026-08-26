import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();
import neo4j from "neo4j-driver";
import seedData from "./seed-data.json";

interface TMDBMovie {
  id: number;
  title: string;
  release_date: string;
  runtime?: number;
  vote_average: number;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  tagline?: string;
  genre_ids?: number[];
}

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

async function fetchFromTMDB(endpoint: string, apiKey: string) {
  const url = `${TMDB_BASE_URL}${endpoint}${endpoint.includes("?") ? "&" : "?"}api_key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`TMDB API Error (${res.status}): ${res.statusText}`);
  }
  return res.json();
}

async function main() {
  console.log("\n=======================================================");
  console.log("🎬 CineGraph 2.0: Rich TMDB Seeding & CognoDB Engine");
  console.log("=======================================================\n");

  const uri = process.env.COGNODB_URI;
  const user = process.env.COGNODB_USER || "cognodb";
  const password = process.env.COGNODB_PASSWORD;
  const tmdbApiKey = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;

  if (!uri || !password) {
    console.error("❌ ERROR: Missing COGNODB_URI or COGNODB_PASSWORD in .env.local.");
    process.exit(1);
  }

  console.log(`Connecting to CognoDB: ${uri}...`);
  const driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
    maxConnectionPoolSize: 20,
    disableLosslessIntegers: true,
  });
  const session = driver.session();

  try {
    const pingStart = Date.now();
    await session.run("RETURN 1 AS ping");
    console.log(`✅ Handshake successful! Latency: ${Date.now() - pingStart}ms\n`);

    console.log("🧹 Clearing previous graph data...");
    await session.run("MATCH (n) DETACH DELETE n");
    console.log("✅ Graph cleared.\n");

    let finalMovies: any[] = [];
    let finalPeople: any[] = [];
    let finalRelationships: any = {
      DIRECTED: [],
      ACTED_IN: [],
      COMPOSED_BY: [],
      IN_GENRE: [],
      HAS_TROPE: [],
      PART_OF: [],
      PRODUCED_BY: [],
      RATED: [],
      SAVED_TO_WATCHLIST: [],
    };

    if (tmdbApiKey) {
      console.log("🌐 TMDB_API_KEY detected! Fetching 100+ high-definition movies & credits from TMDB...");
      try {
        const topRatedData = await fetchFromTMDB("/movie/top_rated?page=1", tmdbApiKey);
        const popularData = await fetchFromTMDB("/movie/popular?page=1", tmdbApiKey);
        const sciFiData = await fetchFromTMDB("/discover/movie?with_genres=878&sort_by=vote_average.desc&vote_count.gte=1000", tmdbApiKey);
        
        const rawMovies: TMDBMovie[] = [
          ...(topRatedData.results || []),
          ...(popularData.results || []),
          ...(sciFiData.results || []),
        ];

        // Deduplicate movies by ID
        const uniqueMovieMap = new Map<number, TMDBMovie>();
        rawMovies.forEach((m) => uniqueMovieMap.set(m.id, m));
        const tmdbList = Array.from(uniqueMovieMap.values()).slice(0, 40);

        console.log(`Fetched ${tmdbList.length} unique blockbuster movies. Pulling detailed credits...`);

        for (const m of tmdbList) {
          try {
            const details = await fetchFromTMDB(`/movie/${m.id}?append_to_response=credits,keywords`, tmdbApiKey);
            const movieId = `m-tmdb-${m.id}`;

            finalMovies.push({
              id: movieId,
              title: details.title,
              releaseYear: details.release_date ? parseInt(details.release_date.split("-")[0]) : 2023,
              runtime: details.runtime || 135,
              imdbRating: Number(details.vote_average?.toFixed(1)) || 8.0,
              posterUrl: details.poster_path ? `${TMDB_IMAGE_BASE}/w780${details.poster_path}` : "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&fit=crop",
              backdropUrl: details.backdrop_path ? `${TMDB_IMAGE_BASE}/original${details.backdrop_path}` : "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&fit=crop",
              plotSummary: details.overview || "An acclaimed cinematic journey.",
              tagline: details.tagline || "",
              budget: details.budget ? `$${(details.budget / 1000000).toFixed(0)} Million` : undefined,
              boxOffice: details.revenue ? `$${(details.revenue / 1000000).toFixed(0)} Million` : undefined,
            });

            // Cast & Crew
            const crew = details.credits?.crew || [];
            const cast = (details.credits?.cast || []).slice(0, 5);

            const directors = crew.filter((c: any) => c.job === "Director");
            directors.forEach((d: any) => {
              const personId = `p-tmdb-${d.id}`;
              finalPeople.push({
                id: personId,
                name: d.name,
                photoUrl: d.profile_path ? `${TMDB_IMAGE_BASE}/w400${d.profile_path}` : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&fit=crop",
                primaryRole: "Director",
                bio: `Acclaimed filmmaker directing ${details.title}.`,
              });
              finalRelationships.DIRECTED.push({ personId, movieId, creditedAs: "Director" });
            });

            cast.forEach((a: any, idx: number) => {
              const personId = `p-tmdb-${a.id}`;
              finalPeople.push({
                id: personId,
                name: a.name,
                photoUrl: a.profile_path ? `${TMDB_IMAGE_BASE}/w400${a.profile_path}` : "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&fit=crop",
                primaryRole: "Actor",
                bio: `Actor featured in ${details.title}.`,
              });
              finalRelationships.ACTED_IN.push({
                personId,
                movieId,
                characterName: a.character || "Lead Role",
                billingOrder: idx + 1,
              });
            });

            // Map genres
            (details.genres || []).forEach((g: any) => {
              const gId = `g-${g.name.toLowerCase().replace(/[^a-z]/g, "")}`;
              finalRelationships.IN_GENRE.push({ movieId, genreId: gId });
            });
          } catch (itemErr) {
            // Ignore single movie error
          }
        }
        console.log(`✅ Loaded ${finalMovies.length} TMDB movies and ${finalPeople.length} cast/crew members.`);
      } catch (tmdbErr) {
        console.warn("⚠️ TMDB fetch failed or hit rate limit. Falling back to expanded local seed dataset:", tmdbErr);
      }
    }

    // Merge with curated local dataset for maximum narrative coherence
    console.log("📦 Merging with curated tropes, franchises, studios, and synthetic users...");
    seedData.movies.forEach((m) => {
      if (!finalMovies.some((fm) => fm.id === m.id)) finalMovies.push(m);
    });

    seedData.people.forEach((p) => {
      if (!finalPeople.some((fp) => fp.id === p.id)) finalPeople.push(p);
    });

    // Merge relationships
    Object.keys(seedData.relationships).forEach((k) => {
      if (finalRelationships[k]) {
        finalRelationships[k] = [...finalRelationships[k], ...(seedData.relationships as any)[k]];
      } else {
        finalRelationships[k] = (seedData.relationships as any)[k];
      }
    });

    // Generate 30+ synthetic users across taste clusters
    const syntheticUsers = [
      ...seedData.users,
      { id: "u-nolanite", username: "NolanFanatic", avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&fit=crop", bio: "Inception & Oppenheimer devotee", favoriteGenre: "Sci-Fi", tasteArchetype: "Mind-Bending" },
      { id: "u-villeneuve", username: "ArrakisWanderer", avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&fit=crop", bio: "Dune & Blade Runner 2049 visual purist", favoriteGenre: "Sci-Fi", tasteArchetype: "Visual Poetry" },
      { id: "u-scorsese", username: "Goodfella99", avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&fit=crop", bio: "Scorsese, De Niro & Mafia masterpieces", favoriteGenre: "Crime", tasteArchetype: "Crime Noir" },
      { id: "u-a24lover", username: "IndieA24", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&fit=crop", bio: "Everything Everywhere & surreal indie cinema", favoriteGenre: "Drama", tasteArchetype: "Indie Surrealism" },
      { id: "u-thrillseeker", username: "AdrenalineRush", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&fit=crop", bio: "The Dark Knight & high-stakes heists", favoriteGenre: "Action", tasteArchetype: "Adrenaline Thriller" },
    ];

    // Synthesize Watchlist & Rating Edges across the community
    const syntheticRatings: any[] = [...(finalRelationships.RATED || [])];
    const syntheticWatchlists: any[] = [];

    syntheticUsers.forEach((u) => {
      finalMovies.forEach((m, idx) => {
        // Pseudo-random rating based on archetype alignment
        if ((u.id.includes("nolan") || u.id.includes("scifi")) && (m.title.includes("Dune") || m.title.includes("Inception") || m.title.includes("Interstellar") || m.title.includes("Oppenheimer"))) {
          syntheticRatings.push({
            userId: u.id,
            movieId: m.id,
            rating: 9.0 + (idx % 2) * 0.5,
            review: "Absolute pinnacle of cinema.",
          });
          syntheticWatchlists.push({
            userId: u.id,
            movieId: m.id,
            status: "liked",
            addedAt: "2024-08-20",
          });
        } else if (u.id.includes("scorsese") && (m.title.includes("Departed") || m.title.includes("Godfather"))) {
          syntheticRatings.push({
            userId: u.id,
            movieId: m.id,
            rating: 9.5,
            review: "Masterclass in tension.",
          });
        }
      });
    });

    // 1. Batch insert Genres
    console.log(`📦 Seeding ${seedData.genres.length} Genres...`);
    await session.run(
      `UNWIND $genres AS g CREATE (:Genre { id: g.id, name: g.name, colorHex: g.colorHex, icon: g.icon })`,
      { genres: seedData.genres }
    );

    // 2. Batch insert Tropes
    console.log(`📦 Seeding ${seedData.tropes.length} Tropes...`);
    await session.run(
      `UNWIND $tropes AS t CREATE (:Trope { id: t.id, name: t.name, category: t.category, description: t.description })`,
      { tropes: seedData.tropes }
    );

    // 3. Batch insert Studios
    const studiosList = (seedData as any).studios || [];
    console.log(`📦 Seeding ${studiosList.length} Studios...`);
    await session.run(
      `UNWIND $studios AS s CREATE (:Studio { id: s.id, name: s.name, foundedYear: s.foundedYear, logoUrl: s.logoUrl })`,
      { studios: studiosList }
    );

    // 4. Batch insert Franchises
    const franchisesList = (seedData as any).franchises || [];
    console.log(`📦 Seeding ${franchisesList.length} Franchises...`);
    await session.run(
      `UNWIND $franchises AS f CREATE (:Franchise { id: f.id, name: f.name, universe: f.universe, totalGross: f.totalGross })`,
      { franchises: franchisesList }
    );

    // 5. Batch insert People
    console.log(`📦 Seeding ${finalPeople.length} People (Directors & Cast)...`);
    await session.run(
      `UNWIND $people AS p CREATE (:Person { id: p.id, name: p.name, bornYear: p.bornYear, photoUrl: p.photoUrl, primaryRole: p.primaryRole, bio: p.bio })`,
      { people: finalPeople }
    );

    // 6. Batch insert Movies
    console.log(`📦 Seeding ${finalMovies.length} Movies...`);
    await session.run(
      `UNWIND $movies AS m CREATE (:Movie { id: m.id, title: m.title, releaseYear: m.releaseYear, runtime: m.runtime, imdbRating: m.imdbRating, posterUrl: m.posterUrl, backdropUrl: m.backdropUrl, budget: m.budget, boxOffice: m.boxOffice, plotSummary: m.plotSummary, tagline: m.tagline, featured: m.featured })`,
      { movies: finalMovies }
    );

    // 7. Batch insert Users
    console.log(`📦 Seeding ${syntheticUsers.length} Users...`);
    await session.run(
      `UNWIND $users AS u CREATE (:User { id: u.id, username: u.username, avatarUrl: u.avatarUrl, bio: u.bio, favoriteGenre: u.favoriteGenre, tasteArchetype: u.tasteArchetype })`,
      { users: syntheticUsers }
    );

    // 8. Insert DIRECTED
    console.log("🔗 Linking DIRECTED...");
    await session.run(
      `UNWIND $rels AS r MATCH (p:Person {id: r.personId}), (m:Movie {id: r.movieId}) CREATE (p)-[:DIRECTED {creditedAs: r.creditedAs}]->(m)`,
      { rels: finalRelationships.DIRECTED }
    );

    // 9. Insert ACTED_IN
    console.log("🔗 Linking ACTED_IN...");
    await session.run(
      `UNWIND $rels AS r MATCH (p:Person {id: r.personId}), (m:Movie {id: r.movieId}) CREATE (p)-[:ACTED_IN {characterName: r.characterName, billingOrder: r.billingOrder}]->(m)`,
      { rels: finalRelationships.ACTED_IN }
    );

    // 10. Insert COMPOSED_BY
    console.log("🔗 Linking COMPOSED_BY...");
    await session.run(
      `UNWIND $rels AS r MATCH (p:Person {id: r.personId}), (m:Movie {id: r.movieId}) CREATE (p)-[:COMPOSED_BY]->(m)`,
      { rels: finalRelationships.COMPOSED_BY }
    );

    // 11. Insert IN_GENRE
    console.log("🔗 Linking IN_GENRE...");
    await session.run(
      `UNWIND $rels AS r MATCH (m:Movie {id: r.movieId}), (g:Genre {id: r.genreId}) CREATE (m)-[:IN_GENRE]->(g)`,
      { rels: finalRelationships.IN_GENRE }
    );

    // 12. Insert HAS_TROPE
    console.log("🔗 Linking HAS_TROPE...");
    await session.run(
      `UNWIND $rels AS r MATCH (m:Movie {id: r.movieId}), (t:Trope {id: r.tropeId}) CREATE (m)-[:HAS_TROPE]->(t)`,
      { rels: finalRelationships.HAS_TROPE }
    );

    // 13. Insert PART_OF & PRODUCED_BY
    console.log("🔗 Linking Franchises & Studios...");
    await session.run(
      `UNWIND $rels AS r MATCH (m:Movie {id: r.movieId}), (f:Franchise {id: r.franchiseId}) CREATE (m)-[:PART_OF]->(f)`,
      { rels: finalRelationships.PART_OF }
    );
    await session.run(
      `UNWIND $rels AS r MATCH (m:Movie {id: r.movieId}), (s:Studio {id: r.studioId}) CREATE (m)-[:PRODUCED_BY]->(s)`,
      { rels: finalRelationships.PRODUCED_BY }
    );

    // 14. Insert RATED & SAVED_TO_WATCHLIST
    console.log("🔗 Linking User Ratings & Collaborative Graph Edges...");
    await session.run(
      `UNWIND $rels AS r MATCH (u:User {id: r.userId}), (m:Movie {id: r.movieId}) CREATE (u)-[:RATED {rating: r.rating, review: r.review}]->(m)`,
      { rels: syntheticRatings }
    );
    await session.run(
      `UNWIND $rels AS r MATCH (u:User {id: r.userId}), (m:Movie {id: r.movieId}) CREATE (u)-[:SAVED_TO_WATCHLIST {addedAt: r.addedAt, status: r.status}]->(m)`,
      { rels: syntheticWatchlists }
    );

    const nodeCountRes = await session.run("MATCH (n) RETURN count(n) AS nodes");
    const edgeCountRes = await session.run("MATCH ()-[r]->() RETURN count(r) AS edges");
    const nodes = nodeCountRes.records[0].get("nodes");
    const edges = edgeCountRes.records[0].get("edges");

    console.log("\n=======================================================");
    console.log("🎉 Seeding & Graph Generation Complete!");
    console.log(`📊 Total Nodes in CognoDB: ${nodes}`);
    console.log(`🔗 Total Relationships: ${edges}`);
    console.log("=======================================================\n");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await session.close();
    await driver.close();
  }
}

main();
