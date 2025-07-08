import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="w-screen h-screen absolute inset-0 bg-background/50 flex items-center justify-center">
      <Loader2 className="size-6 animate-spin" />
    </div>
  );
}
