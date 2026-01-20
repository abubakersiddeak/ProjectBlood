"use client";

import { type Icon } from "@tabler/icons-react";

import { usePathname } from "next/navigation";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
}) {
  const pathname = usePathname();
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url;
            return (
              <SidebarMenuItem key={item.title}>
                <Link href={item.url} className="w-full rounded-none">
                  <SidebarMenuButton
                    className={`cursor-pointer rounded-xs text-gray-700 w-full flex items-center gap-2 ${
                      isActive ? "bg-gray-200 " : " hover:bg-gray-100"
                    }`}
                    tooltip={item.title}
                  >
                    {item.icon && <item.icon className="w-5 h-5" />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
