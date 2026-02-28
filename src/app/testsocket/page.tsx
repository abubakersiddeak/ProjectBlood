"use client";

import ChatPageContent from "@/components/shared/ChatPageContent";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatPageContent />
    </Suspense>
  );
}
