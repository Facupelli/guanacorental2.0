export const ROLES = {
  ADMIN: "Admin",
  CUSTOMER: "Customer",
  EMPLOYEE: "Employee",
};

export const LocationName = {
  MENDOZA: "Mendoza",
  SAN_JUAN: "San Juan",
  SAN_LUIS: "San Luis",
};

export const DISCOUNT_TYPES = {
  FIXED: "Fixed",
  PERCENTAGE: "Percentage",
};

export const SORT_TYPES = {
  DEFAULT: "default",
  DESC: "desc",
  ASC: "asc",
};

export type LocationNames = "San Juan" | "Mendoza" | "San Luis";

export interface Schedule {
  am: string;
  pm: string;
}

type Schedules = {
  [K in LocationNames]: Schedule;
};

export const SCHEDULES: Schedules = {
  "San Juan": {
    am: "09:00",
    pm: "20:00",
  },
  Mendoza: {
    am: "09:00",
    pm: "20:30",
  },
  "San Luis": {
    am: "09:00",
    pm: "18:00",
  },
};

export const ORDER_DELIVER_STATUS = {
  PENDING: "Pendiente",
  DELIVERED: "Entregado",
  TODAY: "Entrega Hoy",
};

export const ORDER_RETURN_STATUS = {
  PENDING: "Pendiente",
  RETURNED: "Devuelto",
};

export const COUPON_STATUS = {
  PENDING: "Pendiente",
  ENDED: "Finalizado",
  ACTIVE: "Activo",
};

interface StatusStyles {
  [status: string]: string;
}

export const orderStatusClass: StatusStyles = {
  [ORDER_DELIVER_STATUS.PENDING]:
    "py-1 px-3 bg-yellow-100 rounded-xl text-slate-800",
  [ORDER_DELIVER_STATUS.TODAY]:
    "py-1 px-3 bg-blue-100 rounded-xl text-slate-800",
  [ORDER_DELIVER_STATUS.DELIVERED]:
    "py-1 px-3 bg-green-100 rounded-xl text-slate-800",
};

export const orderReturnedClass: StatusStyles = {
  [ORDER_RETURN_STATUS.RETURNED]:
    "py-1 px-3 bg-green-100 rounded-xl text-slate-800",
  [ORDER_RETURN_STATUS.PENDING]:
    "py-1 px-3 bg-red-100 rounded-xl text-slate-800",
};

export const discountStatusClass = {
  [COUPON_STATUS.PENDING]:
    "py-1 px-3 bg-yellow-100 rounded-xl text-slate-800 w-fit",
  [COUPON_STATUS.ENDED]: "py-1 px-3 bg-red-100 rounded-xl text-slate-800 w-fit",
  [COUPON_STATUS.ACTIVE]:
    "py-1 px-3 bg-green-100 rounded-xl text-slate-800 w-fit",
};

export const ADMIN_ORDERS_SORT = {
  "LAST ORDERS": "LAST ORDERS",
  "NEXT ORDERS": "NEXT ORDERS",
  HISTORY: "HISTORY",
};

interface Months {
  [month: string]: string;
}

export const MONTHS: Months = {
  Enero: "01",
  Febrero: "02",
  Marzo: "03",
  Abril: "04",
  Mayo: "05",
  Junio: "06",
  Julio: "07",
  Agosto: "08",
  Octubre: "09",
  Septiembre: "10",
  Noviembre: "11",
  Diciembre: "12",
};

export const yearList = ["2023", "2024", "2025", "2026"];

export const monthList = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Octubre",
  "Septiembre",
  "Noviembre",
  "Diciembre",
];

export const ADMIN_ROUTES = {
  CALENDARIO: "Calendario",
  PEDIDOS: "Pedidos",
  CLIENTES: "Clientes",
  EQUIPOS: "Equipos",
  RENTAS: "Rentas",
  DESCUENTOS: "Descuentos",
};
