export type Category = {
  id: string;
  name: string;
  order: number;
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
  books?: BookOnEquipment[];
};

export type EquipmentOnOwner = {
  id: string;
  stock: number;
  books?: BookOnEquipment[];
  equipment?: Equipment;
  equipmentId: string;
  owner?: Owner;
  ownerId: string;
  location: Location;
  locationId: string;
  created_at: Date;
  deleted: boolean;
};

export type Book = {
  id: string;
  start_date: Date;
  end_date: Date;
  pickup_hour: string | null;
  return_hour: string | null;
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

export type Order = {
  id: string;
  number: number;
  // customer:User;
  customerId: string;
  book: Book;
  bookId: string;
  location: Location;
  locationId: string;
  equipments: EquipmentOnOwner[];
  deliver_status: string;
  return_status: string;
  earnings: Earning[];
  subtotal: number;
  total: number;
  message?: string;

  created_at: Date;
  updated_at: Date;
};

export type Earning = {
  id: string;
  total: number;
  order: Order;
  orderId: string;
};
