"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

// Placeholder workout data for UI purposes
const MOCK_WORKOUTS = [
  { id: 1, name: "Bench Press", sets: 4, reps: 8, weight: "80kg" },
  { id: 2, name: "Squat", sets: 3, reps: 5, weight: "100kg" },
  { id: 3, name: "Deadlift", sets: 3, reps: 5, weight: "120kg" },
];

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 items-start">
          {/* Date Picker */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Select Date</CardTitle>
            </CardHeader>
            <CardContent className="p-0 pb-4 flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
              />
            </CardContent>
          </Card>

          {/* Workout List */}
          <Card>
            <CardHeader>
              <CardTitle>Workouts for {formatDate(selectedDate)}</CardTitle>
            </CardHeader>
            <CardContent>
              {MOCK_WORKOUTS.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No workouts logged for this date.
                </p>
              ) : (
                <div className="space-y-3">
                  {MOCK_WORKOUTS.map((workout) => (
                    <div
                      key={workout.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div>
                        <p className="font-medium">{workout.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {workout.sets} sets × {workout.reps} reps
                        </p>
                      </div>
                      <span className="text-sm font-semibold">
                        {workout.weight}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
