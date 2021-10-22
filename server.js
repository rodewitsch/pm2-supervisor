const express = require("express");
const app = express();

app.post("/", (req, res) => res.status(502).send("bad gateway"));

app.listen(3000, function () {
  console.log("listening on port 3000");
});
