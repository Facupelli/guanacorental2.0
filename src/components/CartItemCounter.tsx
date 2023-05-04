import type { Equipment, EquipmentOnOwner } from "@/types/models";
import { Button } from "./ui/button";
import { useBoundStore } from "@/zustand/store";

type Props = {
  item: Equipment;
};

const CartItemCounter = ({ item }: Props) => {
  const location = useBoundStore((state) => state.location);
  const addItemQuantity = useBoundStore((state) => state.addItemQuantity);
  const substractItemQuantity = useBoundStore(
    (state) => state.substractItemQuantity
  );

  const getEquipmentStock = (
    owner: EquipmentOnOwner[] | undefined,
    location: string
  ) => {
    if (owner) {
      return owner
        .filter((owner) => owner.location.name === location)
        .reduce((acc, curr) => {
          return acc + curr.stock;
        }, 0);
    }
  };

  const equipmentStock = getEquipmentStock(item.owner, location);

  console.log(item);

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
        className="h-6 w-4"
        onClick={() => handleSubstractItemQuantity(item.id)}
        disabled={item.quantity === 1}
      >
        -
      </Button>
      <p>{item.quantity}</p>
      <Button
        size="sm"
        className="h-6 w-4"
        onClick={() => handleAddItemQuantity(item.id)}
        disabled={equipmentStock === item.quantity}
      >
        +
      </Button>
    </div>
  );
};

export default CartItemCounter;
