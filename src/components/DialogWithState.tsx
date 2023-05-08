import { type Dispatch, type SetStateAction, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  children: ReactNode;
  isOpen: boolean;
  title: string;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

const DialogWithState = ({ children, isOpen, title, setOpen }: Props) => {
  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default DialogWithState;
