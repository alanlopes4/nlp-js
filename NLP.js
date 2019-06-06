var textract = require("textract");

var filePath = "./pdfs/13.pdf";
var config = {
  preserveLineBreaks: true
};

var idx_abstract, idx_index;

var articles = [];
var article = {
  title: "",
  references: [],
  authors: [],
  institutions: [],
  abstract: [],
  terms: []
};

async function extractTextFromPdf(filePath, config) {
  return new Promise((resolve, reject) => {
    textract.fromFileWithPath(filePath, config, function(error, text) {
      if (error) {
        reject(error);
        return;
      }

      resolve(text.toUpperCase().split("\n"));
    });
  });
}

function getTitle(text) {
  let title = "";
  for (let i = 0; i < idx_abstract - 1; i++) title += `${text[i]} `;
  return title;
}

function getAbsctract(text) {
  let abstract = [];
  text.some((line, idx) => {
    idx_index = idx;
    if (idx >= idx_abstract) abstract.push(line);
    return line.startsWith("INDEX TERMS");
  });
  abstract.pop();
  return abstract.join("");
}

function getAuthors(text) {
  text.some((line, idx) => {
    idx_abstract = idx;
    return line.startsWith("ABSTRACT");
  });
  return text[idx_abstract - 1];
}

extractTextFromPdf("./pdfs/17.pdf", config)
  .then(text => {
    //remove first line
    text.shift();

    article.authors = getAuthors(text);
    article.title = getTitle(text);
    article.abstract = getAbsctract(text);
  })
  .catch(error => console.log(error));
