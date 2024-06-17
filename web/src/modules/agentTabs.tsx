import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Plus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AddAgent } from "./addAgent";

export default function AgentTabs() {
  return (
    <div className="flex flex-row">
      <ToggleGroup type="multiple" onValueChange={() => {}} defaultValue={[]}>
        <ToggleGroupItem className="text-xl" value="a">
          Agent A
        </ToggleGroupItem>
        <ToggleGroupItem className="text-xl" value="b">
          Agent B
        </ToggleGroupItem>
        <ToggleGroupItem className="text-xl" value="c">
          Agent C
        </ToggleGroupItem>
      </ToggleGroup>
      <Popover>
        <PopoverTrigger className="p-3">
          <Plus size={24} className="text-grey-200" />
        </PopoverTrigger>
        {/* https://www.radix-ui.com/primitives/docs/components/popover#custom-apis */}
        <PopoverContent>
          <AddAgent />
        </PopoverContent>
      </Popover>
    </div>
  );
}
