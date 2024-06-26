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
import { addAgent } from "@/redux/agentsSlice";
import { nanoid } from "@reduxjs/toolkit";
import { FormEvent } from "react";
import { useDispatch } from "react-redux";

export function AddAgent({ onClose }: { onClose: () => void }) {
  const dispatch = useDispatch();

  const onAddAgent = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newAgent = Object.fromEntries(formData);
    dispatch(addAgent({ id: nanoid(), ...newAgent }));
    onClose();
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle>Add Agent</CardTitle>
        <CardDescription>Connect to a new agent.</CardDescription>
      </CardHeader>
      <form onSubmit={onAddAgent}>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Name of your agent"
                required
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="url">Endpoint</Label>
              <Input id="url" name="url" placeholder="HTTP Endpoint" required />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button type="submit">Add</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
