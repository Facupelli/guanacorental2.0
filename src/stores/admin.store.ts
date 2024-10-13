import { create } from "zustand";

interface AdminStore {
  calendarDay: Date;
  ordersCurrentPage: number;
  rolesUserSearch: string;
  actions: {
    setCalendarDay: (day: Date) => void;
    setOrdersCurrentPage: (page: number) => void;
    setRolesUserSearch: (userSearch: string) => void;
  };
}

const useAdminStore = create<AdminStore>((set) => ({
  calendarDay: new Date(),
  ordersCurrentPage: 1,
  rolesUserSearch: "",
  actions: {
    setCalendarDay: (day) => set(() => ({ calendarDay: day })),
    setOrdersCurrentPage: (page) => set(() => ({ ordersCurrentPage: page })),
    setRolesUserSearch: (userSearch) =>
      set(() => ({ rolesUserSearch: userSearch })),
  },
}));

export const useAdminCalendarDay = () =>
  useAdminStore((state) => state.calendarDay);
export const useAdminOrdersCurrentPage = () =>
  useAdminStore((state) => state.ordersCurrentPage);
export const useAdminRolesUserSearch = () =>
  useAdminStore((state) => state.rolesUserSearch);

export const useAdminStoreActions = () =>
  useAdminStore((state) => state.actions);
