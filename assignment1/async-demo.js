const fs = require("fs");
const fsPromises = require("fs/promises");
const path = require("path");

const sampleDir = path.join(__dirname, "sample-files");
const filePath = path.join(sampleDir, "sample.txt");

if (!fs.existsSync(sampleDir)) {
  fs.mkdirSync(sampleDir, { recursive: true });
}

fs.writeFileSync(filePath, "Hello, async world!");

// Callback version
fs.readFile(filePath, "utf8", (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log("Callback read:", data);
});

// Callback hell example (comment only)
// fs.readFile(filePath, 'utf8', (err, data) => {
//   if (err) {
//     console.error(err);
//   } else {
//     fs.writeFile(filePath, data + '\nMore text', (writeErr) => {
//       if (writeErr) {
//         console.error(writeErr);
//       } else {
//         fs.readFile(filePath, 'utf8', (readErr, newData) => {
//           if (readErr) {
//             console.error(readErr);
//           } else {
//             console.log(newData);
//           }
//         });
//       }
//     });
//   }
// });

// Promise version
fsPromises
  .readFile(filePath, "utf8")
  .then((data) => {
    console.log("Promise read:", data);
  })
  .catch((err) => {
    console.error(err);
  });

// Async/Await version
async function readAsync() {
  try {
    const data = await fsPromises.readFile(filePath, "utf8");
    console.log("Async/Await read:", data);
  } catch (err) {
    console.error(err);
  }
}

readAsync();
