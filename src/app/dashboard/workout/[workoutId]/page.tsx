import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getWorkoutWithDetails, getAllExercises } from "@/src/data/workouts";
import WorkoutLoggerForm from "./WorkoutLoggerForm";

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

  const [workout, allExercises] = await Promise.all([
    getWorkoutWithDetails(userId, id),
    getAllExercises(),
  ]);
  if (!workout) redirect("/dashboard");

  return <WorkoutLoggerForm workout={workout} allExercises={allExercises} />;
}
