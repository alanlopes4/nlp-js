var fs = require("fs");

function generateFileJSON(data, filename) {
  var data_json = JSON.stringify(data);
  fs.writeFile(`./${filename}.json`, data_json, err => {
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
