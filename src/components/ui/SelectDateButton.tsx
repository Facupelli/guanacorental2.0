import dayjs from "dayjs";
import { CalendarDays, Info } from "lucide-react";
import Calendar from "react-calendar";
import { useSession } from "next-auth/react";
import { useBoundStore } from "@/zustand/store";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "./button";
import SelectPickupHour from "./SelectPickupHour";

import { ROLES } from "@/lib/magic_strings";

import { type Value } from "react-calendar/dist/cjs/shared/types";
import DialogWithState from "../DialogWithState";
import { useState } from "react";

const SelectDateButton = () => {
  const { data: session } = useSession();

  const setStartDate = useBoundStore((state) => state.setStartDate);
  const setEndDate = useBoundStore((state) => state.setEndDate);
  const isOpen = useBoundStore((state) => state.showDateModal);
  const setOpen = useBoundStore((state) => state.setOpenDateModal);
  const endDate = useBoundStore((state) => state.startDate);
  const startDate = useBoundStore((state) => state.endDate);

  const [modal, setModal] = useState(isOpen);

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
    <Dialog open={modal} onOpenChange={setModal}>
      <DialogTrigger asChild>
        <Button size="sm" onClick={setOpen}>
          <CalendarDays className="mr-2 h-4 w-4" /> Seleccionar Fecha
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Selecciona tu fecha de alquiler</DialogTitle>
          <DialogDescription>
            <div>
              Selecciona la fecha de retiro de los equipos y después la fecha de
              devolución. Luego selecciona el horario de retiro de los equipos.
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="grid justify-center gap-6">
          <Calendar
            selectRange={true}
            locale="es-ES"
            minDate={new Date()}
            onChange={(e) => handleDateChange(e)}
            tileDisabled={disableWeekend}
          />

          <div>
            <SelectPickupHour />
            <div className="flex items-center text-xs">
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
        <DialogFooter>
          <Button onClick={() => setModal(false)}>Aceptar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const RentWeekendTip = () => {
  return (
    <Popover>
      <PopoverTrigger className=" border-none p-0" asChild>
        <Button variant="outline" className="w-10 rounded-full p-0">
          <Info className="h-4 w-4" />
          <span className="sr-only">Info</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="grid gap-2">
        <p>
          Los equipos no pueden ser retirados ni devueltos los sábados y
          domingos, pero se pueden alquilar durante esos días.
        </p>
        <p>
          Selecciona una fecha antes del fin de semana y luego una fecha después
          del fin de semana.
        </p>
      </PopoverContent>
    </Popover>
  );
};

const RentHourTip = () => {
  return (
    <Popover>
      <PopoverTrigger className="border-none" asChild>
        <Button variant="outline" className="w-10 rounded-full p-0">
          <Info className="h-4 w-4" />
          <span className="sr-only">Info</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="grid gap-2">
        <p>
          Los equipos se retiran de lunes a jueves a las 09:00hs y los viernes a
          alas 09:00hs o 20:00hs
        </p>
        <p>La devolución de los equipos es de lunes a viernes a las 09:00hs</p>
      </PopoverContent>
    </Popover>
  );
};

const RentPriceTip = () => {
  return (
    <Popover>
      <PopoverTrigger className="border-none" asChild>
        <Button variant="outline" className="w-10 rounded-full p-0">
          <Info className="h-4 w-4" />
          <span className="sr-only">Info</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="grid gap-2">
        <p>
          Sistema day/weekend, retiro viernes 20:00hs y devolución lunes 09:00hs
          precio por una jornada.
        </p>
        <p>
          Retiro viernes 09:00hs y devolución lunes 09:00hs precio x 1.5
          jornada.
        </p>
      </PopoverContent>
    </Popover>
  );
};

export default SelectDateButton;
