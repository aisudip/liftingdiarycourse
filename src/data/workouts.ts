import { db } from "@/src/db";
import { workouts, workoutExercises, exercises, sets } from "@/src/db/schema";
import { eq, and } from "drizzle-orm";

export async function getUserWorkouts(userId: string) {
  return db.select().from(workouts).where(eq(workouts.userId, userId));
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
