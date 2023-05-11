import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRowExpansion } from "@/hooks/useRowExpansion";
import { type Dispatch, type ReactElement, type SetStateAction } from "react";

type CellFunctions<T> = {
  isRowExpanded: boolean;
  toggleRowExpansion: () => void;
};

type Columns<T, P> = {
  title: string;
  cell: (rowData: T, cellProps?: P & CellFunctions<T>) => ReactElement;
};

type TableProps<T, P> = {
  columns: Columns<T, P>[];
  data: T[];
  setRowData: Dispatch<SetStateAction<T | null>>;
  cellProps?: P & CellFunctions<T>;
};

const DataTable = <T, P>({
  columns,
  data,
  setRowData,
  cellProps,
}: TableProps<T, P>) => {
  const { toggleRowExpansion, isRowExpanded } = useRowExpansion<T>();

  const cellFunctions: CellFunctions<T> = {
    isRowExpanded,
    toggleRowExpansion,
  };

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
};

const Row = <T, P>({
  columns,
  data,
  setRowData,
  cellProps,
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
          <TableCell colSpan={12}>Expanded content</TableCell>
        </TableRow>
      )}
    </>
  );
};

export default DataTable;
