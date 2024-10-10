import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type LocationNames, SCHEDULES } from "@/lib/constants";
import dayjs from "dayjs";
import { useEffect } from "react";
import {
  useDateStoreActions,
  usePickupHour,
  useStartDate,
} from "stores/date.store";
import { useLocation } from "stores/location.store";

const SelectPickupHour = () => {
  const startDate = useStartDate();
  const location = useLocation();
  const pickup = usePickupHour();
  const { setPickupHour } = useDateStoreActions();

  const schedules = Object.values(
    SCHEDULES[location.name as LocationNames]
  ) as string[];

  useEffect(() => {
    if (dayjs(startDate).day() !== 5) {
      const pickupHour = schedules[0];

      if (pickupHour) {
        setPickupHour(pickupHour);
      }
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
