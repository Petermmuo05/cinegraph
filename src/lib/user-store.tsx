"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserNode } from "@/types";

interface UserContextType {
  currentUser: UserNode;
  isAuthenticated: boolean;
  authLoading: boolean;
  isOnboarded: boolean;
  setIsOnboarded: (onboarded: boolean) => void;
  watchlist: string[]; // movie IDs
  likedMovies: string[]; // movie IDs
  userRatings: Record<string, number>; // movieId -> rating 1-10
  selectedMood: string;
  setSelectedMood: (mood: string) => void;
  toggleWatchlist: (movieId: string) => void;
  toggleLike: (movieId: string) => void;
  rateMovie: (movieId: string, rating: number) => void;
  isTasteModalOpen: boolean;
  setIsTasteModalOpen: (open: boolean) => void;
  tuneTastePreferences: (genres: string[], movies: string[]) => void;
  login: (usernameInput: string, passwordInput: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const guestUser: UserNode = {
  id: "guest",
  username: "Guest Explorer",
  avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&fit=crop",
  bio: "Guest cinema explorer",
  favoriteGenre: "Science Fiction",
  tasteArchetype: "Mind-Bending",
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserNode>(guestUser);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(true);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [likedMovies, setLikedMovies] = useState<string[]>([]);
  const [userRatings, setUserRatings] = useState<Record<string, number>>({});
  const [selectedMood, setSelectedMood] = useState<string>("Mind-Bending");
  const [isTasteModalOpen, setIsTasteModalOpen] = useState(false);

  // Helper to load state for a given user from localStorage
  const loadUserState = (userId: string) => {
    if (userId === "guest") {
      setWatchlist([]);
      setLikedMovies([]);
      setUserRatings({});
      setIsOnboarded(true);
      return;
    }

    try {
      const savedOnboarded = localStorage.getItem(`cinegraph_${userId}_onboarded`);
      const savedWatchlist = localStorage.getItem(`cinegraph_${userId}_watchlist`);
      const savedLikes = localStorage.getItem(`cinegraph_${userId}_likes`);
      const savedRatings = localStorage.getItem(`cinegraph_${userId}_ratings`);
      const savedMood = localStorage.getItem(`cinegraph_${userId}_mood`);

      if (userId === "u-freshuser") {
        setIsOnboarded(savedOnboarded === "true");
      } else {
        setIsOnboarded(savedOnboarded !== "false");
      }

      setWatchlist(savedWatchlist ? JSON.parse(savedWatchlist) : []);
      setLikedMovies(savedLikes ? JSON.parse(savedLikes) : []);
      setUserRatings(savedRatings ? JSON.parse(savedRatings) : {});
      if (savedMood) setSelectedMood(savedMood);
    } catch (e) {
      // Ignore parse errors
    }
  };

  // Sync state to CognoDB in background
  const syncToCognoDB = async (
    updatedLikes: string[],
    updatedWatchlist: string[],
    updatedRatings: Record<string, number>,
    userObj?: UserNode
  ) => {
    const u = userObj || currentUser;
    if (!u || u.id === "guest") return;

    try {
      await fetch("/api/user/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: u.id,
          username: u.username,
          avatarUrl: u.avatarUrl,
          favoriteGenre: u.favoriteGenre,
          tasteArchetype: u.tasteArchetype,
          likedMovies: updatedLikes,
          watchlist: updatedWatchlist,
          userRatings: updatedRatings,
        }),
      });
    } catch (e) {
      console.warn("Could not sync user graph to CognoDB:", e);
    }
  };

  // Initialize session from server cookie on mount
  useEffect(() => {
    async function checkSession() {
      try {
        setAuthLoading(true);
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
          setIsAuthenticated(true);
          loadUserState(data.user.id);
        } else {
          setCurrentUser(guestUser);
          setIsAuthenticated(false);
          loadUserState("guest");
        }
      } catch (err) {
        console.warn("Session check fallback:", err);
        setCurrentUser(guestUser);
        setIsAuthenticated(false);
        loadUserState("guest");
      } finally {
        setAuthLoading(false);
      }
    }
    checkSession();
  }, []);

  const handleSetOnboarded = (status: boolean) => {
    setIsOnboarded(status);
    if (currentUser.id !== "guest") {
      try {
        localStorage.setItem(`cinegraph_${currentUser.id}_onboarded`, status ? "true" : "false");
      } catch (e) {}
    }
  };

  const toggleWatchlist = (movieId: string) => {
    setWatchlist((prev) => {
      const next = prev.includes(movieId) ? prev.filter((id) => id !== movieId) : [...prev, movieId];
      if (currentUser.id !== "guest") {
        try {
          localStorage.setItem(`cinegraph_${currentUser.id}_watchlist`, JSON.stringify(next));
        } catch (e) {}
        syncToCognoDB(likedMovies, next, userRatings);
      }
      return next;
    });
  };

  const toggleLike = (movieId: string) => {
    setLikedMovies((prev) => {
      const next = prev.includes(movieId) ? prev.filter((id) => id !== movieId) : [...prev, movieId];
      if (currentUser.id !== "guest") {
        try {
          localStorage.setItem(`cinegraph_${currentUser.id}_likes`, JSON.stringify(next));
        } catch (e) {}
        syncToCognoDB(next, watchlist, userRatings);
      }
      return next;
    });
  };

  const rateMovie = (movieId: string, rating: number) => {
    setUserRatings((prev) => {
      const next = { ...prev, [movieId]: rating };
      if (currentUser.id !== "guest") {
        try {
          localStorage.setItem(`cinegraph_${currentUser.id}_ratings`, JSON.stringify(next));
        } catch (e) {}
        syncToCognoDB(likedMovies, watchlist, next);
      }
      return next;
    });
  };

  const tuneTastePreferences = (genres: string[], movies: string[]) => {
    const nextLikes = Array.from(new Set([...likedMovies, ...movies]));
    setLikedMovies(nextLikes);
    const updatedUser = {
      ...currentUser,
      favoriteGenre: genres[0] || currentUser.favoriteGenre,
    };
    if (genres[0]) {
      setCurrentUser(updatedUser);
    }
    handleSetOnboarded(true);
    if (currentUser.id !== "guest") {
      try {
        localStorage.setItem(`cinegraph_${currentUser.id}_likes`, JSON.stringify(nextLikes));
      } catch (e) {}
      syncToCognoDB(nextLikes, watchlist, userRatings, updatedUser);
    }
  };

  const login = async (usernameInput: string, passwordInput: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameInput, password: passwordInput }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Login failed" };
      }

      setCurrentUser(data.user);
      setIsAuthenticated(true);
      loadUserState(data.user.id);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error" };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {}
    setCurrentUser(guestUser);
    setIsAuthenticated(false);
    loadUserState("guest");
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        authLoading,
        isOnboarded,
        setIsOnboarded: handleSetOnboarded,
        watchlist,
        likedMovies,
        userRatings,
        selectedMood,
        setSelectedMood: (m) => {
          setSelectedMood(m);
          if (currentUser.id !== "guest") {
            try {
              localStorage.setItem(`cinegraph_${currentUser.id}_mood`, m);
            } catch (e) {}
          }
        },
        toggleWatchlist,
        toggleLike,
        rateMovie,
        isTasteModalOpen,
        setIsTasteModalOpen,
        tuneTastePreferences,
        login,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
