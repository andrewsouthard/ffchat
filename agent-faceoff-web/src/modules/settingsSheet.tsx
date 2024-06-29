import { Button } from "@/components/ui/button";
import { Trash, Settings } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useDispatch, useSelector } from "react-redux";
import { agentsSelector, removeAgent } from "@/redux/agentsSlice";
import { Separator } from "@/components/ui/separator";

export default function SettingsSheet() {
  const agents = useSelector(agentsSelector);
  const dispatch = useDispatch();

  const onDeleteAgent = (id: string) => {
    if (
      confirm(
        "Deleting this agent will remove all task responses. Are you sure?"
      )
    ) {
      dispatch(removeAgent(id));
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="ml-auto">
          <Settings size={24} className="text-gray-600" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <Separator className="mt-4 mb-4" />
          <SheetDescription>
            <h2 className="text-lg mt-2 mb-2">Agents</h2>
            {agents.map((agent) => {
              return (
                <div
                  key={agent.id}
                  className="flex flex-row justify-between items-center"
                >
                  <span>{agent.name}</span>
                  <Button
                    variant="ghost"
                    onClick={() => onDeleteAgent(agent.id)}
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              );
            })}
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
