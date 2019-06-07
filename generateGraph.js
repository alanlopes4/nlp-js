var json = require("./generateJSON.js");

var i,
  g = {
    nodes: [],
    edges: []
  };

function generateEdgesGraphOfReferences(articles) {
  let new_articles = articles.map(article1 => {
    let edgesReference = [];
    article1.references.forEach(reference => {
      articles.map(article2 => {
        if (
          article1.article != article2.article &&
          article2.title.trim().length > 0 &&
          reference.includes(article2.title)
        ) {
          edgesReference.push(article2.article);
        }
      });
    });
    console.log(article1.article, edgesReference);
    return { ...article1, edgesReference };
  });
  generateGraphFromArticles(new_articles, "edgesReference", "graphReferences");
}

function generateEdgesGraphOfAuthors(articles) {
  let new_articles = articles.map(article1 => {
    let edgesAuthor = [];
    article1.authors.forEach(author => {
      articles.map(article2 => {
        if (
          article1.file != article2.file &&
          article2.authors.includes(author)
        ) {
          edgesAuthor.push(article2.article);
        }
      });
    });
    return { ...article1, edgesAuthor };
  });
  generateGraphFromArticles(new_articles, "edgesAuthor", "graphAuthors");
}

function generateGraphFromArticles(articles, typeGraph, filename) {
  // Generate a random graph:
  for (i = 0; i < articles.length; i++)
    g.nodes.push({
      id: "n" + articles[i].article,
      label: articles[i].title,
      x: Math.random(),
      y: Math.random(),
      size: 10,
      color: "#666"
    });

  for (i = 0; i < articles.length; i++) {
    if (articles[i][typeGraph].length > 0) {
      for (let j = 0; j < articles[i][typeGraph].length; j++) {
        g.edges.push({
          id: "e" + articles[i].article,
          source: "n" + articles[i].article,
          target: "n" + articles[i][typeGraph][j],
          size: Math.random(),
          color: "#ccc"
        });
      }
    }
  }

  json.generateFileJSON(g, filename);
  // Instantiate sigma:
  /*s = new sigma({
    graph: g,
    container: "sigma-container"
  });*/
}

module.exports = {
  generateGraphFromArticles,
  generateEdgesGraphOfAuthors,
  generateEdgesGraphOfReferences
};
