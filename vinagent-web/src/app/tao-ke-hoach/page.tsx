"use client";

import { ChatPanel } from "@/components/chat-panel";
import { ResultPanel } from "@/components/result-panel";

export default function CreatePlanPage() {
  return (
    <div className="flex flex-1 overflow-hidden h-[calc(100dvh-1px)]">
      <div className="flex w-full flex-col border-r border-border/50 md:w-[42%] lg:w-[38%]">
        <ChatPanel />
      </div>
      <div className="hidden flex-1 md:flex md:flex-col">
        <ResultPanel />
      </div>
    </div>
  );
}
