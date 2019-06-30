var articles = [];
var file = "";
var watson = {};

function loadJSONWATSON() {
  $.getJSON(`./${file}-watson.json`, function(data) {
    watson = data;
    updateInformationsWatson();
  });
}

function loadJSON(filename) {
  clearScreen();

  sigma.parsers.json(
    filename,
    {
      container: "sigma-container",
      type: sigma.renderers.canvas,
      settings: {
        edgeColor: "default",
        defaultNodeColor: "#ec5148",
        defaultEdgeColor: "#dbc09b",
        defaultLabelSize: 14,
        font: "calibri"
      }
    },
    function(s) {
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

        s.graph.nodes().forEach(function(n) {
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
        file = e.data.node.id.split(".")[0].replace("n", "");
        updateInformationArticle(e.data.node.id);
      });

      s.bind("clickEdge", function(e) {
        alert("CICLOU");
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
  document.getElementById("information-container").style.display = "flex";
  document.getElementById("watson-container").style.display = "none";

  document.getElementById("btn-watson").removeAttribute("disabled");
  document.getElementById("title").innerHTML = articles[article].title;
  document.getElementById("title-h4").style = "padding-top: 60px;";

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

function updateInformationsWatson() {
  document.getElementById("information-container").style.display = "none";
  document.getElementById("watson-container").style.display = "flex";

  document.getElementById("categories").innerHTML = watson["categories"]
    .map(
      c =>
        `<strong>${c.label}</strong> <br /> <strong>score:</strong> ${c.score}`
    )
    .join("<br >");
  document.getElementById("concepts").innerHTML = watson["concepts"]
    .map(
      c =>
        `<strong>${c.text}</strong> - <strong>relevância: </strong> ${
          c.relevance
        } <br /> <strong> dbpedia: </strong> ${c.dbpedia_resource} `
    )
    .join("<br >");

  let c = watson["emotion"].document.emotion;
  document.getElementById("emotion").innerHTML = `<strong>raiva: </strong>${
    c.anger
  } <br />  <strong>desgosto: </strong> ${
    c.disgust
  } <br /> <strong>medo: </strong> ${
    c.fear
  }  <br /> <strong>alegria: </strong> ${c.joy} 
    <br /> <strong>tristeza: </strong> ${c.sadness} <br />`;

  document.getElementById("entities").innerHTML = watson["entities"]
    .map(
      c =>
        `<strong>Tipo: </strong> ${c.type} <br /> <strong>Texto: </strong> ${
          c.text
        } <br /> <strong>Sentimento: </strong> ${c.sentiment.label} `
    )
    .join("<br >");

  document.getElementById("keywords").innerHTML = watson["keywords"]
    .map(
      c =>
        `<strong>Palavra: </strong> ${
          c.text
        } <br /> <strong>Sentimento: </strong> ${c.sentiment.label} `
    )
    .join("<br >");

  document.getElementById("sentiment").innerHTML = `${
    watson["sentiment"].document.label
  } <br /> <strong>score: </strong> ${
    watson["sentiment"].document.score
  } <br/ >`;

  document.getElementById("language").innerHTML = `${watson["language"]}`;
}

function clearScreen() {
  document.getElementById("sigma-container").innerHTML = "";
  document.getElementById("information-container").style.display = "flex";
  document.getElementById("watson-container").style.display = "none";
}
