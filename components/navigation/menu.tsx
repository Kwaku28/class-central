import { currentUser } from "@clerk/nextjs/server";
import NavLink from "./navLinks";
import { menuItems } from "@/lib/data";

const Menu = async () => {
  const user = await currentUser();
  const role = user?.publicMetadata.role as string;
  return (
    <div className="mt-4 text-sm remove-scrollbar overflow-y-scroll h-[calc(100vh-4rem)]">
      {menuItems.map((i) => (
        <div className="flex flex-col gap-2" key={i.title}>
          <span className="hidden lg:block text-gray-400 font-light my-3">
            {i.title}
          </span>
          <div>
            {i.items.map((item) => {
              if (item.visible.includes(role)) {
                return (
                  <NavLink
                    key={item.label}
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                  />
                );
              }
              return null;
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Menu;
