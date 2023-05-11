import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRowExpansion } from "@/hooks/useRowExpansion";

import type { CellFunctions } from "@/types/table";
import {
  type ReactNode,
  type Dispatch,
  type ReactElement,
  type SetStateAction,
} from "react";

type Columns<T, P> = {
  title: string;
  cell: (rowData: T, cellProps?: P & CellFunctions<T>) => ReactElement;
};

type TableProps<T, P> = {
  columns: Columns<T, P>[];
  data: T[];
  setRowData: Dispatch<SetStateAction<T | null>>;
  cellProps?: P & CellFunctions<T>;
  expandedComponent?: (props: { rowData: T }) => ReactNode;
};

const DataTable = <T, P>({
  columns,
  data,
  setRowData,
  cellProps,
  expandedComponent,
}: TableProps<T, P>) => {
  return (
    <Table className="rounded-md bg-white">
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead className="font-semibold text-black">
              {column.title}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((data) => (
          <Row
            data={data}
            columns={columns}
            setRowData={setRowData}
            cellProps={cellProps}
            expandedComponent={expandedComponent}
          />
        ))}
      </TableBody>
    </Table>
  );
};

type RowProps<T, P> = {
  columns: Columns<T, P>[];
  data: T;
  setRowData: Dispatch<SetStateAction<T | null>>;
  cellProps?: P & CellFunctions<T>;
  expandedComponent?: (props: { rowData: T }) => ReactNode;
};

const Row = <T, P>({
  columns,
  data,
  setRowData,
  cellProps,
  expandedComponent,
}: RowProps<T, P>) => {
  const { toggleRowExpansion, isRowExpanded } = useRowExpansion<T>();

  const cellFunctions: CellFunctions<T> = {
    isRowExpanded,
    toggleRowExpansion,
  };

  return (
    <>
      <TableRow onClick={() => setRowData(data)}>
        {columns.map((column) => (
          <TableCell>
            {column.cell(data, { ...cellProps, ...cellFunctions })}
          </TableCell>
        ))}
      </TableRow>
      {isRowExpanded && (
        <TableRow>
          <TableCell colSpan={12} className="bg-secondary">
            {expandedComponent && expandedComponent({ rowData: data })}
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export default DataTable;
