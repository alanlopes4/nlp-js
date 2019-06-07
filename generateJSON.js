var fs = require("fs");

function generateFileJSON(graph, filename) {
  var graph_json = JSON.stringify(graph);
  fs.writeFile(`./${filename}.json`, graph_json, err => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(`Arquivo ${filename} criado com sucesso!`);
  });
}

module.exports = {
  generateFileJSON
};
