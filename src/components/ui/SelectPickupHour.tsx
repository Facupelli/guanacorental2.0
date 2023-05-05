import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SCHEDULES } from "@/lib/magic_strings";
import type { Location } from "@/types/models";
import { useBoundStore } from "@/zustand/store";

const SelectPickupHour = () => {
  const setPickupHour = useBoundStore((state) => state.setPickupHour);

  return (
    <Select onValueChange={(e) => setPickupHour(e)}>
      <SelectTrigger>
        <SelectValue placeholder="seleccionar hora de retiro" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>horarios:</SelectLabel>
          <SelectItem value="09:00">{SCHEDULES.SAN_JUAN["09:00"]}</SelectItem>
          <SelectItem value="20:00">{SCHEDULES.SAN_JUAN["20:00"]}</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default SelectPickupHour;
