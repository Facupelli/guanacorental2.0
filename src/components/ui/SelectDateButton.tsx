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

const SelectDateButton = () => {
  const setStartDate = useBoundStore((state) => state.setStartDate);
  const setEndDate = useBoundStore((state) => state.setEndDate);

  const handleDateChange = (e: Value) => {
    if (e && Array.isArray(e)) {
      setStartDate(e[0]);
      setEndDate(e[1]);
    }
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
