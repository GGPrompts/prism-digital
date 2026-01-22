"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { PortfolioProject } from "@/lib/portfolioData";

interface PortfolioState {
  isWorkRoute: boolean;
  setIsWorkRoute: (isWork: boolean) => void;
  selectedProject: PortfolioProject | null;
  setSelectedProject: (project: PortfolioProject | null) => void;
}

const PortfolioContext = createContext<PortfolioState | null>(null);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [isWorkRoute, setIsWorkRoute] = useState(false);
  const [selectedProject, setSelectedProject] =
    useState<PortfolioProject | null>(null);

  const handleSetIsWorkRoute = useCallback((isWork: boolean) => {
    setIsWorkRoute(isWork);
    if (!isWork) {
      setSelectedProject(null);
    }
  }, []);

  const handleSetSelectedProject = useCallback(
    (project: PortfolioProject | null) => {
      setSelectedProject(project);
    },
    []
  );

  return (
    <PortfolioContext.Provider
      value={{
        isWorkRoute,
        setIsWorkRoute: handleSetIsWorkRoute,
        selectedProject,
        setSelectedProject: handleSetSelectedProject,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolioState(): PortfolioState {
  const context = useContext(PortfolioContext);
  if (!context) {
    // Return a default state when used outside of provider (e.g., during SSR)
    return {
      isWorkRoute: false,
      setIsWorkRoute: () => {},
      selectedProject: null,
      setSelectedProject: () => {},
    };
  }
  return context;
}
