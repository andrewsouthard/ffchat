import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Agent, agentsSelector } from "@/redux/agentsSlice";
import {
  Task,
  addUserRequest,
  selectedTaskSelector,
  setTaskName,
} from "@/redux/tasksSlice";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function ChatInterface() {
  const [taskSent, setTaskSent] = useState(false);
  const [taskDescription, setTaskDescription] = useState("");
  const [currentTaskId, setCurrentTaskId] = useState<string>();
  const task: Task = useSelector(selectedTaskSelector);
  const agents = useSelector(agentsSelector);
  const dispatch = useDispatch();

  useEffect(() => {
    if (task.id != currentTaskId) {
      setCurrentTaskId(task.id);
      if (task.userRequests.length > 0) {
        setTaskSent(true);
        setTaskDescription(task.userRequests[0]);
      } else {
        setTaskDescription("");
        setTaskSent(false);
      }
    }
  }, [currentTaskId, task]);

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
    dispatch(addUserRequest(taskDescription));
    dispatch(setTaskName(taskDescription.substring(0, 40)));
    setTaskSent(true);
  };
  return (
    <section className="h-full mr-8">
      <div className="flex">
        {agentsWithStatuses.map((agent) => (
          <div key={agent.id} className="flex-1">
            {agentResponsesByAgent[agent.id]?.map((r) => (
              <p>{r}</p>
            ))}
          </div>
        ))}
      </div>
      <form className="mt-8 flex flex-col items-end" onSubmit={onSubmit}>
        <Textarea
          className="w-fill"
          name="taskDescription"
          placeholder="Describe your task"
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          disabled={taskSent}
        />
        <Button
          className="mt-2"
          type="submit"
          disabled={
            taskDescription.length === 0 ||
            taskSent ||
            agentsWithStatuses.filter((a) => a.status === "enabled").length ===
              0
          }
        >
          Go
        </Button>
      </form>
    </section>
  );
}
