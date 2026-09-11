export type SelectableCardLayout = "row" | "tile";

export type SelectableCardContract = Readonly<{
  title: string;
  subtitle?: string;
  selected: boolean;
  layout?: SelectableCardLayout;
}>;
