import {
  For,
  batch,
  createSignal,
  onCleanup,
  onMount,
  type Component,
} from "solid-js";
import { createStore, produce } from "solid-js/store";

import type { Resource, ResourceData, Task } from "./game.ts";
import {
  initialResources,
  initialTasks,
  isActionTask,
  isContinuousTask,
} from "./game.ts";

import { schedule, webWorker } from "./worker.ts";
import { FormattedNumber } from "./utils.tsx";

import styles from "./App.module.css";
import Button from "./components/button.tsx";

type State = {
  running: boolean;
};

type Data = {
  currentTask?: string;
  resources: Resource[];
  tasks: Task[];
};

const initialState: State = {
  running: true,
};

const initialData: Data = {
  resources: initialResources,
  tasks: initialTasks,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isNumber = (value: any): boolean => {
  return typeof value === "number";
};

const App: Component = () => {
  const [state, setState] = createStore<State>(initialState);
  const [data, setData] = createStore<Data>(initialData);

  const [currentTask, setCurrentTask] = createSignal<string>();

  const incrementResource = (id: string, inc: number | string) => {
    /*const resource = resources.find((resource) => resource.id === id);
    if (!resource) return;*/

    let amount: number = 0;
    if (typeof inc === "number") {
      amount = inc;
    }

    const index = data.resources.findIndex((res) => res.id === id);

    setData(
      "resources",
      index,
      produce((resource) => {
        if (resource.amount + amount > resource.limit) {
          resource.amount = resource.limit;
        } else {
          resource.amount += amount;
        }
        resource.available = true;
      }),
    );
  };

  const canAfford = (task: Task): boolean => {
    if ("cost" in task) {
      for (const key in task.cost) {
        const resource = data.resources.find((res) => res.id === key);
        if (!resource) return false;
        const value = task.cost[key];
        if (resource.amount < value) {
          return false;
        }
      }
    }

    if ("runCost" in task) {
      for (const key in task.runCost) {
        const resource = data.resources.find((res) => res.id === key);
        if (!resource) return false;
        const value = task.runCost[key];
        if (resource.amount < value) {
          return false;
        }
      }
    }

    return true;
  };

  // Returns false if there is no sense in doing the action
  // eg: when the resource it generates is full
  const canFill = (task: Task): boolean => {
    if ("result" in task) {
      for (const key in task.result) {
        const resource = data.resources.find((res) => res.id === key);
        if (!resource) continue;
        if (resource.amount < resource.limit) return true;
      }
    } else if ("effect" in task) {
      for (const key in task.effect) {
        const resource = data.resources.find((res) => res.id === key);
        if (!resource) continue;
        if (resource.amount < resource.limit) return true;
      }
    }

    return false;
  };

  const canDo = (task: Task): boolean => {
    return canAfford(task) && canFill(task);
  };

  const doAction = (taskId: string) => {
    const task = data.tasks.find((task) => task.id === taskId);

    if (!task) return;

    if (!isActionTask(task)) return;

    if (!canDo(task)) return;

    for (const key in task.cost) {
      const amount = task.cost[key];
      incrementResource(key, -amount);
    }

    for (const key in task.result) {
      const amount = task.result[key];
      incrementResource(key, amount);
    }
  };

  const toggleTask = (taskId: string) => {
    if (currentTask() === taskId) {
      setCurrentTask(undefined);
      return;
    }

    setCurrentTask(taskId);
  };

  const load = () => {
    //const data = JSON.parse(localStorage.getItem("save") || "{}");

    batch(() => {});
  };

  const save = () => {
    // Resources
    for (const _res of data.resources) {
      const resource = _res as ResourceData;
      /*for (const key in ResourceDataFields) {
      }*/
      const asd = JSON.stringify(resource, ["amount"]);
      console.log(asd);
    }
  };

  const quickUpdate = (ms: number): void => {
    if (!state.running) return;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const dt = ms / 1000.0;
  };

  const mainUpdate = (ms: number): void => {
    if (!state.running) return;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const dt = ms / 1000.0;

    const task = data.tasks.find((task) => task.id === currentTask());

    if (!task || !isContinuousTask(task)) return;

    if (canAfford(task)) {
      if ("effect" in task) {
        for (const key in task.effect) {
          const effectValue = task.effect[key];
          if (isNumber(effectValue)) {
            incrementResource(key, effectValue);
          }
        }
      }
      if ("runCost" in task) {
        for (const key in task.runCost) {
          const effectValue = task.runCost[key];
          if (isNumber(effectValue)) {
            incrementResource(key, -effectValue);
          }
        }
      }
      if (!canDo(task)) {
        setCurrentTask(undefined);
      }
    } else {
      setCurrentTask(undefined);
    }
  };

  const longUpdate = (ms: number): void => {
    if (!state.running) return;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const dt = ms / 1000.0;
  };

  onMount(async () => {
    // TODO: Check if we have a save game in localstorage

    schedule(webWorker, "quick", 100, quickUpdate); // maybe 250?
    schedule(webWorker, "main", 1000, mainUpdate);
    schedule(webWorker, "long", 1000, longUpdate);
  });

  onCleanup(() => webWorker.stop());

  return (
    <div class={styles.App + " bg-stone-800 text-stone-50 flex flex-col"}>
      <div class={"bg-stone-700 flex flex-row px-2 py-0.5 items-baseline"}>
        <div class="flex-none">
          <span class="mx-2">Kalavale</span>
          <Button size="small" label="Save" kClick={() => save()} />
          <Button size="small" label="Load" kClick={() => load()} />
          <Button size="small" label="Reset" />
        </div>
        <div class="flex-1 text-center">
          Genesis
          <span
            classList={{
              [styles.play]: state.running,
              [styles.pause]: !state.running,
            }}
            onClick={() =>
              setState((state) => {
                return { ...state, running: !state.running };
              })
            }
          />
        </div>
        <span class="flex-none">v0.0.1</span>
      </div>
      <div class={styles.gamePanel}>
        <div class={styles.resourcePanel}>
          <div class={styles.resourceTable}>
            <For each={data.resources.filter((res) => res.available)}>
              {(resource) => {
                return (
                  <div class={styles.resourceRow}>
                    <div class={styles.resourceName}>{resource.id}</div>
                    <div class={styles.resourceValue}>
                      <FormattedNumber value={resource.amount} />/
                      {resource.limit}
                    </div>
                  </div>
                );
              }}
            </For>
          </div>
        </div>
        <div style={{ flex: 4 }} class="flex flex-col gap-1 py-1">
          <span>Tasks - active: {currentTask()}</span>
          <span class={"text-yellow-500 p-1"}>Actions</span>
          <div class={styles.actionList}>
            <For each={data.tasks.filter((task) => !task.continuous)}>
              {(task) => (
                <Button
                  label={task.name}
                  disabled={!canDo(task)}
                  kClick={() => doAction(task.id)}
                />
              )}
            </For>
          </div>
          <span class={"text-yellow-500 p-1"}>Tasks</span>
          <div class={styles.actionList}>
            <For each={data.tasks.filter((task) => task.continuous)}>
              {(task) => (
                <Button
                  label={task.name}
                  disabled={!canDo(task)}
                  active={currentTask() === task.id}
                  kClick={() => toggleTask(task.id)}
                />
              )}
            </For>
          </div>
        </div>
      </div>
      <div class={"bg-stone-700 flex flex-row px-2 py-0.5 items-baseline"}>
        <span class="flex-1">Kalavale by opossumi</span>
        <span>Discord | GitHub</span>
      </div>
    </div>
  );
};

export default App;
