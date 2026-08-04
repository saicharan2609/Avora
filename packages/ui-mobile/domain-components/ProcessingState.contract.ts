export type ProcessingStateContract = Readonly<{
  state: "queued" | "processing" | "blocked" | "completed";
}>;