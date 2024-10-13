import { trpc } from "~/trpc/server";
import ClientEquipmentAdmin from "./page.client";

export default async function AdminEquipmentPage() {
  const locations = await trpc.location.getAllLocations();
  const categories = await trpc.category.getAllCategories();
  const owners = await trpc.owner.getOwners();

  return <ClientEquipmentAdmin locations={locations} categories={categories} owners={owners} />;
}
