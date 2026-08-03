declare const isoDateTimeStringBrand: unique symbol;

export type IsoDateTimeString = string & {
  readonly [isoDateTimeStringBrand]: "IsoDateTimeString";
};

export type ClockContract = Readonly<{
  now: () => IsoDateTimeString;
}>;