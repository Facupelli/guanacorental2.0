import type { ReactNode } from "react";

type HeadTitles = {
  title: string;
  width?: number;
};

type Props = {
  headTitles: HeadTitles[];
  children: ReactNode;
};

const Table = ({ headTitles, children }: Props) => {
  return (
    <div className="w-full rounded-md bg-white p-4">
      <table className="w-full border-collapse text-gray-800">
        <thead>
          <tr className="border-b border-gray-300 text-sm">
            {headTitles.map((head) => (
              <th key={head.title} className="pb-2 text-left font-bold">
                {head.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
};

export default Table;
