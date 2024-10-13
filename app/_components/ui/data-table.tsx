import { useRowExpansion } from "~/hooks/useRowExpansion";

import type { CellFunctions, Columns } from "types/table";
import { type ReactNode, type Dispatch, type SetStateAction } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "./table";

type TableProps<T, P> = {
  columns: Columns<T, P>[];
  data: T[];
  setRowData?: Dispatch<SetStateAction<T | null>>;
  cellProps?: P | undefined;
  expandedComponent?: (props: { rowData: T }) => ReactNode;
};

const DataTable = <T, P>({ columns, data, setRowData, cellProps, expandedComponent }: TableProps<T, P>) => {
  return (
    <div className="rounded-md bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, i) => (
              <TableHead className="font-semibold text-black" key={i}>
                {column.title}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((data, i) => (
            <Row
              data={data}
              columns={columns}
              setRowData={setRowData}
              cellProps={cellProps}
              expandedComponent={expandedComponent}
              key={i}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

type RowProps<T, P> = {
  columns: Columns<T, P>[];
  data: T;
  setRowData?: Dispatch<SetStateAction<T | null>>;
  cellProps?: P | undefined;
  expandedComponent?: (props: { rowData: T }) => ReactNode;
};

const Row = <T, P>({ columns, data, setRowData, cellProps, expandedComponent }: RowProps<T, P>) => {
  const { toggleRowExpansion, isRowExpanded } = useRowExpansion<T>();

  const cellFunctions: CellFunctions<T> = {
    isRowExpanded,
    toggleRowExpansion,
  };

  return (
    <>
      <TableRow
        onClick={() => {
          setRowData && setRowData(data);
        }}
      >
        {columns.map((column, i) => (
          <TableCell key={i}>{column.cell(data, { cellProps, cellFunctions })}</TableCell>
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
