import { Duration } from 'luxon';

export interface HourlyEventParameter {
  period: Duration;
  offset?: Duration;
  fullDuration: Duration;
  preActiveDuration?: Duration;
  postActiveDuration?: Duration;

  startedDescription?: string;
  activeDescription?: string;
}

export const hourlyEventParameters: Record<string, HourlyEventParameter> = {
  'Sanctuary Geyser': {
    period: Duration.fromObject({ hours: 2 }),
    offset: Duration.fromObject({ minutes: 0 }),
    preActiveDuration: Duration.fromObject({ minutes: 5 }),
    fullDuration: Duration.fromObject({ minutes: 15 }),
    startedDescription: 'Geyser is about to erupt',
    activeDescription: 'Geyser is erupting',
  },
  'Forest Grandma Dinner': {
    period: Duration.fromObject({ hours: 2 }),
    offset: Duration.fromObject({ minutes: 30 }),
    preActiveDuration: Duration.fromObject({ minutes: 5 }),
    fullDuration: Duration.fromObject({ minutes: 15 }),
    startedDescription: 'Grandma is cooking',
    activeDescription: 'Food is ready',
  },
  'Sanctuary Turtle': {
    period: Duration.fromObject({ hours: 2 }),
    offset: Duration.fromObject({ minutes: 50 }),
    fullDuration: Duration.fromObject({ minutes: 10 }),
    startedDescription: 'Turtle is about to come out',
    activeDescription: 'Turtle is out!!Help to burn the dark plants',
  },
  'Aurora Concert': {
    period: Duration.fromObject({ hours: 4 }),
    preActiveDuration: Duration.fromObject({ minutes: 10 }),
    fullDuration: Duration.fromObject({ minutes: 60 }),
    startedDescription: 'Concert is about to start! Grab a seat!',
    activeDescription: 'Concert is in progress! Enjoy!',
  },
};
