import { useSelector } from "react-redux";
import { tasksSelector } from "@/redux/tasksSlice";
import ChatInterface from "./chatInterface";
import AgentTabs from "./agentTabs";
import { agentsSelector } from "@/redux/agentsSlice";
import AgentMessages from "./agentMessages";

export default function TaskOverview() {
  const tasks = useSelector(tasksSelector);
  const agents = useSelector(agentsSelector);

  if (tasks.length > 0) {
    return (
      <>
        {agents?.length > 0 && <ChatInterface />}
        <AgentTabs />
        {agents?.length > 0 ? (
          <AgentMessages />
        ) : (
          <div>Next, connect to an agent</div>
        )}
      </>
    );
  } else {
    return <p>Add a task to get started!</p>;
  }
}
