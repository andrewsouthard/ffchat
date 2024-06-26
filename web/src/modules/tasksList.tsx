import clsx from "clsx";
import { Button } from "@/components/ui/button";
import {
  Task,
  addTask,
  setSelectedTask,
  tasksSelector,
} from "@/redux/tasksSlice";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Plus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

export default function TasksList() {
  const tasks = useSelector(tasksSelector);
  const dispatch = useDispatch();

  const onAddTask = () => dispatch(addTask());
  const onSelectTask = (taskId: string) => dispatch(setSelectedTask(taskId));

  return (
    <>
      <div className="flex flex-row items-center justify-between">
        <h2 className="text-2xl">Tasks</h2>
        <Button variant="ghost" onClick={onAddTask} className="p-0">
          <Plus size={24} className="text-grey-200" />
        </Button>
      </div>
      {tasks.length > 0 ? (
        <ScrollArea className="mt-4">
          {tasks.map((task: Task) => (
            <div
              key={task.id}
              onClick={() => onSelectTask(task.id)}
              className={clsx(
                "border-2 rounded p-2 hover:border-primary cursor-pointer",
                {
                  "border-primary": task.selected,
                  "border-secondary": !task.selected,
                }
              )}
            >
              <p className="text-lg">{task.name}</p>
            </div>
          ))}
        </ScrollArea>
      ) : (
        <div>Click the plus button to add a task</div>
      )}
    </>
  );
}
