import { ReactElement } from "react";

export type CellFunctions<T> = {
  isRowExpanded: boolean;
  toggleRowExpansion: () => void;
};

export type Columns<T, P> = {
  title: string;
  cell: (
    rowData: T,
    cellData: {
      cellProps?: P;
      cellFunctions: CellFunctions<T>;
    }
  ) => ReactElement;
};
