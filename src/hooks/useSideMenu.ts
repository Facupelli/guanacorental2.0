import { type ChangeEvent, useState } from "react";

export const useSideMenu = () => {
  const [showSideMenu, setShowSideMenu] = useState(false);

  const handleShowSideMenu = (event: ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    setShowSideMenu(event.target.checked);
  };

  return { showSideMenu, handleShowSideMenu, setShowSideMenu };
};
