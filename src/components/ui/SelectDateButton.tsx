import Calendar from "react-calendar";
import { Value } from "react-calendar/dist/cjs/shared/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./button";
import { useBoundStore } from "@/zustand/store";
import { CalendarDays } from "lucide-react";
import SelectPickupHour from "./SelectPickupHour";
import { useSession } from "next-auth/react";
import { ROLES } from "@/lib/magic_strings";
import dayjs from "dayjs";

const SelectDateButton = () => {
  const { data: session } = useSession();
  const setStartDate = useBoundStore((state) => state.setStartDate);
  const setEndDate = useBoundStore((state) => state.setEndDate);

  const handleDateChange = (e: Value) => {
    if (e && Array.isArray(e)) {
      setStartDate(e[0]);
      setEndDate(e[1]);
    }
  };

  const disableWeekend = ({ date }: { date: Date }) => {
    if (session?.user.role.map((role) => role.name).includes(ROLES.ADMIN)) {
      if (dayjs(date).day() !== 5 && dayjs().hour() > 19) {
        return true;
      }
    }

    if (dayjs(date).day() === 6 || dayjs(date).day() === 0) {
      return true;
    }

    return false;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">
          <CalendarDays className="mr-2 h-4 w-4" /> Seleccionar Fecha
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Selecciona tu fecha de alquiler</DialogTitle>
          <DialogDescription>
            Primero selecciona la fecha de inicio y después la fecha final.
            Luego selecciona el horario de retiro de los equipos.
          </DialogDescription>
        </DialogHeader>
        <div className="grid justify-center gap-6 py-4">
          <Calendar
            selectRange={true}
            locale="es-ES"
            minDate={new Date()}
            onChange={(e) => handleDateChange(e)}
            tileDisabled={disableWeekend}
          />

          <SelectPickupHour />
        </div>
        <DialogFooter>
          <Button>ACEPTAR</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SelectDateButton;
