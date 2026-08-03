export type AvoraErrorCode = `${string}.${string}`;

export type RecoveryAction = Readonly<{
  label: string;
  action: string;
}>;

export type AvoraErrorContract = Readonly<{
  code: AvoraErrorCode;
  message: string;
  recoveryAction: RecoveryAction;
}>;