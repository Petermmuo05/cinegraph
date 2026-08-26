export interface MovieNode {
  id: string;
  title: string;
  releaseYear: number;
  runtime: number; // in minutes
  imdbRating: number;
  posterUrl: string;
  backdropUrl: string;
  budget?: string;
  boxOffice?: string;
  plotSummary: string;
  tagline?: string;
  featured?: boolean;
  genres?: string[];
  director?: string;
  cast?: string[];
  tropes?: string[];
  trailerUrl?: string;
}

export interface PersonNode {
  id: string;
  name: string;
  bornYear?: number;
  photoUrl: string;
  bio?: string;
  primaryRole: "Actor" | "Director" | "Writer" | "Cinematographer" | "Composer";
}

export interface GenreNode {
  id: string;
  name: string;
  colorHex: string;
  icon?: string;
}

export interface TropeNode {
  id: string;
  name: string;
  category: string;
  description: string;
}

export interface StudioNode {
  id: string;
  name: string;
  foundedYear?: number;
  logoUrl?: string;
}

export interface FranchiseNode {
  id: string;
  name: string;
  universe: string;
  totalGross?: string;
}

export interface UserNode {
  id: string;
  username: string;
  avatarUrl: string;
  bio?: string;
  favoriteGenre?: string;
  tasteArchetype?: string;
}

export type GraphNodeType = "Movie" | "Person" | "Genre" | "Trope" | "Studio" | "Franchise" | "User";

export interface GraphNode {
  id: string;
  label: GraphNodeType;
  name?: string;
  title?: string;
  color?: string;
  size?: number;
  properties: Record<string, any>;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
  index?: number;
}

export interface GraphEdge {
  id?: string;
  source: string | GraphNode;
  target: string | GraphNode;
  type: string;
  label?: string;
  properties?: Record<string, any>;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface ShortestPathResult {
  startNode: PersonNode | MovieNode;
  targetNode: PersonNode | MovieNode;
  length: number;
  nodes: (GraphNode & { type?: string })[];
  relationships: { type: string; properties?: Record<string, any> }[];
  pathDescription: string[];
}

export interface RecommendationResult {
  movie: MovieNode;
  affinityScore: number;
  genres: string[];
  director: string;
  actors: string[];
  tropes: string[];
  reason: string;
  connectedFrom: string[];
  graphPathHops: number;
  cohortOverlap?: number;
  sharedLikers?: string[];
}

export interface CollaboratorClique {
  director: PersonNode;
  collaborator: PersonNode;
  collaborationsCount: number;
  avgRating: number;
  movies: { id: string; title: string; releaseYear: number; rating: number }[];
}

export interface DbStatus {
  connected: boolean;
  isMock: boolean;
  latencyMs: number;
  nodeCount: number;
  edgeCount: number;
  labels: Record<string, number>;
  errorMessage?: string;
}

export interface UserWatchlistItem {
  movieId: string;
  movie: MovieNode;
  addedAt: string;
  status: "watchlist" | "watched" | "liked";
  rating?: number;
}
