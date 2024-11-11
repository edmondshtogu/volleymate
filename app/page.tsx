import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="flex gap-1 flex-wrap items-center justify-center">
          <Image
            src="/volleyball.png"
            alt="Volleyball logo"
            width={40}
            height={40}
            priority
          />
          <Image
            className="dark:invert"
            src="/volleyball-bot.svg"
            alt="Volleyball bot text"
            width={200}
            height={40}
            priority
          />
        </div>

        <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2">BOT is up and running :)</li>
          <li className="mb-2">
            <Link href="/privacy-policy">Privacy Policy</Link>
          </li>
        </ol>
      </main>
    </div>
  );
}
