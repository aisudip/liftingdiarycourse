import { auth } from "@clerk/nextjs/server";
import { getUserWorkouts } from "@/src/data/workouts";
import WorkoutsCalendar from "./WorkoutsCalendar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function DashboardPage() {
  const { userId } = await auth();
  const workouts = userId ? await getUserWorkouts(userId) : [];

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button asChild>
            <Link href="/dashboard/workout/new">Log New Workout</Link>
          </Button>
        </div>
        <WorkoutsCalendar workouts={workouts} />
      </div>
    </div>
  );
}
