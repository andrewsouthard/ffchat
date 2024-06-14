import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AddAgent() {
  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle>Add Agent</CardTitle>
        <CardDescription>Connect to a new agent.</CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Name of your agent" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="endpoint">Endpoint</Label>
              <Input id="endpoint" placeholder="HTTP Endpoint" />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button>Add</Button>
      </CardFooter>
    </Card>
  );
}
