"use client";

import DialogWithState from "@components/DialogWithState";
import { Label } from "@components/ui/label";
import SelectLocation from "@components/ui/SelectLocation";
import { handleLocationChange } from "~/lib/utils";
import { useLocationStoreActions, useShowLocationModal } from "~/stores/location.store";

export default function ShowLocationDialog() {
  const { toggleModal, setLocation } = useLocationStoreActions();
  const showLocationModal = useShowLocationModal();

  return (
    <DialogWithState title="¿DONDE QUERÉS ALQUILAR?" isOpen={showLocationModal} setOpen={toggleModal}>
      <Label htmlFor="location" className="col-span-1">
        Sucursal:
      </Label>
      <SelectLocation
        placeholder="seleccionar"
        onValueChange={(e) => handleLocationChange(e, setLocation, toggleModal)}
      />
    </DialogWithState>
  );
}
