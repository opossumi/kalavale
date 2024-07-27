var intervals = {};

onmessage = (event) => {
  let data = event.data;

  if (data.name === "clear") {
    for (const key in intervals) {
      clearInterval(intervals[key]);
      delete intervals[key];
    }
    return;
  }

  if (data.name in intervals) {
    clearInterval(intervals[data.name]);
  }
  intervals[data.name] = setInterval(() => {
    self.postMessage(data.name);
  }, data.ms);
};
