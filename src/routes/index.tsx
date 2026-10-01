import { createFileRoute } from "@tanstack/react-router";
import { Rack } from "@/components/synth/rack";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <Rack />;
}
