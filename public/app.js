function renderSchemes(schemes) {
  const skosListElement = document.getElementById("schemes");
  skosListElement.innerHTML = ""; // Clear the list
  for (const current of schemes.results.bindings) {
    const { schemeUri, prefLabel } = current;
    const listItem = document.createElement("div");
    const link = document.createElement("a");
    link.href = "#"; // schemeUri.value;
    link.textContent = prefLabel.value;

    // Add an event listener to the link
    link.addEventListener("click", () => {
      // Call your function when the link is clicked
      loadElements(schemeUri.value, prefLabel.value);
    });

    listItem.appendChild(link);
    skosListElement.appendChild(listItem);
  }
}

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
}

const endpointUrl = "http://localhost:3000/sparql";
const queryDispatcher = new SPARQLQueryDispatcher(endpointUrl);

let schemes = [];

async function loadSchemes() {
  const querySchemes = `
            SELECT ?schemeUri ?prefLabel 
            where { 
                ?schemeUri a <http://www.w3.org/2004/02/skos/core#ConceptScheme>;
                <http://publications.europa.eu/ontology/authority/prefLabel> ?prefLabel 
            }`;
  schemes = await queryDispatcher.query(querySchemes);
  renderSchemes(schemes);
}

async function loadElements(uri, label) {
  const title = document.getElementById("title");
  title.innerHTML = label;

  const queryScheme = `
        SELECT distinct ?concept ?conceptPrefLabel
            {
              ?concept skos:inScheme <${uri}> ;
              skos:prefLabel ?conceptPrefLabel.
            FILTER (LANG(?conceptPrefLabel)="en")
        } LIMIT 100`;

  elements = await queryDispatcher.query(queryScheme);
  const list = document.getElementById("values");
  list.innerHTML = ""; // Clear the list
  for (const current of elements.results.bindings) {
    const { concept, conceptPrefLabel } = current;
    const listItem = document.createElement("div");
    const link = document.createElement("a");
    link.href = concept.value; // concept.value;
    link.textContent = conceptPrefLabel.value;

    listItem.appendChild(link);
    list.appendChild(listItem);
  }
}

loadSchemes();
