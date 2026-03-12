"use client";

import { useState } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Workout } from "@/src/db/schema";

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

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function WorkoutsCalendar({ workouts }: { workouts: Workout[] }) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [open, setOpen] = useState(false);

  const workoutsForDate = workouts.filter((w) =>
    isSameDay(new Date(w.startedAt), selectedDate)
  );

  return (
    <div className="flex flex-col gap-6">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDate(selectedDate)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date) {
                setSelectedDate(date);
                setOpen(false);
              }
            }}
          />
        </PopoverContent>
      </Popover>

      <Card>
        <CardHeader>
          <CardTitle>Workouts for {formatDate(selectedDate)}</CardTitle>
        </CardHeader>
        <CardContent>
          {workoutsForDate.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No workouts logged for this date.
            </p>
          ) : (
            <div className="space-y-3">
              {workoutsForDate.map((workout) => (
                <div
                  key={workout.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">{workout.name ?? "Unnamed Workout"}</p>
                    <p className="text-sm text-muted-foreground">
                      Started at {format(new Date(workout.startedAt), "h:mm a")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {workout.completedAt && (
                      <span className="text-sm font-semibold text-green-600">
                        Completed
                      </span>
                    )}
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dashboard/workouts/${workout.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

