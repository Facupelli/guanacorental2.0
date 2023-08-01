import { type Dispatch, type SetStateAction, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";

type Props = {
  children: ReactNode;
  isOpen: boolean;
  title: string;
  setOpen?: Dispatch<SetStateAction<boolean>>;
  description?: string;
};

const DialogWithState = ({
  children,
  isOpen,
  title,
  setOpen,
  description,
}: Props) => {
  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default DialogWithState;
