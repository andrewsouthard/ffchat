import { Agent, agentsSelector } from "@/redux/agentsSlice";
import { AgentResponse, Task, selectedTaskSelector } from "@/redux/tasksSlice";
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

  const agentResponsesByAgent = useMemo(
    () =>
      task?.agentsResponses?.reduce(
        (
          byAgent: { [key: string]: AgentResponse[] },
          response: AgentResponse
        ) => {
          if (byAgent[response.agentId]) {
            byAgent[response.agentId].push(response);
          } else {
            byAgent[response.agentId] = [response];
          }
          return byAgent;
        },
        {} as { [key: string]: AgentResponse[] }
      ),
    [task]
  );

  return (
    <section className="h-full mr-8">
      <div className="flex">
        {agentsWithStatuses.map((agent) => (
          <div key={agent.id} className="flex-1 text-left max-w-full">
            {agentResponsesByAgent?.[agent.id]?.map((r, idx) => (
              <div
                key={idx.toString()}
                className="text-wrap break-words group max-w-[100%]"
              >
                <p>{r.message?.toString()}</p>
                <p className="text-xs text-gray-400 text-right opacity-0 group-hover:delay-500 group-hover:opacity-100 transition-opacity duration-300">
                  {new Date(r?.createdAt * 1000).toLocaleString()}
                </p>
                <Separator className="mt-2 mb-2" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
