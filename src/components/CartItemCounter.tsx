import type { Equipment } from "@/types/models";
import { Button } from "./ui/button";
import { useBoundStore } from "@/zustand/store";
import { EquipmentOnOwner } from "@prisma/client";

type Props = {
  item: Equipment;
};

const CartItemCounter = ({ item }: Props) => {
  const addItemQuantity = useBoundStore((state) => state.addItemQuantity);
  const substractItemQuantity = useBoundStore(
    (state) => state.substractItemQuantity
  );

  const getEquipmentStock = (owner: EquipmentOnOwner[] | undefined) => {
    return owner?.reduce((acc, curr) => {
      return acc + curr.stock;
    }, 0);
  };

  const equipmentStock = getEquipmentStock(item.owner);

  const handleAddItemQuantity = (id: string) => {
    console.log(equipmentStock);
    if (equipmentStock && item.quantity < equipmentStock) {
      addItemQuantity(id);
    }
  };

  const handleSubstractItemQuantity = (id: string) => {
    if (item.quantity > 1) {
      substractItemQuantity(id);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        size="sm"
        onClick={() => handleSubstractItemQuantity(item.id)}
        disabled={item.quantity === 1}
      >
        -
      </Button>
      <p>{item.quantity}</p>
      <Button
        size="sm"
        onClick={() => handleAddItemQuantity(item.id)}
        disabled={equipmentStock === item.quantity}
      >
        +
      </Button>
    </div>
  );
};

export default CartItemCounter;
