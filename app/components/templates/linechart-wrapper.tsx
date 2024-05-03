import { LineChart } from "@tremor/react";
import type{ SetDetails, Exercise } from "app/routes/view-progress";
import { TimeFrame } from "~/types/enums";


export function LineChartWrapper({ allMySets, selectedExercise, selectedTimeFrame }: { allMySets: SetDetails[], selectedExercise: Exercise | null, selectedTimeFrame: TimeFrame }) {
  if (!selectedExercise) return null;

  // filter out the sets that are for the selected exercise
  const sets = [] as SetDetails[];
  for (const set of allMySets) {
    if (set.exerciseDetails.id === selectedExercise.id) {
      sets.push(set);
    }
  }

  // filter out the sets that are within the selected time frame
  const now = new Date();
  let startDate: Date;
  switch (selectedTimeFrame) {
    case TimeFrame.allTime:
      startDate = new Date(0);
      break;
    case TimeFrame.lastWeek:
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      break;
    case TimeFrame.lastMonth:
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      break;
    case TimeFrame.lastYear:
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      break;
  }
  const filteredSets = sets.filter(set => new Date(set.date as string) >= startDate);

  // sort the sets by date
  filteredSets.sort((a, b) => new Date(a.date as string).getTime() - new Date(b.date as string).getTime());

  // create the data object for the line chart...
  interface DataPoint {
    date: string;
    'Weight'?: number;
    'Repetitions'?: number;
    'Sets'?: number;
    'Duration in minutes'?: number;
  }

  const categoryFlags = {weigh: false, repetitions: false, duration: false, sets: false};
  const data: DataPoint[] = filteredSets.map(set => {
    // only include the properties that are relevant... that is present in the data object
    const dataPoint: DataPoint = { date: set.date?.split('T')[0] as string};
    if (set.weight) {
      dataPoint['Weight'] = set.weight;
      categoryFlags.weigh = true;
    }
    if (set.repetitions) {
      dataPoint['Repetitions'] = set.repetitions;
      categoryFlags.repetitions = true;
    }
    if (set.sets) {
      dataPoint['Sets'] = set.sets;
      categoryFlags.sets = true;
    }
    if (set.duration_minutes) {
      dataPoint['Duration in minutes'] = set.duration_minutes;
      categoryFlags.duration = true;
    }
    return dataPoint;
  });

  // Create the category array for the line chart
  const category = [] as string[];
  const colors = [] as string[];
  if (categoryFlags.weigh) {
    category.push('Weight');
    colors.push('rose');
  }
  if (categoryFlags.repetitions) {
     category.push('Repetitions');
      colors.push('indigo');
  }
  if (categoryFlags.duration) {
    category.push('Duration in minutes');
    colors.push('cyan');
  }
  if (categoryFlags.sets) {
    category.push('Sets');
    colors.push('green');
  }

  return (
    <LineChart
      data={data}
      className="w-full h-max-full"
      index='date'
      colors={colors}
      categories={category}
      yAxisWidth={65}
    />
  );
}