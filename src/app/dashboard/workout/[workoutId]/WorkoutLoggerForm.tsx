"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  updateWorkoutAction,
  addExerciseToWorkoutAction,
  removeExerciseFromWorkoutAction,
  addSetAction,
  deleteSetAction,
} from "./actions";

function formatDate(date: Date): string {
  const day = date.getDate();
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
          ? "rd"
          : "th";
  return `${day}${suffix} ${format(date, "MMM yyyy")}`;
}

type SetRow = {
  id: number;
  setNumber: number;
  reps: number | null;
  weight: string | null;
};

type WorkoutExercise = {
  workoutExerciseId: number;
  exerciseId: number;
  exerciseName: string;
  order: number;
  sets: SetRow[];
};

type Workout = {
  id: number;
  name: string | null;
  startedAt: Date;
  exercises: WorkoutExercise[];
};

type Exercise = {
  id: number;
  name: string;
};

type AddSetState = {
  reps: string;
  weight: string;
};

export default function WorkoutLoggerForm({
  workout,
  allExercises,
}: {
  workout: Workout;
  allExercises: Exercise[];
}) {
  const router = useRouter();
  const [name, setName] = useState(workout.name ?? "");
  const [date, setDate] = useState<Date>(new Date(workout.startedAt));
  const [calOpen, setCalOpen] = useState(false);
  const [savePending, setSavePending] = useState(false);
  const [addSetState, setAddSetState] = useState<Record<number, AddSetState>>({});
  const [addingSet, setAddingSet] = useState<Record<number, boolean>>({});

  const usedExerciseIds = new Set(workout.exercises.map((e) => e.exerciseId));
  const availableExercises = allExercises.filter((e) => !usedExerciseIds.has(e.id));

  async function handleSaveWorkout(e: React.FormEvent) {
    e.preventDefault();
    setSavePending(true);
    try {
      await updateWorkoutAction({ workoutId: workout.id, name, startedAt: date });
      router.refresh();
    } finally {
      setSavePending(false);
    }
  }

  async function handleAddExercise(exerciseId: string) {
    await addExerciseToWorkoutAction({ workoutId: workout.id, exerciseId: Number(exerciseId) });
    router.refresh();
  }

  async function handleRemoveExercise(workoutExerciseId: number) {
    await removeExerciseFromWorkoutAction({ workoutExerciseId });
    router.refresh();
  }

  async function handleAddSet(workoutExerciseId: number) {
    const state = addSetState[workoutExerciseId] ?? { reps: "", weight: "" };
    const reps = state.reps ? parseInt(state.reps, 10) : null;
    const weight = state.weight || null;
    setAddingSet((prev) => ({ ...prev, [workoutExerciseId]: true }));
    try {
      await addSetAction({ workoutExerciseId, reps, weight });
      setAddSetState((prev) => ({ ...prev, [workoutExerciseId]: { reps: "", weight: "" } }));
      router.refresh();
    } finally {
      setAddingSet((prev) => ({ ...prev, [workoutExerciseId]: false }));
    }
  }

  async function handleDeleteSet(setId: number) {
    await deleteSetAction({ setId });
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            ← Back
          </Button>
          <h1 className="text-2xl font-bold">{workout.name ?? "Workout"}</h1>
        </div>

        {/* Edit workout details */}
        <Card>
          <CardHeader>
            <CardTitle>Workout Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveWorkout} className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Push Day"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Popover open={calOpen} onOpenChange={setCalOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formatDate(date)}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(d) => {
                          if (d) {
                            setDate(d);
                            setCalOpen(false);
                          }
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <Button type="submit" disabled={savePending}>
                {savePending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Exercises */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Exercises</h2>

          {workout.exercises.map((ex) => (
            <Card key={ex.workoutExerciseId}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{ex.exerciseName}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveExercise(ex.workoutExerciseId)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {ex.sets.length > 0 && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-[2rem_1fr_1fr_2rem] gap-2 text-sm font-medium text-muted-foreground">
                      <span>Set</span>
                      <span>Reps</span>
                      <span>Weight</span>
                      <span />
                    </div>
                    {ex.sets.map((s) => (
                      <div
                        key={s.id}
                        className="grid grid-cols-[2rem_1fr_1fr_2rem] gap-2 items-center text-sm"
                      >
                        <span>{s.setNumber}</span>
                        <span>{s.reps ?? "—"}</span>
                        <span>{s.weight ? `${s.weight} kg` : "—"}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleDeleteSet(s.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add set row */}
                <div className="flex gap-2 items-end">
                  <div className="space-y-1">
                    <Label className="text-xs">Reps</Label>
                    <Input
                      className="w-20"
                      type="number"
                      min={1}
                      placeholder="0"
                      value={addSetState[ex.workoutExerciseId]?.reps ?? ""}
                      onChange={(e) =>
                        setAddSetState((prev) => ({
                          ...prev,
                          [ex.workoutExerciseId]: {
                            ...prev[ex.workoutExerciseId],
                            reps: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Weight (kg)</Label>
                    <Input
                      className="w-24"
                      type="number"
                      min={0}
                      step="0.5"
                      placeholder="0"
                      value={addSetState[ex.workoutExerciseId]?.weight ?? ""}
                      onChange={(e) =>
                        setAddSetState((prev) => ({
                          ...prev,
                          [ex.workoutExerciseId]: {
                            ...prev[ex.workoutExerciseId],
                            weight: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={addingSet[ex.workoutExerciseId]}
                    onClick={() => handleAddSet(ex.workoutExerciseId)}
                  >
                    {addingSet[ex.workoutExerciseId] ? "Adding..." : "+ Add Set"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add exercise dropdown */}
          {availableExercises.length > 0 && (
            <Select onValueChange={handleAddExercise}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="+ Add Exercise" />
              </SelectTrigger>
              <SelectContent>
                {availableExercises.map((ex) => (
                  <SelectItem key={ex.id} value={String(ex.id)}>
                    {ex.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {availableExercises.length === 0 && workout.exercises.length === 0 && (
            <p className="text-muted-foreground text-sm">No exercises available to add.</p>
          )}
        </div>
      </div>
    </div>
  );
}
