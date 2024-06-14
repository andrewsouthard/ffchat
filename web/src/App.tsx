import "./App.css";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import AgentTabs from "./modules/agentTabs";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./components/ui/resizable";

export default function App() {
  return (
    <div>
      <header className="flex items-center text-gray-800 justify-start">
        <h1 className="text-4xl">Agent Face Off 🤖</h1>
        <Button variant="ghost" className="ml-auto">
          <Settings size={24} className="text-gray-600" />
        </Button>
      </header>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={20} className="p-4">
          <h2 className="text-2xl">Tasks</h2>
          <ScrollArea></ScrollArea>
        </ResizablePanel>

        <ResizableHandle />
        <ResizablePanel>
          <AgentTabs />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
