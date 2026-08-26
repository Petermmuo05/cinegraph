import seedData from "../../scripts/seed-data.json";
import { GraphData, GraphNode, GraphEdge, RecommendationResult, ShortestPathResult, CollaboratorClique } from "@/types";

// Transform seed data into standard GraphData format
export const mockGraphData: GraphData = (() => {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // Add Genres
  (seedData.genres || []).forEach((g) => {
    nodes.push({
      id: g.id,
      label: "Genre",
      name: g.name,
      color: g.colorHex,
      size: 18,
      properties: g,
    });
  });

  // Add Tropes
  (seedData.tropes || []).forEach((t) => {
    nodes.push({
      id: t.id,
      label: "Trope",
      name: t.name,
      color: "#EC4899",
      size: 14,
      properties: t,
    });
  });

  // Add Studios
  (((seedData as any).studios as any[]) || []).forEach((s) => {
    nodes.push({
      id: s.id,
      label: "Studio",
      name: s.name,
      color: "#F59E0B",
      size: 16,
      properties: s,
    });
  });

  // Add Franchises
  (((seedData as any).franchises as any[]) || []).forEach((f) => {
    nodes.push({
      id: f.id,
      label: "Franchise",
      name: f.name,
      color: "#8B5CF6",
      size: 20,
      properties: f,
    });
  });

  // Add People
  (seedData.people || []).forEach((p) => {
    nodes.push({
      id: p.id,
      label: "Person",
      name: p.name,
      color: p.primaryRole === "Director" ? "#34D399" : "#10B981",
      size: p.primaryRole === "Director" ? 22 : 18,
      properties: p,
    });
  });

  // Add Movies
  seedData.movies.forEach((m) => {
    nodes.push({
      id: m.id,
      label: "Movie",
      title: m.title,
      name: m.title,
      color: "#3B82F6",
      size: 26,
      properties: m,
    });
  });

  // Add Users
  seedData.users.forEach((u) => {
    nodes.push({
      id: u.id,
      label: "User",
      name: u.username,
      color: "#F43F5E",
      size: 16,
      properties: u,
    });
  });

  // Add Edges
  const rels = (seedData.relationships as any) || {};

  (rels.DIRECTED || []).forEach((r: any, idx: number) => {
    edges.push({
      id: `e-dir-${idx}`,
      source: r.personId,
      target: r.movieId,
      type: "DIRECTED",
      label: "Directed",
      properties: { creditedAs: r.creditedAs },
    });
  });

  (rels.ACTED_IN || []).forEach((r: any, idx: number) => {
    edges.push({
      id: `e-act-${idx}`,
      source: r.personId,
      target: r.movieId,
      type: "ACTED_IN",
      label: "Acted in",
      properties: { characterName: r.characterName, billingOrder: r.billingOrder },
    });
  });

  (rels.COMPOSED_BY || []).forEach((r: any, idx: number) => {
    edges.push({
      id: `e-comp-${idx}`,
      source: r.personId,
      target: r.movieId,
      type: "COMPOSED_BY",
      label: "Scored",
    });
  });

  (rels.IN_GENRE || []).forEach((r: any, idx: number) => {
    edges.push({
      id: `e-gen-${idx}`,
      source: r.movieId,
      target: r.genreId,
      type: "IN_GENRE",
      label: "In Genre",
    });
  });

  (rels.HAS_TROPE || []).forEach((r: any, idx: number) => {
    edges.push({
      id: `e-trope-${idx}`,
      source: r.movieId,
      target: r.tropeId,
      type: "HAS_TROPE",
      label: "Has Trope",
    });
  });

  (rels.PART_OF || []).forEach((r: any, idx: number) => {
    edges.push({
      id: `e-fran-${idx}`,
      source: r.movieId,
      target: r.franchiseId,
      type: "PART_OF",
      label: "Part of",
    });
  });

  (rels.PRODUCED_BY || []).forEach((r: any, idx: number) => {
    edges.push({
      id: `e-prod-${idx}`,
      source: r.movieId,
      target: r.studioId,
      type: "PRODUCED_BY",
      label: "Produced by",
    });
  });

  (rels.RATED || []).forEach((r: any, idx: number) => {
    edges.push({
      id: `e-rate-${idx}`,
      source: r.userId,
      target: r.movieId,
      type: "RATED",
      label: `Rated ${r.rating}★`,
      properties: { rating: r.rating, review: r.review },
    });
  });

  return { nodes, edges };
})();

