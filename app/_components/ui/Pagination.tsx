import { DOTS, usePagination } from "~/hooks/usePagination";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

type Props = {
  totalCount: number;
  pageSize: number;
  siblingCount?: number;
  currentPage: number;
  onPageChange: (page: number | string) => void;
};

export default function Pagination({ onPageChange, totalCount, siblingCount = 1, currentPage, pageSize }: Props) {
  const paginationRange = usePagination({
    currentPage,
    totalCount,
    siblingCount,
    pageSize,
  });

  if (!paginationRange) return null;

  if (currentPage === 0 || paginationRange.length < 2) {
    return null;
  }

  const lastPage = paginationRange[paginationRange.length - 1];
  const firstPage = paginationRange[0];

  const onNext = () => {
    if (lastPage === currentPage) return;
    onPageChange(currentPage + 1);
  };

  const onPrevious = () => {
    if (firstPage === currentPage) return;
    onPageChange(currentPage - 1);
  };

  return (
    <ul className="mt-6 flex items-center justify-center font-medium text-neutral-800 ">
      <button className="cursor-pointer " onClick={onPrevious}>
        <ArrowLeftIcon className="h-4 w-4" />
      </button>
      <div className="flex">
        {paginationRange.map((pageNumber) => {
          if (pageNumber === DOTS) {
            return (
              <li key={pageNumber} className="border-r border-neutral-300 px-2">
                &#8230;
              </li>
            );
          }

          return (
            <li
              key={pageNumber}
              className={`cursor-pointer border-r border-neutral-300 px-2 last:border-none ${
                currentPage === pageNumber ? "text-neutral-900" : "text-neutral-400"
              }`}
              onClick={() => onPageChange(pageNumber)}
            >
              {pageNumber}
            </li>
          );
        })}
      </div>
      <button className="cursor-pointer" onClick={onNext}>
        <ArrowRightIcon className="h-4 w-4" />
      </button>
    </ul>
  );
}
