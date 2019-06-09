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
        font: "calibri",
        zoomMax: 1
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

function clearScreen() {
  document.getElementById("sigma-container").innerHTML = "";
}