function getSeedMovie(id: string, fallbackTitle: string, fallbackPoster: string, rating: number = 8.5) {
  const found = (seedData.movies || []).find((m: any) => m.id === id);
  if (found) return found;
  return {
    id,
    title: fallbackTitle,
    releaseYear: 2020,
    imdbRating: rating,
    runtime: 140,
    posterUrl: fallbackPoster,
    backdropUrl: fallbackPoster,
    plotSummary: `Acclaimed masterpiece ${fallbackTitle} exhibiting deep cinematic resonance.`,
    tagline: "A celebrated classic.",
    featured: true,
  };
}

export function getMockRecommendations(userId: string = "u-scifilover"): RecommendationResult[] {
  if (userId === "u-cinephile") {
    return [
      {
        movie: getSeedMovie("m-godfather", "The Godfather", "https://image.tmdb.org/t/p/w780/3bhkrj58Vtu7enYsRolD1fZdja1.jpg", 9.2) as any,
        affinityScore: 99,
        genres: ["Crime", "Drama"],
        director: "Francis Ford Coppola",
        actors: ["Marlon Brando", "Al Pacino"],
        tropes: ["Rise and Fall Trajectory", "Morally Ambiguous Antihero"],
        reason: "Highest affinity match: Crime Noir Godfather archetype + 3 Shared Tropes with Goodfellas.",
        connectedFrom: ["Goodfellas", "The Departed"],
        graphPathHops: 2,
      },
      {
        movie: getSeedMovie("m-godfather2", "The Godfather Part II", "https://image.tmdb.org/t/p/w780/hek3koDUyRQk7FIhPXsa6mT2Zc3.jpg", 9.0) as any,
        affinityScore: 97,
        genres: ["Crime", "Drama"],
        director: "Francis Ford Coppola",
        actors: ["Al Pacino", "Robert De Niro"],
        tropes: ["Rise and Fall Trajectory", "Dual Timeline Narrative"],
        reason: "Direct thematic continuation: Shared Director Francis Ford Coppola + Mafia Crime Network.",
        connectedFrom: ["The Godfather"],
        graphPathHops: 1,
      },
      {
        movie: getSeedMovie("m-goodfellas", "Goodfellas", "https://image.tmdb.org/t/p/w780/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg", 8.7) as any,
        affinityScore: 95,
        genres: ["Crime", "Drama"],
        director: "Martin Scorsese",
        actors: ["Robert De Niro", "Ray Liotta"],
        tropes: ["Rise and Fall Trajectory", "Voiceover Narration"],
        reason: "Scorsese Masterpiece: High overlap with Crime Noir cinephile ratings & antihero character arcs.",
        connectedFrom: ["The Departed"],
        graphPathHops: 2,
      },
      {
        movie: getSeedMovie("m-pulpfiction", "Pulp Fiction", "https://image.tmdb.org/t/p/w780/vQWk5YBFWF4bZaofAbv0tShwBvQ.jpg", 8.9) as any,
        affinityScore: 94,
        genres: ["Crime", "Drama"],
        director: "Quentin Tarantino",
        actors: ["John Travolta", "Samuel L. Jackson"],
        tropes: ["Non-Linear Timeline", "Morally Ambiguous Antihero"],
        reason: "Auteur Vision: Non-linear crime anthology with high collaborative rating overlap.",
        connectedFrom: ["The Departed", "Se7en"],
        graphPathHops: 3,
      },
      {
        movie: getSeedMovie("m-departed", "The Departed", "https://image.tmdb.org/t/p/w780/nT97ifVT2J1yMQmeq20Qblg61T.jpg", 8.5) as any,
        affinityScore: 92,
        genres: ["Crime", "Drama", "Thriller"],
        director: "Martin Scorsese",
        actors: ["Leonardo DiCaprio", "Matt Damon", "Jack Nicholson"],
        tropes: ["Undercover Mole", "Morally Ambiguous Antihero"],
        reason: "Directed by Martin Scorsese + High collaborative rating from Crime & Noir cohort.",
        connectedFrom: ["Goodfellas"],
        graphPathHops: 2,
      },
      {
        movie: getSeedMovie("m-heat", "Heat", "https://image.tmdb.org/t/p/w780/umXk3jYJtB44p8l1Mh4a2aO3k6T.jpg", 8.3) as any,
        affinityScore: 90,
        genres: ["Crime", "Action", "Drama"],
        director: "Michael Mann",
        actors: ["Al Pacino", "Robert De Niro"],
        tropes: ["Obsessive Rivalry & Doppelgänger", "Heist"],
        reason: "Pacino / De Niro dynamic + Shared Heist and Neo-Noir tropes.",
        connectedFrom: ["The Godfather Part II"],
        graphPathHops: 2,
      }
    ];
  }

  if (userId === "u-indiebuff") {
    return [
      {
        movie: getSeedMovie("m-eeaao", "Everything Everywhere All at Once", "https://image.tmdb.org/t/p/w780/w3LxiVYPqRLexP07dw7uhY04P05.jpg", 8.8) as any,
        affinityScore: 98,
        genres: ["Sci-Fi", "Fantasy", "Drama"],
        director: "Daniel Kwan & Daniel Scheinert",
        actors: ["Michelle Yeoh"],
        tropes: ["Multiverse & Parallel Realities", "Existential Cosmic Dread"],
        reason: "Top A24 match: Oscar-winning multiverse surrealism + High Indie cohort affinity.",
        connectedFrom: ["Past Lives", "Parasite"],
        graphPathHops: 2,
      },
      {
        movie: getSeedMovie("m-pastlives", "Past Lives", "https://image.tmdb.org/t/p/w780/k3waqVXSnvCZWfJYNtdamTgTtTA.jpg", 8.4) as any,
        affinityScore: 96,
        genres: ["Drama", "Romance"],
        director: "Celine Song",
        actors: ["Greta Lee", "Teo Yoo"],
        tropes: ["In-Yun Destiny", "Emotional Distance"],
        reason: "A24 Critical Darlings: Deep thematic connection through existential connection and longing.",
        connectedFrom: ["Everything Everywhere All at Once"],
        graphPathHops: 2,
      },
      {
        movie: getSeedMovie("m-parasite", "Parasite", "https://image.tmdb.org/t/p/w780/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg", 8.5) as any,
        affinityScore: 95,
        genres: ["Drama", "Thriller"],
        director: "Bong Joon-ho",
        actors: ["Song Kang-ho"],
        tropes: ["Social Class Conflict", "Dark Satire"],
        reason: "Palme d'Or & Oscar Masterpiece: High overlap with Indie Surrealism cinephile group.",
        connectedFrom: ["Everything Everywhere All at Once"],
        graphPathHops: 2,
      },
      {
        movie: getSeedMovie("m-spiritedaway", "Spirited Away", "https://image.tmdb.org/t/p/w780/393mhUQRIceQUkXqA2R0qKqYv1m.jpg", 8.6) as any,
        affinityScore: 93,
        genres: ["Animation", "Fantasy"],
        director: "Hayao Miyazaki",
        actors: ["Rumi Hiiragi"],
        tropes: ["Surrealist Spirit Realm", "Coming of Age"],
        reason: "Visual Poetry & Surrealism: Connected through magical realism and auteur animation.",
        connectedFrom: ["Past Lives"],
        graphPathHops: 3,
      },
      {
        movie: getSeedMovie("m-lalaland", "La La Land", "https://image.tmdb.org/t/p/w780/uDO8zWDhfWwoFdKS4fzkVJt0Rf0.jpg", 8.0) as any,
        affinityScore: 91,
        genres: ["Drama", "Romance", "Music"],
        director: "Damien Chazelle",
        actors: ["Ryan Gosling", "Emma Stone"],
        tropes: ["Melancholic Dreamer", "Bittersweet Romance"],
        reason: "Auteur Romance: Shared Bittersweet Romance trope with Past Lives.",
        connectedFrom: ["Past Lives"],
        graphPathHops: 2,
      },
      {
        movie: getSeedMovie("m-whiplash", "Whiplash", "https://image.tmdb.org/t/p/w780/7fn624j5lj3xTme2SgiLCeuedmO.jpg", 8.5) as any,
        affinityScore: 89,
        genres: ["Drama", "Music"],
        director: "Damien Chazelle",
        actors: ["Miles Teller", "J.K. Simmons"],
        tropes: ["Obsessive Pursuit of Perfection", "Mentorship Trap"],
        reason: "Damien Chazelle Auteur Track: Intense psychological drama with high critical rating.",
        connectedFrom: ["La La Land"],
        graphPathHops: 1,
      }
    ];
  }

  return [
    {
      movie: getSeedMovie("m-oppenheimer", "Oppenheimer", "https://image.tmdb.org/t/p/w780/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg", 8.9) as any,
      affinityScore: 98,
      genres: ["Drama", "History"],
      director: "Christopher Nolan",
      actors: ["Cillian Murphy", "Matt Damon", "Florence Pugh"],
      tropes: ["Non-Linear Timeline", "Existential Dread"],
      reason: "High affinity match: Connected via Director Christopher Nolan + 2 Shared Tropes.",
      connectedFrom: ["Inception", "Interstellar"],
      graphPathHops: 3,
    },
    {
      movie: getSeedMovie("m-bladerunner2049", "Blade Runner 2049", "https://image.tmdb.org/t/p/w780/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg", 8.0) as any,
      affinityScore: 94,
      genres: ["Sci-Fi", "Mystery", "Drama"],
      director: "Denis Villeneuve",
      actors: ["Ryan Gosling"],
      tropes: ["Cyberpunk Dystopia", "Neo-Noir Atmosphere", "Sentient Artificial Intelligence"],
      reason: "Director Denis Villeneuve (Dune) + Shared Composer Hans Zimmer + Sentient AI Trope.",
      connectedFrom: ["Dune: Part Two", "Interstellar"],
      graphPathHops: 2,
    },
    {
      movie: getSeedMovie("m-prestige", "The Prestige", "https://image.tmdb.org/t/p/w780/tRNlZbgNCNOpLpbPEz5L8G8A0JN.jpg", 8.5) as any,
      affinityScore: 91,
      genres: ["Drama", "Mystery", "Thriller"],
      director: "Christopher Nolan",
      actors: ["Christian Bale"],
      tropes: ["Non-Linear Timeline", "Obsessive Rivalry & Doppelgänger"],
      reason: "Shared Director Christopher Nolan + Shared Trope (Non-Linear Timeline).",
      connectedFrom: ["Inception"],
      graphPathHops: 2,
    },
    {
      movie: getSeedMovie("m-matrix", "The Matrix", "https://image.tmdb.org/t/p/w780/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg", 8.7) as any,
      affinityScore: 89,
      genres: ["Sci-Fi", "Action"],
      director: "The Wachowskis",
      actors: ["Keanu Reeves"],
      tropes: ["Cyberpunk Dystopia", "Sentient AI", "Messianic Chosen One"],
      reason: "Connected through Chosen One trope (Dune) and AI/Cyberpunk thematic network.",
      connectedFrom: ["Dune: Part Two"],
      graphPathHops: 3,
    },
    {
      movie: getSeedMovie("m-darkknight", "The Dark Knight", "https://image.tmdb.org/t/p/w780/qJ2tW6WMUDux911r6m7haRef0WH.jpg", 9.0) as any,
      affinityScore: 96,
      genres: ["Action", "Crime", "Drama"],
      director: "Christopher Nolan",
      actors: ["Christian Bale", "Heath Ledger", "Cillian Murphy"],
      tropes: ["Morally Ambiguous Antihero", "Neo-Noir Atmosphere"],
      reason: "Nolanverse Core: Directed by Christopher Nolan, starring Cillian Murphy & scored by Hans Zimmer.",
      connectedFrom: ["Inception", "Oppenheimer"],
      graphPathHops: 2,
    }
  ];
}

