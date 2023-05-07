export const ROLES = {
  ADMIN: "Admin",
  CUSTOMER: "Customer",
  EMPLOYEE: "Employee",
};

export const SORT_TYPES = {
  DEFAULT: "default",
  DESC: "desc",
  ASC: "asc",
};

interface Schedules {
  [key: string]: {
    [key: string]: string;
  };
}

export const SCHEDULES: Schedules = {
  "San Juan": {
    "09:00": "09:00",
    "20:00": "20:00",
  },
  Mendoza: {
    "09:00": "20:00",
    "20:30": "20:30",
  },
};

export const STATUS = {
  PENDING: "Pendiente",
  DELIVERED: "Entregado",
  TODAY: "Entrega Hoy",
};

interface StatusStyles {
  [status: string]: string;
}

export const statusClass: StatusStyles = {
  [STATUS.PENDING]: "py-1 px-3 bg-yellow-100 rounded-xl text-slate-800",
  [STATUS.TODAY]: "py-1 px-3 bg-blue-100 rounded-xl text-slate-800",
  [STATUS.DELIVERED]: "py-1 px-3 bg-green-100 rounded-xl text-slate-800",
};

export const ADMIN_ORDERS_SORT = {
  "LAST ORDERS": "LAST ORDERS",
  "NEXT ORDERS": "NEXT ORDERS",
  HISTORY: "HISTORY",
};
