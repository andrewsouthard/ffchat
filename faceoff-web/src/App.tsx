import "./App.css";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./components/ui/resizable";
import TasksList from "./modules/tasksList";
import TaskOverview from "./modules/taskOverview";
import SettingsSheet from "./modules/settingsSheet";

export default function App() {
  return (
    <div className="h-full">
      <header className="flex items-center text-gray-800 justify-start">
        <h1 className="text-4xl">🤖 Agent FaceOff</h1>
        <SettingsSheet />
      </header>
      <ResizablePanelGroup direction="horizontal" className="mt-4">
        <ResizablePanel defaultSize={20} className="p-4">
          <TasksList />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel className="p-2 h-[90vh] flex flex-col">
          <TaskOverview />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
