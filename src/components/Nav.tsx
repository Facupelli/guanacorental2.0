import { useBoundStore } from "@/zustand/store";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, UserCog } from "lucide-react";
import { ROLES } from "@/lib/magic_strings";
import { type Session } from "next-auth";
import { useRouter } from "next/router";

const Nav = () => {
  const router = useRouter();
  const { data: session } = useSession();

  const setOpenCartModal = useBoundStore((state) => state.setOpenCartModal);
  const showCartModal = useBoundStore((state) => state.showCartModal);

  const isAdmin = (session: Session | null) => {
    return !!session?.user.role.find((role) => role.name === ROLES.ADMIN);
  };

  const handleOpenCart = () => {
    if (showCartModal) {
      return;
    }
    setOpenCartModal();
  };
  return (
    <header>
      <nav className="fixed z-30 w-full bg-primary px-6 ">
        <ul className="flex h-[70px] items-center gap-6">
          <li>
            <Link href="/">
              <div className="relative aspect-square w-14">
                <Image
                  src="/guanaco-rental-logo.svg"
                  alt="guanaco rental logo"
                  fill
                />
              </div>
            </Link>
          </li>

          <li className="ml-auto">
            <p
              className="flex cursor-pointer items-center gap-2 text-white"
              onClick={handleOpenCart}
            >
              CARRITO
              <ShoppingCart className="h-4 w-4" />
            </p>
          </li>

          {isAdmin(session) && (
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
              </li>
              <li>
                <button
                  onClick={() => void signIn("facebook")}
                  className="flex h-[35px] items-center bg-white px-4 text-[#3c4043]"
                >
                  <p className="whitespace-nowrap text-[13px] font-medium tracking-[0.25px]">
                    Acceder con Facebook
                  </p>
                </button>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Nav;
