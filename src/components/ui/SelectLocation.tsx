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
import { type ReactNode } from "react";

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
  locations: Location[];
  setValue: (e: string) => void;
  className?: string;
  children?: ReactNode;
};
export const AdminSelectLocation = ({
  setValue,
  locations,
  className,
  children,
}: AdminSelectLocationProps) => {
  return (
    <Select onValueChange={setValue}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="elegir" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Sucursales</SelectLabel>
          {children}
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
