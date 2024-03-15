import { type Dispatch, type SetStateAction } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

export default function MendozaAlert({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>ATENCIÓN</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="pt-6">
              <div>
                Por el momento estamos tomando los pedidos de{" "}
                <strong>Mendoza</strong> via Whatsapp. Comunicate con nosotros
                para más información.
              </div>
              <div className="relative flex  justify-center py-4 text-center text-lg font-semibold">
                <div className="w-fit">
                  261 6830589
                  <div className="h-[2px] w-full bg-secondary-foreground"></div>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => setOpen(false)}>
            Aceptar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
