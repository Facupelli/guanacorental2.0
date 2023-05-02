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
        <Button size="sm">Seleccionar Fecha</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Selecciona tu fecha de alquiler</DialogTitle>
          <DialogDescription>
            selecciona primero la fecha de inicio y luego la fecha final.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-4">
          <Calendar
            selectRange={true}
            locale="es-ES"
            minDate={new Date()}
            onChange={(e) => handleDateChange(e)}
          />
        </div>
        <DialogFooter>footer</DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SelectDateButton;
