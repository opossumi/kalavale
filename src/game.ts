import { resources } from "./data/resources";
import { tasks } from "./data/tasks";

export type ResourceDefinition = {
  id: string;
  name: string;
  //tags: ?
  group?: string;
  description: string;
  limit: number;
  mod?: Record<string, string | number>;
};

export type ResourceData = {
  amount: number;
  available: boolean;
};

export type Resource = ResourceDefinition & ResourceData;

const initialResourceData: Record<string, ResourceData> = {
  money: {
    amount: 0,
    available: true,
  },
  stamina: {
    amount: 5,
    available: true,
  },
};

// Combine definitions with runtime & save data
export const initialResources = resources.map((resource) => {
  const resData = initialResourceData[resource.id];
  if (resData) {
    return {
      ...resource,
      ...resData,
    };
  } else {
    return {
      ...resource,
      amount: 0,
      available: false,
    };
  }
});

export type BaseTask = {
  id: string;
  name: string;
  description: string;
};

export type ActionTask = BaseTask & {
  continuous: false;

  // Cost, paid once per action
  cost: Record<string, number>;

  // Result, gotten once after action finishes
  result: Record<string, string | number>;
};

export type CraftingTask = BaseTask & {
  continuous: true;

  length: number; // Action length in s

  // Cost, paid once per action
  cost: Record<string, number>;

  // Result, gotten once after action finishes
  result: Record<string, string | number>;
};

export type ContinuousTask = BaseTask & {
  continuous: true;

  // Running cost, in /s while task is active
  runCost?: Record<string, number>;

  // Effect, in /s while task is active
  effect: Record<string, number>;
};

export type TaskDefinition = ActionTask | CraftingTask | ContinuousTask;

export type TaskData = {
  available: boolean;
};

export type Task = TaskDefinition & TaskData;

export function isActionTask(task: Task): task is ActionTask & TaskData {
  return task.continuous === false;
}

export function isContinuousTask(
  task: Task,
): task is (CraftingTask | ContinuousTask) & TaskData {
  return task.continuous === true;
}

export const initialTasks: Task[] = tasks.map((task) => {
  return {
    ...task,
    available: false,
  };
});
