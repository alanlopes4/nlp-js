var i,
  s,
  N = 10,
  E = 20,
  g = {
    nodes: [],
    edges: []
  };
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
  generateGraphFromArticles
};
