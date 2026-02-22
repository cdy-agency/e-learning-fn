"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import {
  fetchLandingPageData,
  fetchInstitutions,
  LandingPageData,
  Institution,
} from "@/lib/api/public";
import { mapInstitution } from "@/lib/institution.mapper";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LandingDataContextType {
  landingData: LandingPageData | null;
  institutions: Institution[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const LandingDataContext = createContext<LandingDataContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function LandingDataProvider({ children }: { children: ReactNode }) {
  const [landingData,   setLandingData]   = useState<LandingPageData | null>(null);
  const [institutions,  setInstitutions]  = useState<Institution[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Both requests fire in parallel — axios throws on non-2xx so no manual success checks needed
      const [landingResult, institutionsResult] = await Promise.all([
        fetchLandingPageData({
          featured_limit:   6,
          trending_limit:   6,
          new_limit:        6,
          categories_limit: 10,
        }),
        fetchInstitutions(),
      ]);

      setLandingData(landingResult.data);
      setInstitutions(institutionsResult.data.map(mapInstitution));
    } catch (err) {
      // axiosInstance already shows toasts for 401/403/network errors;
      // we only need to track the message for local error UI.
      const message = err instanceof Error ? err.message : "Failed to load page data";
      console.error("Landing data fetch error:", err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <LandingDataContext.Provider
      value={{ landingData, institutions, loading, error, refetch: fetchData }}
    >
      {children}
    </LandingDataContext.Provider>
  );
}

// ─── Base hook ────────────────────────────────────────────────────────────────

export function useLandingData() {
  const ctx = useContext(LandingDataContext);
  if (!ctx) throw new Error("useLandingData must be used within a LandingDataProvider");
  return ctx;
}

// ─── Derived hooks ────────────────────────────────────────────────────────────

export function useFeaturedCourses() {
  const { landingData, loading, error } = useLandingData();
  return { featured: landingData?.featured ?? [], loading, error };
}

export function useTrendingCourses() {
  const { landingData, loading, error } = useLandingData();
  return { trending: landingData?.trending ?? [], loading, error };
}

export function useNewCourses() {
  const { landingData, loading, error } = useLandingData();
  return { newCourses: landingData?.new ?? [], loading, error };
}

export function useCategories() {
  const { landingData, loading, error } = useLandingData();
  return { categories: landingData?.categories ?? [], loading, error };
}

export function usePlatformStats() {
  const { landingData, loading, error } = useLandingData();
  return {
    stats: landingData?.stats ?? {
      totalCourses: 0,
      totalInstructors: 0,
      totalStudents: 0,
      totalInstitutions: 0,
    },
    loading,
    error,
  };
}

export function useInstitutions() {
  const { institutions, loading, error } = useLandingData();
  return { institutions, loading, error };
}