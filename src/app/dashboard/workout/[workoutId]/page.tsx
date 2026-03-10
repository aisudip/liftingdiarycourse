import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getWorkoutWithDetails } from "@/src/data/workouts";
import EditWorkoutForm from "./EditWorkoutForm";

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/dashboard");

  const { workoutId } = await params;
  const id = Number(workoutId);
  if (isNaN(id)) redirect("/dashboard");

  const workout = await getWorkoutWithDetails(userId, id);
  if (!workout) redirect("/dashboard");

  return <EditWorkoutForm workout={workout} />;
}
