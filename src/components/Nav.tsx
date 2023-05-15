import { signIn, signOut, useSession } from "next-auth/react";
import { useBoundStore } from "@/zustand/store";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

import { FacebookIcon, Menu, ShoppingCart, UserCog } from "lucide-react";

import { getIsAdmin, getIsEmployee } from "@/lib/utils";

const Nav = () => {
  const router = useRouter();
  const { data: session } = useSession();

  const setOpenCartModal = useBoundStore((state) => state.setOpenCartModal);
  const showCartModal = useBoundStore((state) => state.showCartModal);

  const isAdmin = getIsAdmin(session);
  const isEmployee = getIsEmployee(session);

  const handleOpenCart = () => {
    if (showCartModal) {
      return;
    }
    setOpenCartModal();
  };
  return (
    <header>
      <nav className="fixed z-30 flex h-[70px] w-full items-center gap-6 bg-primary px-6">
        <div>
          <Link href="/">
            <div className="relative aspect-square w-14">
              <Image
                src="/guanaco-rental-logo.svg"
                alt="guanaco rental logo"
                fill
              />
            </div>
          </Link>
        </div>

        <div className="ml-auto">
          <p
            className="flex cursor-pointer items-center gap-2 text-white"
            onClick={handleOpenCart}
          >
            <span className="hidden sm:block">CARRITO</span>
            <ShoppingCart className="h-5 w-5 sm:h-4 sm:w-4" />
          </p>
        </div>

        <input
          type="checkbox"
          name="click"
          className="peer hidden"
          id="click"
        />
        <label htmlFor="click" className="text-white sm:hidden">
          <Menu className="h-5 w-5" />
        </label>

        <ul className="fixed left-[-110%] top-[70px] flex h-screen w-[60%] flex-col justify-start gap-6 bg-primary p-4 transition-all duration-300 ease-in-out peer-checked:left-0 sm:relative sm:top-0 sm:h-[70px] sm:w-auto sm:flex-row sm:justify-end">
          {(isAdmin || isEmployee) && (
            <li className="cursor-pointer  text-white">
              <button
                className="flex items-center gap-2"
                onClick={() => void router.push("/admin")}
              >
                ADMIN
                <UserCog className="h-4 w-4" />
              </button>
            </li>
          )}

          {session ? (
            <li className="text-white">
              <button onClick={() => void signOut()}>SALIR</button>
            </li>
          ) : (
            <>
              <li>
                <GoogleButton />
              </li>
              <li>
                <FacebookButton />
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export const GoogleButton = () => {
  return (
    <button
      onClick={() => void signIn("google")}
      className="flex h-[35px] items-center bg-white px-4 text-[#3c4043]"
    >
      <div className="mr-2 flex items-center">
        <Image
          src="/google/g-logo.png"
          width={18}
          height={18}
          alt="google g logo"
        />
      </div>
      <p className="whitespace-nowrap text-[13px] font-medium tracking-[0.25px]">
        Acceder con Google
      </p>
    </button>
  );
};

export const FacebookButton = () => {
  return (
    <button
      onClick={() => void signIn("facebook")}
      className="flex h-[35px] items-center bg-white px-4 text-[#3c4043]"
    >
      <div className="flex items-center gap-2 whitespace-nowrap text-[13px] font-medium tracking-[0.25px]">
        <FacebookIcon className="h-4 w-4" /> Acceder con Facebook
      </div>
    </button>
  );
};

export default Nav;
