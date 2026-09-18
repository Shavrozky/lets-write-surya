import { Link, useLocation } from "react-router-dom";
import { BookMarked, Home, Library, PenLine } from "lucide-react";

const navItems = [
  { label: "Home Komunitas", path: "/creator", icon: Home },
  { label: "Stories", path: "/creator/stories", icon: BookMarked },
  { label: "Write", path: "/creator/write", icon: PenLine },
  { label: "Library", path: "/creator/library", icon: Library },
];

export default function CreatorSidebar() {
  const location = useLocation();

  return (
    <aside className="md:sticky md:top-20 md:h-[calc(100vh-6rem)]">
      <div className="flex gap-2 overflow-x-auto border-b border-neutral-200 pb-3 md:block md:space-y-1 md:border-b-0 md:pb-0">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === "/creator"
              ? location.pathname === "/creator"
              : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-sm transition md:w-full md:rounded-lg ${
                isActive
                  ? "bg-neutral-950 text-white"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
              }`}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
