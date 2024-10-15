"use client";

import { useMemo } from "react";
import { disableWeekend, getDatesInRange, getTotalWorkingDays } from "~/lib/dates";
import { useEndDate, usePickupHour, useStartDate } from "~/stores/date.store";

export const useDateState = () => {
  const startDate = useStartDate();
  const endDate = useEndDate();
  const pickupHour = usePickupHour();

  const workingDays = useMemo(() => {
    if (startDate && endDate) {
      const datesInRange = getDatesInRange(startDate, endDate);
      return getTotalWorkingDays(datesInRange, pickupHour);
    }
    return undefined;
  }, [startDate, endDate, pickupHour]);

  const datesAreWeekend = useMemo(() => disableWeekend(startDate, endDate), [startDate, endDate]);

  return { datesAreWeekend, workingDays };
};
