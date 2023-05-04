export type Category = {
  id: string;
  name: string;
};

export type Location = {
  id: string;
  name: string;
};

export type Role = {
  id: string;
  name: string;
};

export type Equipment = {
  id: string;
  name: string;
  brand: string;
  model: string;
  image: string | null;
  quantity: number;
  price: number;
  accessories: string[];
  available: boolean;
  category?: Category;
  owner?: EquipmentOnOwner[];
};

export type Owner = {
  id: string;
  name: string;
  equipments?: EquipmentOnOwner[];
};

export type EquipmentOnOwner = {
  id: string;
  equipment?: Equipment;
  equipmentId: string;
  location: Location;
  locationId: string;
  owner?: Owner;
  ownerId: string;
  stock: number;
  created_at: Date;
  book?: string;
};

export type Book = {
  id: string;
  start_date: Date;
  end_date: Date;
  pickup_hour: string;
  return_hour: string;
  equipments?: BookOnEquipment;
};

export type BookOnEquipment = {
  equipment?: EquipmentOnOwner;
  equipmentId: string;
  book?: Book;
  bookId: string;
  quantity: number;
  created_at: Date;
};
