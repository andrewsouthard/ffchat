import "./App.css";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./components/ui/resizable";
import TasksList from "./modules/tasksList";
import TaskOverview from "./modules/taskOverview";

export default function App() {
  return (
    <div className="h-full">
      <header className="flex items-center text-gray-800 justify-start">
        <h1 className="text-4xl">🤖 Agent Face Off</h1>
        <Button variant="ghost" className="ml-auto">
          <Settings size={24} className="text-gray-600" />
        </Button>
      </header>
      <ResizablePanelGroup direction="horizontal" className="mt-4">
        <ResizablePanel defaultSize={20} className="p-4">
          <TasksList />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel className="p-2">
          <TaskOverview />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
