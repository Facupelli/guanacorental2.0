import dayjs from "dayjs";
import { SCHEDULES } from "./constants";

export const toArgentinaDate = (date: Date) => {
  return new Date(date).toLocaleDateString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
  });
};

export const getDatesInRange = (startDate: Date, endDate: Date) => {
  const dates = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate.getTime()));

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

export const getTotalWorkingDays = (dates: Date[], pickupHour: string) => {
  let weekDay = 0;
  let weekendDay = 0;
  const datesToBook = dates.slice(0, -1);

  if (!datesToBook[0]) return;

  for (const day of datesToBook) {
    const newDay = new Date(day).getDay();

    //si es sabado o domingo
    if (newDay === 6 || newDay === 0) {
      weekendDay += 1;
    } else {
      //si es el primer dia
      if (
        new Date(day).getTime() === new Date(datesToBook[0]).getTime() &&
        newDay === 5 &&
        pickupHour === SCHEDULES["San Juan"]!.am
      ) {
        weekDay += 0.5;
      } else if (
        new Date(day).getTime() === new Date(datesToBook[0]).getTime() &&
        newDay === 5 &&
        (pickupHour === SCHEDULES["San Juan"]!.pm ||
          pickupHour === SCHEDULES["Mendoza"]!.pm ||
          pickupHour === SCHEDULES["San Luis"]!.pm)
      ) {
        weekDay += 0;
      }
      //si es cualquier otro dia de la semana habil
      else {
        weekDay += 1;
      }
    }
  }

  return weekDay + weekendDay / 2;
};

export const disableWeekend = (
  startDate: Date | undefined,
  endDate: Date | undefined
) => {
  if (
    dayjs(startDate).day() === 6 ||
    dayjs(startDate).day() === 0 ||
    dayjs(endDate).day() === 6 ||
    dayjs(endDate).day() === 0
  ) {
    return true;
  }

  return false;
};
