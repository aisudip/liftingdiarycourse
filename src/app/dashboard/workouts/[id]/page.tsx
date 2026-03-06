import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { auth } from "@clerk/nextjs/server";
import { getWorkoutWithDetails } from "@/src/data/workouts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/dashboard");

  const { id } = await params;
  const workoutId = Number(id);
  if (isNaN(workoutId)) redirect("/dashboard");

  const workout = await getWorkoutWithDetails(userId, workoutId);
  if (!workout) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard">← Back</Link>
          </Button>
          <h1 className="text-3xl font-bold">
            {workout.name ?? "Unnamed Workout"}
          </h1>
          {workout.completedAt && (
            <span className="text-sm font-semibold text-green-600">Completed</span>
          )}
        </div>

        <p className="text-muted-foreground">
          {format(new Date(workout.startedAt), "PPP 'at' h:mm a")}
        </p>

        {workout.exercises.length === 0 ? (
          <p className="text-muted-foreground text-sm">No exercises logged for this workout.</p>
        ) : (
          <div className="space-y-4">
            {workout.exercises.map((ex) => (
              <Card key={ex.workoutExerciseId}>
                <CardHeader>
                  <CardTitle className="text-base">{ex.exerciseName}</CardTitle>
                </CardHeader>
                <CardContent>
                  {ex.sets.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No sets logged.</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-muted-foreground border-b">
                          <th className="text-left py-1 pr-4">Set</th>
                          <th className="text-left py-1 pr-4">Reps</th>
                          <th className="text-left py-1">Weight</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ex.sets.map((s) => (
                          <tr key={s.id} className="border-b last:border-0">
                            <td className="py-1 pr-4">{s.setNumber}</td>
                            <td className="py-1 pr-4">{s.reps ?? "—"}</td>
                            <td className="py-1">{s.weight != null ? `${s.weight} kg` : "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
