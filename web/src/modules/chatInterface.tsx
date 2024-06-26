import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Agent, agentsSelector } from "@/redux/agentsSlice";
import { Task, addUserRequest, selectedTaskSelector } from "@/redux/tasksSlice";
import { FormEvent, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function ChatInterface() {
  const [taskDescription, setTaskDescription] = useState("");
  const task: Task = useSelector(selectedTaskSelector);
  const agents = useSelector(agentsSelector);
  const dispatch = useDispatch();

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

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log({ taskDescription });
    dispatch(addUserRequest(taskDescription));
    setTaskDescription("");
  };

  return (
    <section className="h-full">
      <p className="text-left pt-4 pb-4">{task.userRequests}</p>
      <div>
        {agentsWithStatuses.map((agent) => (
          <div>
            {agentResponsesByAgent[agent.id]?.map((r) => (
              <p>{r}</p>
            ))}
          </div>
        ))}
      </div>
      <form
        className="max-w-[500px] flex flex-col items-end"
        onSubmit={onSubmit}
      >
        <Textarea
          name="taskDescription"
          placeholder="Describe your task"
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
        />
        <Button className="mt-2" type="submit">
          Go
        </Button>
      </form>
    </section>
  );
}
