import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import prisma from "@/lib/prisma";
import Link from "next/link";

const Navbar = async () => {
  const user = await currentUser();

  let messageCount = 0;
  try {
    if (user) {
      const role = (user?.publicMetadata?.role ?? "") as string;
      const id = user.id;

      if (role === "teacher") {
        messageCount = await prisma.message.count({
          where: {
            OR: [
              { receiverTeacherId: id },
              { recipientType: "all_teachers" },
            ],
          },
        });
      } else if (role === "student") {
        messageCount = await prisma.message.count({
          where: {
            OR: [
              { receiverStudentId: id },
              { recipientType: "all_students" },
            ],
          },
        });
      } else if (role === "parent") {
        messageCount = await prisma.message.count({
          where: {
            OR: [
              { receiverParentId: id },
              { recipientType: "all_parents" },
            ],
          },
        });
      }
    }
  } catch (err) {
    console.error("Failed to fetch message count", err);
    messageCount = 0;
  }

  const announcementCount = 10;

  return (
    <div className="flex items-center justify-between p-4">
      {/* SEARCH BAR */}
      <div className="hidden md:flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2">
        <Image src="/icons/search.png" alt="" width={14} height={14} />
        <input
          type="text"
          placeholder="Search..."
          className="w-[200px] p-2 bg-transparent outline-none"
        />
      </div>
      {/* ICONS AND USER */}
      <div className="flex items-center gap-6 justify-end w-full">
        <Link href={`/list/messages`} className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative">
          <Image src="/icons/message.png" alt="" width={20} height={20} />
          {messageCount > 0 && (
            <div className="absolute -top-3 -right-3 w-6 h-6 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs">
              {messageCount > 99 ? "99+" : messageCount}
            </div>
          )}
        </Link>
        <Link href={`/list/announcements`} className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative">
          <Image src="/icons/announcement.png" alt="" width={20} height={20} />
          {announcementCount > 0 && (
            <div className="absolute -top-3 -right-3 w-6 h-6 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs">
              {announcementCount > 99 ? "99+" : announcementCount}
            </div>
          )}
        </Link>
        <div className="flex flex-col">
          <span className="text-xs leading-3 font-medium">
            {user?.firstName} {user?.lastName}
          </span>
          <span className="text-[10px] text-gray-500 text-right">
            {user?.publicMetadata?.role as string}
          </span>
        </div>
        <UserButton />
      </div>
    </div>
  );
};

export default Navbar;