export function getMockShortestPath(personA: string, personB: string): ShortestPathResult {
  const normA = personA.toLowerCase().trim();
  const normB = personB.toLowerCase().trim();

  // Return a rich contextual path based on common connections
  const chalamet = seedData.people.find((p) => p.id === "p-chalamet")!;
  const cillian = seedData.people.find((p) => p.id === "p-cillian")!;
  const nolan = seedData.people.find((p) => p.id === "p-nolan")!;
  const interstellar = seedData.movies.find((m) => m.id === "m-interstellar")!;
  const oppenheimer = seedData.movies.find((m) => m.id === "m-oppenheimer")!;

  return {
    startNode: chalamet as any,
    targetNode: cillian as any,
    length: 3,
    nodes: [
      { id: chalamet.id, label: "Person", name: chalamet.name, properties: chalamet, color: "#10B981", size: 20 },
      { id: interstellar.id, label: "Movie", name: interstellar.title, title: interstellar.title, properties: interstellar, color: "#3B82F6", size: 24 },
      { id: nolan.id, label: "Person", name: nolan.name, properties: nolan, color: "#34D399", size: 22 },
      { id: oppenheimer.id, label: "Movie", name: oppenheimer.title, title: oppenheimer.title, properties: oppenheimer, color: "#3B82F6", size: 24 },
      { id: cillian.id, label: "Person", name: cillian.name, properties: cillian, color: "#10B981", size: 20 },
    ],
    relationships: [
      { type: "ACTED_IN", properties: { role: "Young Tom" } },
      { type: "DIRECTED", properties: { role: "Director" } },
      { type: "DIRECTED", properties: { role: "Director" } },
      { type: "ACTED_IN", properties: { role: "J. Robert Oppenheimer" } },
    ],
    pathDescription: [
      `${chalamet.name} acted in "${interstellar.title}" (2014)`,
      `"${interstellar.title}" was directed by ${nolan.name}`,
      `${nolan.name} directed "${oppenheimer.title}" (2023)`,
      `${cillian.name} starred in "${oppenheimer.title}" as J. Robert Oppenheimer`,
    ],
  };
}

