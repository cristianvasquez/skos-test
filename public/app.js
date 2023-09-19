/**
 * Queries
 */

class SPARQLQueryDispatcher {
  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  query(sparqlQuery) {
    const fullUrl = this.endpoint + "?query=" + encodeURIComponent(sparqlQuery);
    const headers = { Accept: "application/sparql-results+json" };
    return fetch(fullUrl, { headers }).then((body) => body.json());
  }

  queryTurtle(sparqlQuery) {
    const fullUrl =
      this.endpoint +
      "?query=" +
      encodeURIComponent(sparqlQuery) +
      `&format=application/x-nice-turtle`;
    const headers = {
      Accept: "text/turtle",
    };
    return fetch(fullUrl, { headers }).then((body) => body.text());
  }
}

const endpointUrl = "http://localhost:3000/sparql";
const queryDispatcher = new SPARQLQueryDispatcher(endpointUrl);

function filterTerm(str) {
  if (str && str.length >= 0) {
    return `FILTER(STRSTARTS(UCASE(?label), "${str.toUpperCase()}"))`;
  }
  return "";
}

/**
 * Scheme list
 */

schemesFilter = "";
selectedScheme = undefined;

document.getElementById("search-1").addEventListener("input", function () {
  schemesFilter = this.value.trim();
  loadSchemes();
});

async function loadSchemes() {
  const query = `
            SELECT ?uri ?label 
            where { 
                ?uri a <http://www.w3.org/2004/02/skos/core#ConceptScheme>;
                <http://publications.europa.eu/ontology/authority/prefLabel> ?label .
                ${filterTerm(schemesFilter)}
            }
             ORDER BY ?label
            `;

  const div = document.getElementById("schemes");
  div.innerHTML = "...loading";
  result = await queryDispatcher.query(query);
  div.innerHTML = "";

  for (const current of result.results.bindings) {
    const { uri, label } = current;
    const listItem = document.createElement("div");

    const link = document.createElement("a");
    link.textContent = label.value;
    link.href = "#";
    link.addEventListener("click", () => {
      selectedScheme = uri.value;
      document.getElementById("title").innerHTML = label.value;

      loadSchemeElements(uri.value);
    });

    listItem.appendChild(link);
    div.appendChild(listItem);
  }
}

/**
 * Scheme elements
 */

schemeElementFilter = "";

document.getElementById("search-2").addEventListener("input", function () {
  schemeElementFilter = this.value.trim();
  loadSchemeElements(selectedScheme);
});

async function loadSchemeElements(uri) {
  clearTurtle();
  const query = `
        SELECT distinct ?uri ?label
            {
              ?uri skos:inScheme <${uri}> ;
              skos:prefLabel ?label.
            FILTER (LANG(?label)="en") .
            ${filterTerm(schemeElementFilter)}
        }  ORDER BY ?label LIMIT 100`;

  const div = document.getElementById("schemeElements");
  div.innerHTML = "...loading";
  result = await queryDispatcher.query(query);
  div.innerHTML = "";
  for (const current of result.results.bindings) {
    const { uri, label } = current;
    const listItem = document.createElement("div");

    const link = document.createElement("a");
    link.textContent = label.value;

    link.href = "#";
    link.addEventListener("click", () => {
      displayTurtle(uri.value);
    });

    listItem.appendChild(link);
    div.appendChild(listItem);
  }
}

/**
 * Display turtle
 */

function clearTurtle() {
  document.getElementById("turtle-title").innerHTML = "";
  document.getElementById("turtle").innerHTML = "";
}

async function displayTurtle(uri) {
  clearTurtle();
  document.getElementById("turtle-title").innerHTML = uri;

  const query = `

CONSTRUCT
  {
    <${uri}> ?p ?o .
  }
WHERE
  {
    <${uri}> ?p ?o .
  }

`;

  const div = document.getElementById("turtle");
  result = await queryDispatcher.queryTurtle(query);
  div.innerHTML = result;
}

/**
 * Main
 */

loadSchemes("");
