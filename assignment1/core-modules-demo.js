const os = require("os");
const path = require("path");
const fs = require("fs");
const fsPromises = require("fs/promises");

const sampleDir = path.join(__dirname, "sample-files");
const demoFilePath = path.join(sampleDir, "demo.txt");
const largeFilePath = path.join(sampleDir, "largefile.txt");
const joinedPath = path.join(__dirname, "sample-files", "folder", "file.txt");

async function main() {
  try {
    // klasör oluştur
    await fsPromises.mkdir(sampleDir, { recursive: true });

    // os
    console.log("Platform:", os.platform());
    console.log("CPU:", os.cpus()[0].model);
    console.log("Total Memory:", os.totalmem());

    // path
    console.log("Joined path:", joinedPath);

    // fs.promises
    await fsPromises.writeFile(demoFilePath, "Hello from fs.promises!");
    const data = await fsPromises.readFile(demoFilePath, "utf8");
    console.log("fs.promises read:", data);

    // large file oluştur
    let content = "";
    for (let i = 1; i <= 100; i++) {
      content += `This is a line in a large file. Line ${i}\n`;
    }
    await fsPromises.writeFile(largeFilePath, content);

    // stream
    const readStream = fs.createReadStream(largeFilePath, {
      encoding: "utf8",
      highWaterMark: 1024,
    });

    readStream.on("data", (chunk) => {
      console.log("Read chunk:", chunk.slice(0, 40));
    });

    readStream.on("end", () => {
      console.log("Finished reading large file with streams.");
    });

    readStream.on("error", (err) => {
      console.error(err);
    });
  } catch (err) {
    console.error(err);
  }
}

main();