export function getMockCollaborators(): CollaboratorClique[] {
  return [
    {
      director: seedData.people.find((p) => p.id === "p-nolan") as any,
      collaborator: seedData.people.find((p) => p.id === "p-cillian") as any,
      collaborationsCount: 4,
      avgRating: 8.6,
      movies: [
        { id: "m-oppenheimer", title: "Oppenheimer", releaseYear: 2023, rating: 8.9 },
        { id: "m-inception", title: "Inception", releaseYear: 2010, rating: 8.8 },
        { id: "m-darkknight", title: "The Dark Knight", releaseYear: 2008, rating: 9.0 },
        { id: "m-dunkirk", title: "Dunkirk", releaseYear: 2017, rating: 7.8 },
      ],
    },
    {
      director: seedData.people.find((p) => p.id === "p-nolan") as any,
      collaborator: seedData.people.find((p) => p.id === "p-hanszimmer") as any,
      collaborationsCount: 6,
      avgRating: 8.65,
      movies: [
        { id: "m-interstellar", title: "Interstellar", releaseYear: 2014, rating: 8.7 },
        { id: "m-inception", title: "Inception", releaseYear: 2010, rating: 8.8 },
        { id: "m-darkknight", title: "The Dark Knight", releaseYear: 2008, rating: 9.0 },
        { id: "m-dunkirk", title: "Dunkirk", releaseYear: 2017, rating: 7.8 },
      ],
    },
    {
      director: seedData.people.find((p) => p.id === "p-denis") as any,
      collaborator: seedData.people.find((p) => p.id === "p-chalamet") as any,
      collaborationsCount: 2,
      avgRating: 8.3,
      movies: [
        { id: "m-dune2", title: "Dune: Part Two", releaseYear: 2024, rating: 8.6 },
        { id: "m-dune1", title: "Dune: Part One", releaseYear: 2021, rating: 8.0 },
      ],
    },
    {
      director: seedData.people.find((p) => p.id === "p-scorsese") as any,
      collaborator: seedData.people.find((p) => p.id === "p-dicaprio") as any,
      collaborationsCount: 2,
      avgRating: 8.5,
      movies: [
        { id: "m-departed", title: "The Departed", releaseYear: 2006, rating: 8.5 },
      ],
    }
  ];
}
