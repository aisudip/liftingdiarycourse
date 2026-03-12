"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import {
  updateWorkout,
  addExerciseToWorkout,
  removeExerciseFromWorkout,
  addSet,
  deleteSet,
  updateSet,
} from "@/src/data/workouts";

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

const addExerciseSchema = z.object({
  workoutId: z.number().int().positive(),
  exerciseId: z.number().int().positive(),
});

export async function addExerciseToWorkoutAction(params: {
  workoutId: number;
  exerciseId: number;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const { workoutId, exerciseId } = addExerciseSchema.parse(params);
  await addExerciseToWorkout(userId, workoutId, exerciseId);
}

const removeExerciseSchema = z.object({
  workoutExerciseId: z.number().int().positive(),
});

export async function removeExerciseFromWorkoutAction(params: {
  workoutExerciseId: number;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const { workoutExerciseId } = removeExerciseSchema.parse(params);
  await removeExerciseFromWorkout(userId, workoutExerciseId);
}

const addSetSchema = z.object({
  workoutExerciseId: z.number().int().positive(),
  reps: z.number().int().positive().nullable(),
  weight: z.string().nullable(),
});

export async function addSetAction(params: {
  workoutExerciseId: number;
  reps: number | null;
  weight: string | null;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const { workoutExerciseId, reps, weight } = addSetSchema.parse(params);
  await addSet(userId, workoutExerciseId, reps, weight);
}

const deleteSetSchema = z.object({
  setId: z.number().int().positive(),
});

export async function deleteSetAction(params: { setId: number }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const { setId } = deleteSetSchema.parse(params);
  await deleteSet(userId, setId);
}

const updateSetSchema = z.object({
  setId: z.number().int().positive(),
  reps: z.number().int().positive().nullable(),
  weight: z.string().nullable(),
});

export async function updateSetAction(params: {
  setId: number;
  reps: number | null;
  weight: string | null;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const { setId, reps, weight } = updateSetSchema.parse(params);
  await updateSet(userId, setId, reps, weight);
}
