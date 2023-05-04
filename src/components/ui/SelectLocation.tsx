import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form } from "@/pages/admin/equipment";
import type { Location } from "@/types/models";
import { UseFormRegister, UseFormSetValue } from "react-hook-form";

type SelectLocationProps = {
  locations: Location[];
  placeholder: string;
  defaultValue?: string;
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
              <SelectItem value={location.id} key={location.id}>
                {location.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

type AdminSelectLocationProps = {
  index: number;
  locations: Location[];
  setValue: UseFormSetValue<Form>;
};
export const AdminSelectLocation = ({
  index,
  setValue,
  locations,
}: AdminSelectLocationProps) => {
  return (
    <Select
      onValueChange={(e) => setValue(`owner.${index}.locationId` as const, e)}
    >
      <SelectTrigger className="h-6">
        <SelectValue placeholder="elegir" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Sucursales</SelectLabel>
          {locations.map((location) => (
            <SelectItem value={location.id} key={location.id}>
              {location.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default SelectLocation;
