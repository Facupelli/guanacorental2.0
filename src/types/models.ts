export type Category = {
  id: string;
  name: string;
};

export type Location = {
  id: string;
  name: string;
};

export type Equipment = {
  id: string;
  location?: Location;
  name: string;
  brand: string;
  model: string;
  image: string;
  stock: number;
  price: number;
  accessories: string[];
  category?: Category;
  available: boolean;
};
