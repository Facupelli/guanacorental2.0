import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Location } from "@/types/models";
import { useBoundStore } from "@/zustand/store";

type SelectLocationProps = {
  locations: Location[];
  placeholder: string;
  defaultValue: string;
  onValueChange: (e: string) => void;
  height?: string;
};
const SelectLocation = ({
  locations,
  placeholder,
  defaultValue,
  onValueChange,
  height,
}: SelectLocationProps) => {
  return (
    <div className="flex items-center gap-2 ">
      {/* <Label htmlFor="location">Sucursal:</Label> */}
      <Select
        onValueChange={(e) => onValueChange(e)}
        defaultValue={defaultValue}
      >
        <SelectTrigger className={height}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Sucursales</SelectLabel>
            {locations.map((location) => (
              <SelectItem value={location.name} key={location.id}>
                {location.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default SelectLocation;
