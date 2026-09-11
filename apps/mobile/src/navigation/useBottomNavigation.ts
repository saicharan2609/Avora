import { useRouter } from "expo-router";
import type { Href } from "expo-router";

import type { BottomNavDestination } from "@avora/ui-mobile/domain-components";

export type BottomNavigation = Readonly<{
  activeDestination: BottomNavDestination;
  onNavigate: (destination: BottomNavDestination) => void;
}>;

const ROUTE_BY_DESTINATION: Record<BottomNavDestination, Href> = {
  home: "/home",
  subjects: "/subjects",
  tutor: "/tutor",
  planner: "/planner",
  profile: "/profile",
};

/**
 * The single place that maps a `BottomNavBar` destination to its route
 * (Rule N-01: five fixed destinations, never reordered) — every top-level
 * screen calls this instead of hand-rolling its own route table, so the
 * mapping only ever exists once (Rule ENG-035).
 */
export function useBottomNavigation(activeDestination: BottomNavDestination): BottomNavigation {
  const router = useRouter();

  return {
    activeDestination,
    onNavigate: (destination) => {
      if (destination === activeDestination) {
        return;
      }

      router.replace(ROUTE_BY_DESTINATION[destination]);
    },
  };
}
