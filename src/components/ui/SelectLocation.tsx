import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Form } from "@/pages/admin/equipment";
import type { Location } from "@/types/models";
import { type ReactNode } from "react";
import { type UseFormSetValue } from "react-hook-form";

type SelectLocationProps = {
  locations: Location[];
  placeholder: string;
  defaultValue?: string;
  onValueChange: (e: string) => void;
  children?: ReactNode;
};
const SelectLocation = ({
  locations,
  placeholder,
  defaultValue,
  onValueChange,
  children,
}: SelectLocationProps) => {
  console.log(locations);
  return (
    <Select onValueChange={(e) => onValueChange(e)} defaultValue={defaultValue}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Sucursales</SelectLabel>
          {children}
          {locations.map((location) => (
            <SelectItem
              value={`${location.id}-${location.name}`}
              key={location.id}
            >
              {location.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
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
