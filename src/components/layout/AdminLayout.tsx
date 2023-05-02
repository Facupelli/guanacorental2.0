import { ReactNode } from "react";
import AdminNav from "../AdminNav";

type Props = {
  children: ReactNode;
};

const AdminLayout = ({ children }: Props) => {
  return (
    <div className="pt-[70px]">
      <div className="fixed top-[70px] w-[180px]">
        <AdminNav />
      </div>
      <div className="ml-[180px] px-6">{children}</div>
    </div>
  );
};

export default AdminLayout;
