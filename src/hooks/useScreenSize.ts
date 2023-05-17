import { useEffect, useState } from "react";

export const useScreenSize = () => {
  const [sheetSize, setSheetSize] = useState<"full" | "lg" | "default">(
    "default"
  );

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width <= 640) {
        setSheetSize("full");
      } else if (width <= 768) {
        setSheetSize("lg");
      } else {
        setSheetSize("default");
      }
      console.log(width);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return { sheetSize };
};
