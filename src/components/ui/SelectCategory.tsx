import type { Category } from "@/types/models";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./select";

type SelecCategoryProps = {
  categories: Category[];
  setValue: (e: string) => void;
};

export const SelectCategory = ({
  categories,
  setValue,
}: SelecCategoryProps) => {
  return (
    <Select onValueChange={setValue} defaultValue="all">
      <SelectTrigger>
        <SelectValue placeholder="elegir" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Categorías</SelectLabel>
          <SelectItem value="all">Todas</SelectItem>
          {categories.map((category) => (
            <SelectItem value={category.id} key={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
