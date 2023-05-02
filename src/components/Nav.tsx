import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

const Nav = () => {
  const { data: session } = useSession();

  return (
    <header>
      <nav className="fixed w-full bg-brand-primary px-6 text-white">
        <ul className="flex h-[70px] items-center gap-4">
          <li>
            <button
              onClick={async () => await signIn("google")}
              className="flex items-center"
            >
              <div className="mr-2 flex items-center">
                <Image
                  src="/google/g-logo.png"
                  width={18}
                  height={18}
                  alt="google g logo"
                />
              </div>
              <p>Acceder con Google</p>
            </button>
          </li>
          <li>
            <button onClick={() => signIn("facebook")}>
              <p>Acceder con Facebook</p>
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Nav;
