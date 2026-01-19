const http = require("http");

http.createServer((req, res) => {
  res.end("Hello from Kubernetes on AWS EC2 🚀");
}).listen(3000);
