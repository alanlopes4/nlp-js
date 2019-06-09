var articles = [];

function loadJSON(filename) {
  clearScreen();

  sigma.parsers.json(
    filename,
    {
      container: "sigma-container",
      settings: {
        edgeColor: "default",
        defaultNodeColor: "#ec5148",
        defaultEdgeColor: "#dbc09b",
        font: "calibri"
      }
    },
    function(s) {
      s.graph.nodes().forEach(function(n) {
        n.type = "square";
      });
      // We first need to save the original colors of our
      // nodes and edges, like this:
      s.graph.nodes().forEach(function(n) {
        n.originalColor = n.originalColor;
      });
      s.graph.edges().forEach(function(e) {
        e.originalColor = e.color;
      });

      s.bind("overNode", function(e) {
        var nodeId = e.data.node.id,
          toKeep = s.graph.neighbors(nodeId);
        toKeep[nodeId] = e.data.node;
        console.log(toKeep);

        s.graph.nodes().forEach(function(n) {
          console.log(n.color, n.originalColor);
          if (toKeep[n.id]) n.color = n.colorOver;
          else n.color = "#eee";
        });

        s.graph.edges().forEach(function(e) {
          if (toKeep[e.source] && toKeep[e.target]) e.color = e.originalColor;
          else e.color = "#eee";
        });
        s.refresh();
      });

      s.bind("clickNode", function(e) {
        updateInformationArticle(e.data.node.id);
      });

      s.bind("outNode", function(e) {
        s.graph.nodes().forEach(function(n) {
          n.color = "#ec5148";
        });

        s.graph.edges().forEach(function(e) {
          e.color = e.originalColor;
        });

        // Same as in the previous event:
        s.refresh();
      });
    }
  );
}

function loadArticleJSON() {
  $.getJSON("./articles.json", function(data) {
    $.each(data, function(key, val) {
      articles[`n${val.article}`] = { ...val };
    });
  });
}

function updateInformationArticle(article) {
  console.log("NODE ID", article);
  document.getElementById("title").innerHTML = articles[article].title;
  document.getElementById("authors").innerHTML = articles[article].authors.join(
    ", "
  );
  document.getElementById("abstract").innerHTML = articles[article].abstract;
  document.getElementById("objective").innerHTML = articles[article].objective;
  document.getElementById("problem").innerHTML = articles[article].problem;
  document.getElementById("methodology").innerHTML =
    articles[article].methodology;
  document.getElementById("contributes").innerHTML =
    articles[article].contributes;
  document.getElementById("references").innerHTML = articles[
    article
  ].references.join("<br >");
  document.getElementById("terms").innerHTML = articles[article].terms.join(
    "<br >"
  );
}

function clearScreen() {
  document.getElementById("sigma-container").innerHTML = "";
}
