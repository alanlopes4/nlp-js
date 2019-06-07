var i,
  s,
  N = 10,
  E = 20,
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
          article2.title.trim().length > 0 &&
          reference.includes(article2.title)
        ) {
          edgesReference.push(article2.article);
        }
      });
    });
    return { ...article1, edgesReference };
  });

  //new_articles.map(a => console.log(a.edgesReference));
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
  //new_articles.map(a => console.log(a.edgesAuthor));
}

function generateGraphFromArticles(articles) {
  // Generate a random graph:
  console.log(articles.length);
  for (i = 0; i < articles.length; i++)
    g.nodes.push({
      id: "n" + i,
      label: articles[i].title,
      x: Math.random(),
      y: Math.random(),
      size: 10,
      color: "#666"
    });

  for (i = 0; i < E; i++)
    g.edges.push({
      id: "e" + i,
      source: "n" + ((Math.random() * N) | 0),
      target: "n" + ((Math.random() * N) | 0),
      size: Math.random(),
      color: "#ccc"
    });

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
