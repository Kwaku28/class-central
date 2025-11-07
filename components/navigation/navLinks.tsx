"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

type NavLinkProps = {
  href: string;
  icon: string;
  label: string;
};

const NavLink = ({ href, icon, label }: NavLinkProps) => {
  const pathname = usePathname();
  const isActive =
    pathname === href || (href !== "/" && pathname?.startsWith(href));

  return (
    <Link
      href={href}
      className={`flex items-center justify-center lg:justify-start gap-4 py-2 md:px-2 rounded-md hover:bg-classSkyLight ${
        isActive ? "text-green-400" : "text-gray-500"
      }`}
      aria-current={pathname === href ? "page" : undefined}
    >
      <Image src={icon} alt="menu icon" width={20} height={20} />
      <span className="hidden lg:block">{label}</span>
    </Link>
  );
};

export default NavLink;
