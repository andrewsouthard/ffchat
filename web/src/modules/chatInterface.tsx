import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Agent, agentsSelector } from "@/redux/agentsSlice";
import {
  Task,
  addUserRequest,
  deleteTask,
  selectedTaskSelector,
  setTaskName,
} from "@/redux/tasksSlice";
import {
  FormEvent,
  MouseEventHandler,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";

export default function ChatInterface() {
  const [taskSent, setTaskSent] = useState(false);
  const [taskDescription, setTaskDescription] = useState("");
  const [currentTaskId, setCurrentTaskId] = useState<string>();
  const task: Task = useSelector(selectedTaskSelector);
  const agents = useSelector(agentsSelector);
  const dispatch = useDispatch();

  useEffect(() => {
    if (task?.id != currentTaskId) {
      if (task?.id) setCurrentTaskId(task.id);
      if (task?.userRequests.length > 0) {
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

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(addUserRequest(taskDescription));
    dispatch(setTaskName(taskDescription.substring(0, 40)));
    setTaskSent(true);
  };
  const onDeleteTask: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    if (confirm("Are you sure you want to delete this task?")) {
      dispatch(deleteTask());
    }
  };
  return (
    <section className="mr-8">
      <form className="flex flex-col items-end" onSubmit={onSubmit}>
        <Textarea
          className="w-fill"
          name="taskDescription"
          placeholder="Describe your task"
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          disabled={taskSent}
        />
        <div className="mt-2">
          <Button className="mr-2" variant="secondary" onClick={onDeleteTask}>
            Delete Task
          </Button>
          <Button
            type="submit"
            disabled={
              taskDescription.length === 0 ||
              agentsWithStatuses.filter((a) => a.status === "enabled")
                .length === 0
            }
          >
            {taskSent ? "Resend" : "Go"}
          </Button>
        </div>
      </form>
    </section>
  );
}
