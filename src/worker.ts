type KalevalaWorker = {
  worker?: Worker;
  /*start: () => void;*/
  stop: () => void;
  callbacks: Map<string, [(ms: number) => void, number]>;
};

export const webWorker: KalevalaWorker = {
  worker: undefined,
  stop: () => {},
  callbacks: new Map<string, [(ms: number) => void, number]>(),
};

export function schedule(
  webworker: KalevalaWorker,
  name: string,
  ms: number,
  cb: (ms: number) => void,
) {
  webWorker.worker?.postMessage({ name: name, ms: ms });
  webWorker.callbacks.set(name, [cb, ms]);
}

webWorker.worker = new Worker(new URL("./scheduler.js", import.meta.url));
webWorker.worker.onmessage = (event) => {
  const data = event.data;
  const cb = webWorker.callbacks.get(data);
  if (cb) {
    cb[0](cb[1]);
  }
};
