import { db } from "@/src/db";
import { workouts, workoutExercises, exercises, sets } from "@/src/db/schema";
import { eq, and, count } from "drizzle-orm";
import type { Exercise } from "@/src/db/schema";

export async function createWorkout(userId: string, name: string, startedAt: Date) {
  return db.insert(workouts).values({ userId, name, startedAt });
}

export async function getUserWorkouts(userId: string) {
  return db.select().from(workouts).where(eq(workouts.userId, userId));
}

export async function updateWorkout(userId: string, workoutId: number, name: string, startedAt: Date) {
  return db
    .update(workouts)
    .set({ name, startedAt })
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}

export async function getWorkoutWithDetails(userId: string, workoutId: number) {
  const workout = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .limit(1);

  if (!workout[0]) return null;

  const exerciseRows = await db
    .select({
      workoutExerciseId: workoutExercises.id,
      order: workoutExercises.order,
      exerciseId: exercises.id,
      exerciseName: exercises.name,
    })
    .from(workoutExercises)
    .innerJoin(exercises, eq(workoutExercises.exerciseId, exercises.id))
    .where(eq(workoutExercises.workoutId, workoutId))
    .orderBy(workoutExercises.order);

  const exercisesWithSets = await Promise.all(
    exerciseRows.map(async (ex) => {
      const exSets = await db
        .select()
        .from(sets)
        .where(eq(sets.workoutExerciseId, ex.workoutExerciseId))
        .orderBy(sets.setNumber);
      return { ...ex, sets: exSets };
    })
  );

  return { ...workout[0], exercises: exercisesWithSets };
}

export async function getAllExercises(): Promise<Exercise[]> {
  return db.select().from(exercises).orderBy(exercises.name);
}

export async function addExerciseToWorkout(
  userId: string,
  workoutId: number,
  exerciseId: number
): Promise<void> {
  // Verify ownership
  const workout = await db
    .select({ id: workouts.id })
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .limit(1);
  if (!workout[0]) throw new Error("Workout not found");

  const [{ value: orderCount }] = await db
    .select({ value: count() })
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, workoutId));

  await db.insert(workoutExercises).values({
    workoutId,
    exerciseId,
    order: Number(orderCount) + 1,
  });
}

export async function removeExerciseFromWorkout(
  userId: string,
  workoutExerciseId: number
): Promise<void> {
  const row = await db
    .select({ id: workoutExercises.id })
    .from(workoutExercises)
    .innerJoin(workouts, eq(workoutExercises.workoutId, workouts.id))
    .where(
      and(
        eq(workoutExercises.id, workoutExerciseId),
        eq(workouts.userId, userId)
      )
    )
    .limit(1);
  if (!row[0]) throw new Error("WorkoutExercise not found");

  await db.delete(workoutExercises).where(eq(workoutExercises.id, workoutExerciseId));
}

export async function addSet(
  userId: string,
  workoutExerciseId: number,
  reps: number | null,
  weight: string | null
): Promise<void> {
  const row = await db
    .select({ id: workoutExercises.id })
    .from(workoutExercises)
    .innerJoin(workouts, eq(workoutExercises.workoutId, workouts.id))
    .where(
      and(
        eq(workoutExercises.id, workoutExerciseId),
        eq(workouts.userId, userId)
      )
    )
    .limit(1);
  if (!row[0]) throw new Error("WorkoutExercise not found");

  const [{ value: setCount }] = await db
    .select({ value: count() })
    .from(sets)
    .where(eq(sets.workoutExerciseId, workoutExerciseId));

  await db.insert(sets).values({
    workoutExerciseId,
    setNumber: Number(setCount) + 1,
    reps,
    weight,
  });
}

export async function deleteSet(userId: string, setId: number): Promise<void> {
  const row = await db
    .select({ id: sets.id })
    .from(sets)
    .innerJoin(workoutExercises, eq(sets.workoutExerciseId, workoutExercises.id))
    .innerJoin(workouts, eq(workoutExercises.workoutId, workouts.id))
    .where(and(eq(sets.id, setId), eq(workouts.userId, userId)))
    .limit(1);
  if (!row[0]) throw new Error("Set not found");

  await db.delete(sets).where(eq(sets.id, setId));
}

export async function updateSet(
  userId: string,
  setId: number,
  reps: number | null,
  weight: string | null
): Promise<void> {
  const row = await db
    .select({ id: sets.id })
    .from(sets)
    .innerJoin(workoutExercises, eq(sets.workoutExerciseId, workoutExercises.id))
    .innerJoin(workouts, eq(workoutExercises.workoutId, workouts.id))
    .where(and(eq(sets.id, setId), eq(workouts.userId, userId)))
    .limit(1);
  if (!row[0]) throw new Error("Set not found");

  await db.update(sets).set({ reps, weight }).where(eq(sets.id, setId));
}
