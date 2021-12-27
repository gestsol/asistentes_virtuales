const express = require("express");
const cors = require("cors");
const optionRouter = require("./routes/options.router");

const app = express();

app.use(cors("*"));
app.use(express.json());

app.use("/api/v1/options", optionRouter);

app.all("*", (req, res, next) => {
  res.status(404).json({
    status: "Fail",
    error: `Can't find ${req.originalUrl} on this server!`,
  });
});

app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  let message = err.message;
  if (err.code === 11000) {
    const fieldStart = err.message.substring(
      err.message.indexOf("index: ") + 7
    );
    const fieldIndexEnd = fieldStart.indexOf("_");
    const actualField = fieldStart.substring(0, fieldIndexEnd);
    const value = fieldStart
      .substring(fieldStart.indexOf("{"))
      .replace(/[^a-zA-Z 0-9]+/g, "")
      .replace(/ /g, "");

    message = `El campo ${actualField} con valor = ${value} ya existe. (Este campo es único)`;
  }

  console.log(err);
  res.status(400).json({
    status: "fail",
    error: message,
  });
});

module.exports = app;
