type CartItem = {
  id?: string;
  quantity: number;
  price: number;
  owner?:
    | {
        id: string;
        ownerId: string;
        stock: number;
        locationId: string;
        ownerName?: string | undefined;
      }[]
    | undefined;
};

export const getEquipmentOnOwnerIds = (item: CartItem, quantity: number) => {
  // Ordena el arreglo de owners según la prioridad especificada
  const sortByOwnerPriority = (owners: any[]) => {
    const ownerPriority = ["Both", "Fede", "Oscar", "Sub"];
    return owners.sort(
      (a, b) =>
        ownerPriority.indexOf(a.ownerName) - ownerPriority.indexOf(b.ownerName)
    );
  };

  const owners = sortByOwnerPriority(item.owner!);

  // Recorre cada dueño para obtener la cantidad deseada
  let remainingQuantity = quantity;
  const result: { id: string; quantity: number }[] = [];
  for (const owner of owners) {
    if (owner.stock >= remainingQuantity) {
      // Si el dueño tiene suficiente stock, agrega su ID y la cantidad deseada y finaliza el bucle
      result.push({ id: owner.id, quantity: remainingQuantity });
      break;
    } else {
      // Si el dueño no tiene suficiente stock, agrega su ID y la cantidad de stock disponible y actualiza la cantidad restante
      result.push({ id: owner.id, quantity: owner.stock });
      remainingQuantity -= owner.stock;
    }
  }

  return result;
};
