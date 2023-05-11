import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type Dispatch, type ReactElement, type SetStateAction } from "react";

type Columns<T, P> = {
  title: string;
  cell: (rowData: T, cellProps?: P) => ReactElement;
};

type TableProps<T, P> = {
  columns: Columns<T, P>[];
  data: T[];
  setRowData: Dispatch<SetStateAction<T | null>>;
  cellProps?: P;
};

const DataTable = <T, P>({
  columns,
  data,
  setRowData,
  cellProps,
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
          <TableRow onClick={() => setRowData(data)}>
            {columns.map((column) => (
              <TableCell>{column.cell(data, cellProps)}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default DataTable;
