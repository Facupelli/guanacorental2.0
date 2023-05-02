import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

const Nav = () => {
  const { data: session } = useSession();

  return (
    <header>
      <nav className="fixed w-full bg-brand-primary px-6 ">
        <ul className="flex h-[70px] items-center gap-4">
          <li>
            <button
              onClick={async () => await signIn("google")}
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
              onClick={() => signIn("facebook")}
              className="flex h-[35px] items-center bg-white px-4 text-[#3c4043]"
            >
              <p className="whitespace-nowrap text-[13px] font-medium tracking-[0.25px]">
                Acceder con Facebook
              </p>
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Nav;
