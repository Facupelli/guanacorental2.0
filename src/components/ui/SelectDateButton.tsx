import Calendar from "react-calendar";
import { type Value } from "react-calendar/dist/cjs/shared/types";
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
  // const endDate = useBoundStore((state) => state.startDate);
  // const startDate = useBoundStore((state) => state.endDate);

  const handleDateChange = (e: Value) => {
    if (e && Array.isArray(e)) {
      setStartDate(e[0]);
      setEndDate(e[1]);
    }
  };

  const disableWeekend = ({ date }: { date: Date }) => {
    if (dayjs(date).day() === 6 || dayjs(date).day() === 0) {
      return true;
    }

    if (
      session?.user.role.map((role) => role.name).includes(ROLES.ADMIN) &&
      dayjs().day() === 5 &&
      dayjs().hour() < 19
    ) {
      return true;
    }

    return false;
  };

  // const disableEquipmentBooked = ({ date }: { date: Date }) => {
  //   if (startDate && endDate) {
  //     const datesInRange = getDatesInRange(startDate, endDate);
  //   }
  // };

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
            <div>
              Primero selecciona la fecha de inicio y después la fecha final.
              Luego selecciona el horario de retiro de los equipos.
            </div>
            <div>
              Loss equipos no pueden ser retirado ni devueltos los sábados y
              domingos, pero se pueden alquilar durante esos días.
            </div>
            <div>
              Sistema day/weekend reitrando viernes 20:00hs y devolviendo lunes
              09:00hs precio por una jornada.
            </div>
            <div>
              Retiro vienres 09:00hs y devolución lunes 09:00hs precio x 1.5
              jornada.
            </div>
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
