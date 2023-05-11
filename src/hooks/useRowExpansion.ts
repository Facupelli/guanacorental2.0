import { useState } from "react";

export const useRowExpansion = <T>() => {
  const [isRowExpanded, setExpandedRows] = useState(false);

  const toggleRowExpansion = () => setExpandedRows((prev) => !prev);

  return { toggleRowExpansion, isRowExpanded };
};
