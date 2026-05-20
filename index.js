const app = require("./server");

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Try stopping the process using that port or start the app with a different PORT value.`);
    process.exit(1);
  }
  throw err;
});