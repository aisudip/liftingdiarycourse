"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { updateWorkout } from "@/src/data/workouts";

const updateWorkoutSchema = z.object({
  workoutId: z.number().int().positive(),
  name: z.string().min(1),
  startedAt: z.coerce.date(),
});

export async function updateWorkoutAction(params: {
  workoutId: number;
  name: string;
  startedAt: Date;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const { workoutId, name, startedAt } = updateWorkoutSchema.parse(params);
  await updateWorkout(userId, workoutId, name, startedAt);
}
