import fs from "fs";
import express from "express";

class SPARQLQueryDispatcher {
  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  query(sparqlQuery) {
    const fullUrl = this.endpoint + "?query=" + encodeURIComponent(sparqlQuery);
    const headers = { Accept: "application/sparql-results+json" };
    return fetch(fullUrl, { headers }).then((body) => body.json());
  }
}

const endpointUrl = "http://publications.europa.eu/webapi/rdf/sparql";
const queryDispatcher = new SPARQLQueryDispatcher(endpointUrl);

const app = express();
const port = 3000;

app.get("/schemes", (req, res) => {
  const query = `
            SELECT ?schemeUri ?prefLabel 
            where { 
                ?schemeUri a <http://www.w3.org/2004/02/skos/core#ConceptScheme>;
                <http://publications.europa.eu/ontology/authority/prefLabel> ?prefLabel

                
}`;
  queryDispatcher.query(query).then((data) => {
    res.json(data);
  });
});

app.get("/scheme", (req, res) => {
  const uri = req.query.uri; // Extract the URI from the query parameters

  if (!uri) {
    res.status(400).json({ error: "URI parameter is missing" });
    return;
  }

  const query = `
        SELECT distinct ?concept ?conceptPrefLabel
            {
              ?concept skos:inScheme <${uri}> ;
              skos:prefLabel ?conceptPrefLabel.
            FILTER (LANG(?conceptPrefLabel)="en")
        } LIMIT 100`;

  console.log(query);
  queryDispatcher.query(query).then((data) => {
    res.json(data);
  });
});

// Serve HTML at the root endpoint
app.get("/", (req, res) => {
  fs.readFile("index.html", "utf8", (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
      return;
    }
    res.send(data);
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
