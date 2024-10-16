import type { Equipment, EquipmentOnOwner } from "types/models";
import { Button } from "./ui/button";
import { useLocation } from "~/stores/location.store";
import { useCartStoreActions } from "~/stores/cart.store";

type Props = {
  item: Equipment;
};

const CartItemCounter = ({ item }: Props) => {
  const location = useLocation();
  const { addItemQuantity, substractItemQuantity } = useCartStoreActions();

  const getEquipmentStock = (owner: EquipmentOnOwner[] | undefined, location: string) => {
    if (owner) {
      return owner
        .filter((owner) => owner.location.id === location && !owner.deleted)
        .reduce((acc, curr) => {
          return acc + curr.stock;
        }, 0);
    }
  };

  const equipmentStock = getEquipmentStock(item.owner, location.id);

  const handleAddItemQuantity = (id: string) => {
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
