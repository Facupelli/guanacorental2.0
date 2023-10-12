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
import { useBoundStore } from "@/zustand/store";
import dayjs from "dayjs";
import { useEffect } from "react";

const SelectPickupHour = () => {
  const setPickupHour = useBoundStore((state) => state.setPickupHour);
  const startDate = useBoundStore((state) => state.startDate);
  const location = useBoundStore((state) => state.location);
  const pickup = useBoundStore((state) => state.pickupHour);

  const schedules = Object.keys(SCHEDULES[location.name]!);

  useEffect(() => {
    if (dayjs(startDate).day() !== 5) {
      setPickupHour(schedules[0]!);
    }
  }, [startDate, schedules, setPickupHour]);

  return (
    <Select
      onValueChange={(e) => setPickupHour(e)}
      disabled={dayjs(startDate).day() !== 5 || !startDate}
      defaultValue="09:00"
      value={pickup}
    >
      <SelectTrigger>
        <SelectValue placeholder="seleccionar hora de retiro" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>horarios:</SelectLabel>
          {schedules.map((hour) => (
            <SelectItem value={hour} key={hour}>
              {hour}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default SelectPickupHour;
