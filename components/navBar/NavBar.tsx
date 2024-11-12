import Image from "next/image";
import { userRows } from "@/data/users";

const NavBar = () => {
    return (
      <nav id="nav" className="w-full flex p-5 items-center justify-between">
        <div className="flex gap-1 flex-wrap items-center justify-center">
          <Image
            src="/volleyball-bot/logo.png"
            alt="Volleyball logo"
            width={40}
            height={40}
            priority
          />
          <Image
            className="dark:invert"
            src="/volleyball-bot/name.svg"
            alt="Volleyball bot text"
            width={200}
            height={40}
            priority
          />
        </div>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2.5">
            <Image
              src="/volleyball-bot/nav-user.svg"
              width={26}
              height={26}
              alt="user icon"
            />
            <span>{userRows.find(user => user.id === 1)?.info.fullname}</span>
          </div>
        </div>
      </nav>
    );
};

export default NavBar;
