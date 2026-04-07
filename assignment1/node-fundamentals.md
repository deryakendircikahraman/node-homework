# Node.js Fundamentals

## What is Node.js?

Node.js is a JavaScript runtime environment that allows developers to run JavaScript outside the browser. It is mainly used for building backend applications, APIs, and server-side programs.

## How does Node.js differ from running JavaScript in the browser?

JavaScript in the browser runs in a sandboxed environment and interacts with the DOM using objects like `window` and `document`. Node.js runs on the server or local machine, so it can access the file system, operating system, and network. Node does not have browser objects like `window` or `document`.

## What is the V8 engine, and how does Node use it?

The V8 engine is Google’s JavaScript engine that powers Chrome. Node.js uses the V8 engine to execute JavaScript code efficiently outside the browser.

## What are some key use cases for Node.js?

- Building REST APIs and web servers
- Creating real-time applications (e.g., chat apps)
- Writing command-line tools
- Handling file system operations
- Backend services for web applications

## Explain the difference between CommonJS and ES Modules. Give a code example of each.

**CommonJS (default in Node.js):**

```js
const math = require("./math");

function add(a, b) {
  return a + b;
}

module.exports = { add };
```
