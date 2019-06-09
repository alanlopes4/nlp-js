var json = require("./generateJSON.js");

var i;

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

function generateEdgesGraphOfTerms(articles) {
  let articles_processed = [];
  let new_articles = articles.map(article1 => {
    let edgesTerms = [];
    article1.terms.forEach(term => {
      articles.map(article2 => {
        if (
          article1.article != article2.article &&
          article2.terms.includes(term)
        ) {
          if (!articles_processed.includes(article2.article))
            edgesTerms.push(article2.article);
        }
      });
    });
    articles_processed.push(article1.article);
    return { ...article1, edgesTerms };
  });
  generateGraphFromArticles(new_articles, "edgesTerms", "graphTerms");
}

function generateGraphFromArticles(articles, typeGraph, filename) {
  var g = {
    nodes: [],
    edges: []
  };
  // Generate a random graph:
  for (i = 0; i < articles.length; i++)
    g.nodes.push({
      id: "n" + articles[i].article,
      label: articles[i].title,
      x: Math.random(),
      y: Math.random(),
      size: 10,
      color: "#ec5148",
      originalColor: "#eee",
      colorOver: "blue"
    });

  for (i = 0; i < articles.length; i++) {
    if (articles[i][typeGraph].length > 0) {
      for (let j = 0; j < articles[i][typeGraph].length; j++) {
        g.edges.push({
          id: "e" + i + "" + j + "" + Math.random(),
          source: "n" + articles[i].article,
          target: "n" + articles[i][typeGraph][j]
        });
      }
    }
  }

  json.generateFileJSON(g, filename);
}

module.exports = {
  generateGraphFromArticles,
  generateEdgesGraphOfAuthors,
  generateEdgesGraphOfReferences,
  generateEdgesGraphOfTerms
};
