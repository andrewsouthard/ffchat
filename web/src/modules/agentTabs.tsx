import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Plus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AddAgent } from "./addAgent";
import { useDispatch, useSelector } from "react-redux";
import {
  Task,
  selectedTaskSelector,
  toggleAgentsState,
} from "@/redux/tasksSlice";
import { Agent, agentsSelector } from "@/redux/agentsSlice";
import { useMemo, useState } from "react";

export default function AgentTabs() {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const task: Task = useSelector(selectedTaskSelector);
  const agents = useSelector(agentsSelector);

  const agentsWithStatuses: (Agent & { status: string })[] = useMemo(
    () =>
      agents.map((a: Agent) => {
        const agentState = task?.agentStatuses?.find(
          (as) => as.agentId === a.id
        );
        return {
          ...a,
          status: agentState?.status || "disabled",
        };
      }),
    [task, agents]
  );

  const onChangeAgentState = (agentId: string[] | string) => {
    const agentsList = typeof agentId === "string" ? [agentId] : agentId;
    dispatch(toggleAgentsState(agentsList));
  };

  return (
    <div className="flex flex-row">
      <ToggleGroup
        type="multiple"
        onValueChange={onChangeAgentState}
        value={agentsWithStatuses
          .filter((a) => a.status === "enabled")
          .map((a) => a.id)}
      >
        {agentsWithStatuses.map((agent) => (
          <ToggleGroupItem className="text-xl" value={agent.id} key={agent.id}>
            {agent.name}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <Popover open={open} onOpenChange={(o) => setOpen(o)}>
        <PopoverTrigger className="py-2 p-3" onClick={() => setOpen(true)}>
          <Plus size={24} className="text-grey-200 h-9" />
        </PopoverTrigger>
        {/* https://www.radix-ui.com/primitives/docs/components/popover#custom-apis */}
        <PopoverContent>
          <AddAgent onClose={() => setOpen(false)} />
        </PopoverContent>
      </Popover>
    </div>
  );
}
