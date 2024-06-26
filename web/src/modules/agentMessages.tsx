import { Agent, agentsSelector } from "@/redux/agentsSlice";
import { Task, selectedTaskSelector } from "@/redux/tasksSlice";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Separator } from "@/components/ui/separator";

export default function AgentMessages() {
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

  const agentResponsesByAgent = task?.agentsResponses?.reduce(
    (
      byAgent: { [key: string]: string[] },
      response: { agentId: string; message: string }
    ) => {
      if (byAgent[response.agentId]) {
        byAgent[response.agentId].push(response.message);
      } else {
        byAgent[response.agentId] = [response.message];
      }
      return byAgent;
    },
    {} as { [key: string]: string[] }
  );

  return (
    <section className="h-full mr-8">
      <div className="flex">
        {agentsWithStatuses.map((agent) => (
          <div key={agent.id} className="flex-1 text-left">
            {agentResponsesByAgent?.[agent.id]?.map((r) => (
              <>
                <p>{r?.toString()}</p>
                <Separator className="mt-2 mb-2" />
              </>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
