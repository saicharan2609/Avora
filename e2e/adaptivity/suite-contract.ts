export type AdaptivityCase = Readonly<{
  name: string;
  run: () => void;
}>;

export class AdaptivityGateFailure extends Error {
  public constructor(caseName: string, reason: string) {
    super(`${caseName}: ${reason}`);
    this.name = "AdaptivityGateFailure";
  }
}

export function assertAdaptivityCondition(
  caseName: string,
  condition: boolean,
  reason: string,
): asserts condition {
  if (!condition) {
    throw new AdaptivityGateFailure(caseName, reason);
  }
}