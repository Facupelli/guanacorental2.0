import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

import { FacebookIcon, LogOut, Menu, UserCog } from "lucide-react";

import { getIsAdmin, getIsEmployee } from "@/lib/utils";
import Cart from "./Cart";
import { useSideMenu } from "@/hooks/useSideMenu";

const Nav = () => {
  const router = useRouter();
  const { data: session } = useSession();

  const { showSideMenu, handleShowSideMenu, setShowSideMenu } = useSideMenu();

  const isAdmin = getIsAdmin(session);
  const isEmployee = getIsEmployee(session);

  return (
    <header>
      <nav className="fixed z-30 w-full items-center bg-primary px-6">
        <div className="mx-auto flex h-[70px] w-full max-w-7xl items-center gap-6">
          <div>
            <Link href="/">
              <div className="relative aspect-square w-12 sm:w-14">
                <Image
                  src="/guanaco-rental-logo.svg"
                  alt="guanaco rental logo"
                  fill
                />
              </div>
            </Link>
          </div>

          <div className="ml-auto">
            <Link href="/" className="text-white">
              RESERVAS
            </Link>
          </div>

          <div>
            <Cart trigger />
          </div>

          <input
            type="checkbox"
            name="click"
            className="peer hidden"
            id="click"
            checked={showSideMenu}
            onChange={handleShowSideMenu}
          />
          <label htmlFor="click" className="text-white sm:hidden">
            <Menu className="h-6 w-6" />
          </label>

          <ul className="fixed left-[-110%] top-[70px] z-20 flex h-screen w-[60%] flex-col justify-start gap-6 bg-primary p-4 text-white transition-all duration-300 ease-in-out peer-checked:left-0 sm:relative sm:left-0 sm:top-0 sm:h-[70px] sm:w-auto sm:flex-row sm:items-center sm:justify-end sm:p-0 sm:text-white">
            <li>
              <Link href="/faq" className="text-white">
                FAQ
              </Link>
            </li>

            {(isAdmin || isEmployee) && (
              <li className="cursor-pointer">
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
              <li>
                <button
                  onClick={() => void signOut()}
                  className="flex items-center gap-2"
                >
                  SALIR
                  <LogOut className="h-4 w-4" />
                </button>
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

          {showSideMenu && (
            <div
              onClick={() => setShowSideMenu(false)}
              className="fixed right-0 top-[70px] z-10 h-screen w-full bg-background/30 backdrop-blur-sm"
            />
          )}
        </div>
      </nav>
    </header>
  );
};

export const GoogleButton = () => {
  return (
    <button
      onClick={() => void signIn("google")}
      className="flex h-[35px] items-center rounded-[2px] border border-[#dadce0] bg-[#fff] px-[12px] "
    >
      <div className="mr-2 h-[18px] w-[18px]">
        <Image
          src="/google/g-logo.png"
          width={18}
          height={18}
          alt="google g logo"
        />
      </div>
      <p className="whitespace-nowrap font-roboto text-[13px] font-semibold tracking-[0.25px] text-[#3c4043]">
        Acceder con Google
      </p>
    </button>
  );
};

export const FacebookButton = () => {
  return (
    <button
      onClick={() => void signIn("facebook")}
      className="h-[35px] rounded-[2px] border border-[#1a77f2] bg-[#1a77f2] px-2 text-[#3c4043]  sm:px-4"
    >
      <div className="flex items-center whitespace-nowrap font-roboto  text-[13px] font-semibold tracking-[0.25px] text-[#fff]">
        <FacebookIcon className="mr-2 h-4 w-4" /> Acceder con Facebook
      </div>
    </button>
  );
};

export default Nav;
