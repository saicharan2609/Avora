export type BottomNavDestination = "home" | "subjects" | "tutor" | "planner" | "profile";

export type BottomNavBarContract = Readonly<{
  activeDestination: BottomNavDestination;
}>;
