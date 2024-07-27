import type { TaskDefinition } from "../game";

export const tasks: TaskDefinition[] = [
  {
    id: "chores",
    name: "Do chores",
    description: "Do some chores",
    continuous: false,
    cost: {
      stamina: 0.1,
    },
    result: {
      money: 0.2,
    },
  },
  {
    id: "ponder",
    name: "Ponder",
    description: "Ponder life",
    continuous: true,
    effect: {
      research: 1,
    },
    runCost: {
      stamina: 1,
    },
  },
  {
    id: "sell",
    name: "Sell",
    description: "Sell random stuff",
    continuous: true,
    effect: {
      money: 1,
    },
    runCost: {
      stamina: 0.2,
    },
  },
  {
    id: "rest",
    name: "Rest",
    description: "",
    continuous: true,
    effect: {
      stamina: 1,
    },
  },
];
