import React from "react";
import NotificationCard from "../card/NotificationCard";
import { Clock, MessageCircleMore } from "lucide-react";

const card = [
  {
    title: "New Massage",
    value: 0,
    icon: <MessageCircleMore className="w-6 h-6 text-gray-700" />,
  },
  {
    title: "Donation Req",
    value: 0,
    icon: <Clock className="w-6 h-6 text-yellow-600" />,
  },
];

export default function NotificationBody() {
  return (
    <div className="@container/main flex flex-1 gap-2">
      {card.map((c) => {
        return (
          <NotificationCard
            key={c.title}
            title={c.title}
            value={c.value}
            icon={c.icon}
          />
        );
      })}
    </div>
  );
}
