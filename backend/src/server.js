const http = require("http");
const app = require("./app");
const { configureSockets } = require("./sockets");

const port = process.env.PORT || 5000;
const server = http.createServer(app);

configureSockets(server);

server.listen(port, () => {
  console.log(`NexTrip API listening on port ${port}`);
});
