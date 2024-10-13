import { type DateRange } from "react-day-picker";
import { es } from "date-fns/locale";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utcPlugin from "dayjs/plugin/utc";
import timezonePlugin from "dayjs/plugin/timezone";
import { useSession } from "next-auth/react";
import { CalendarDays, Info } from "lucide-react";
import { Calendar } from "@components/ui/calendar";
import { useState } from "react";

dayjs.extend(utcPlugin);
dayjs.extend(timezonePlugin);
dayjs.extend(customParseFormat);

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover";
import { Button } from "./button";
import SelectPickupHour from "./SelectPickupHour";
import { getIsAdmin, getIsEmployee } from "~/lib/utils";
import { useDateStoreActions, useEndDate, useStartDate } from "~/stores/date.store";

dayjs.tz.setDefault("America/Argentina/Buenos_Aires");

const SelectDateButton = () => {
  const { data: session } = useSession();

  const [isOpen, setOpen] = useState(false);

  const startDate = useStartDate();
  const endDate = useEndDate();
  const { setStartDate, setEndDate } = useDateStoreActions();

  const handleSelectRange = (range: DateRange | undefined) => {
    setStartDate(range?.from);
    setEndDate(range?.to);
  };

  const isAdmin = getIsAdmin(session);
  const isEmployee = getIsEmployee(session);

  const disableAccordingToRentalSchedule = (date: Date) => {
    if (isAdmin || isEmployee) {
      return false;
    }

    const now = dayjs();
    const calendarDate = dayjs(date);

    if (now.isSame(calendarDate, "day")) {
      if (now.day() === 5) {
        const startTime = dayjs().set("hour", 15).set("minute", 0).set("second", 0);

        if (now.isAfter(startTime)) {
          return true;
        }
      }

      const startTime = dayjs().set("hour", 8).set("minute", 0).set("second", 0);

      if (now.isAfter(startTime)) {
        return true;
      }
    }

    return false;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <CalendarDays className="mr-2 h-4 w-4" /> Seleccionar Fecha
        </Button>
      </DialogTrigger>
      <DialogContent className="md:w-[470px]">
        <DialogHeader>
          <DialogTitle>Selecciona tu fecha de alquiler</DialogTitle>
          <DialogDescription>
            <div className="hidden sm:block">
              Selecciona la fecha de retiro de los equipos y después la fecha de devolución. Luego selecciona el horario
              de retiro de los equipos.
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="grid justify-center gap-2 sm:gap-6">
          <Calendar
            locale={es}
            className="rounded-md border border-input"
            mode="range"
            selected={{
              from: startDate,
              to: endDate,
            }}
            onSelect={handleSelectRange}
            fixedWeeks
            initialFocus
            modifiers={{
              disabled: [
                {
                  dayOfWeek: [0, 6],
                },
                {
                  before: new Date(),
                },
                disableAccordingToRentalSchedule,
              ],
            }}
          />
          <div>
            <SelectPickupHour />
            <div className="pt-2">
              <p className="text-sm text-secondary-foreground sm:text-base">Importante leer antes de alquilar</p>
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center">
                  <RentWeekendTip />
                  Fin de semana
                </div>
                <div className="flex items-center">
                  <RentHourTip />
                  Horarios
                </div>
                <div className="flex items-center">
                  <RentPriceTip />
                  Precios
                </div>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => setOpen(false)}>Aceptar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const RentWeekendTip = () => {
  return (
    <Popover>
      <PopoverTrigger className=" border-none p-0" asChild>
        <Button variant="outline" className="w-6 rounded-full  p-0">
          <Info className="h-4 w-4 text-secondary-foreground" />
          <span className="sr-only">Info</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="grid gap-2">
        <p>
          Los equipos no pueden ser retirados ni devueltos los sábados y domingos, pero se pueden alquilar durante esos
          días.
        </p>
        <p>Selecciona una fecha antes del fin de semana y luego una fecha después del fin de semana.</p>
      </PopoverContent>
    </Popover>
  );
};

const RentHourTip = () => {
  return (
    <Popover>
      <PopoverTrigger className="border-none" asChild>
        <Button variant="outline" className="w-6 rounded-full p-0">
          <Info className="h-4 w-4 text-secondary-foreground" />
          <span className="sr-only">Info</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="grid gap-2">
        <p>Los equipos se retiran de lunes a jueves a las 09:00hs y los viernes a las 09:00hs o 20:00hs</p>
        <p>La devolución de los equipos es de lunes a viernes a las 09:00hs</p>
      </PopoverContent>
    </Popover>
  );
};

const RentPriceTip = () => {
  return (
    <Popover>
      <PopoverTrigger className="border-none" asChild>
        <Button variant="outline" className="w-6 rounded-full p-0">
          <Info className="h-4 w-4 text-secondary-foreground" />
          <span className="sr-only">Info</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="grid gap-2">
        <p>Sistema day/weekend. Retiro viernes 20:00hs y devolución lunes 09:00hs precio por una jornada.</p>
        <p>Retiro viernes 09:00hs y devolución lunes 09:00hs precio x 1.5 jornada.</p>
      </PopoverContent>
    </Popover>
  );
};

export default SelectDateButton;
