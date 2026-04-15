const http = require("http");

const htmlString = `
<!DOCTYPE html>
<html>
<body>
<h1>Clock</h1>
<button id="getTimeBtn">Get the Time</button>
<p id="time"></p>
<script>
document.getElementById('getTimeBtn').addEventListener('click', async () => {
    const res = await fetch('/time');
    const timeObj = await res.json();
    console.log(timeObj);
    const timeP = document.getElementById('time');
    timeP.textContent = timeObj.time;
});
</script>
</body>
</html>
`;

function sendJson(res, statusCode, obj) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(obj));
}

const server = http.createServer({ keepAliveTimeout: 60000 }, (req, res) => {
  if (req.method !== "GET") {
    return sendJson(res, 404, { message: "That route is not available." });
  }

  if (req.url === "/time") {
    return sendJson(res, 200, { time: new Date().toString() });
  }

  if (req.url === "/timePage") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return res.end(htmlString);
  }

  return sendJson(res, 200, { pathEntered: req.url });
});

server.listen(8000);

