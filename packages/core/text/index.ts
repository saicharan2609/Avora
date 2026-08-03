declare const nonEmptyTextBrand: unique symbol;

export type NonEmptyText = string & {
  readonly [nonEmptyTextBrand]: "NonEmptyText";
};