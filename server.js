import express from "express";
import request from "request";
import cors from "cors";

const endpoint = "http://publications.europa.eu/webapi/rdf/sparql";

const app = express();

const corsOptions = {
  origin: (origin, callback) => {
    callback(null, true);
  },
};
app.options("*", cors(corsOptions));

const url = endpoint;

app.use(express.static("public"));

app.use("/sparql", cors(corsOptions), (req, res) => {
  const request_url = `${url}${req.url}`;

  req.pipe(request(request_url)).pipe(res);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);
console.log(`http://localhost:${PORT}/`);
