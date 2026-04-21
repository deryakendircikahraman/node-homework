const EventEmitter = require("events");

const emitter = new EventEmitter();

emitter.on("time", (timeString) => {
  console.log("Time received:", timeString);
});

const interval = setInterval(() => {
  emitter.emit("time", new Date().toString());
}, 5000);

// Don't keep the Node process alive just for this interval (important for tests).
interval.unref();

module.exports = emitter;

