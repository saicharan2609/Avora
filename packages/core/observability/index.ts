declare const logSafeValueBrand: unique symbol;

export type LogSafePrimitive = string | number | boolean | null;

export type LogSafeValue = LogSafePrimitive & {
  readonly [logSafeValueBrand]?: "LogSafeValue";
};

export type LogSafeFields = Readonly<Record<string, LogSafeValue>>;

export type LoggerContract = Readonly<{
  debug: (fields: LogSafeFields, message: string) => void;
  info: (fields: LogSafeFields, message: string) => void;
  warn: (fields: LogSafeFields, message: string) => void;
  error: (fields: LogSafeFields, message: string) => void;
}>;