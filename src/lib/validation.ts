import { z } from "zod";

export const validationAddress = z.object({
  full_name: z.string().nonempty(),
  company: z.string().optional(),
  phone: z.string().nonempty(),
  province: z.string().nonempty(),
  city: z.string().nonempty(),
  address_1: z.string().nonempty(),
  dni_number: z.string().nonempty(),
  birth_date: z.string().nonempty(),
  occupation: z.string().nonempty(),
  student: z.boolean().optional(),
  employee: z.boolean().optional(),
  cuit: z.string().optional(),
  bank: z.string().nonempty(),
  alias: z.string().nonempty(),
  cbu: z.string().nonempty(),
  bussiness_name: z.string().optional(),
  contact_1: z.string().nonempty(),
  contact_2: z.string().nonempty(),
  bond_1: z.string().nonempty(),
  bond_2: z.string().nonempty(),
});
