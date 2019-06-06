var textract = require("textract");

var filePaths = [
  "13.pdf",
  "17.pdf",
  "19.pdf",
  "20.pdf",
  "21.pdf",
  "22.pdf",
  "23.pdf",
  "29.pdf",
  "21.pdf",
  "46.pdf",
  "48.pdf",
  "49.pdf",
  "50.pdf",
  "98.pdf",
  "118.pdf",
  "120.pdf"
];
var config = {
  preserveLineBreaks: true
};

var idx_abstract, idx_index;
var reg = /\[[0-9]+\]/g;
var articles = [];

function extractTextFromPdf(filePath, config) {
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

function getAuthors(text) {
  text.some((line, idx) => {
    idx_abstract = idx;
    return line.startsWith("ABSTRACT");
  });
  return text[idx_abstract - 1];
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

function getReferences(text) {
  for (let i = idx_index; i < text.length; i++) {
    if (text[i].startsWith("REFERENCES"))
      return getLinesByRegExpression(text, i);
  }
}

function getLinesByRegExpression(text, idx) {
  let references = [];
  for (let i = idx + 1; i < text.length; i++) {
    if (reg.test(text[i])) references.push(text[i]);
  }
  return references;
}

function init() {
  let num = 0;
  filePaths.forEach(file => {
    extractTextFromPdf("./pdfs/" + file, config)
      .then(text => {
        //remove first line
        text.shift();

        articles.push({
          article: file,
          title: getTitle(text),
          authors: getAuthors(text),
          institutions: [],
          abstract: getAbsctract(text),
          objective: "",
          problem: "",
          methodology: "",
          contributes: "",
          references: getReferences(text),
          terms: []
        });
        num++;
        generateGraph(num);
      })
      .catch(error => console.log(error));
  });
}

function generateGraph(num) {
  if (num == filePaths.length) {
    console.log(articles);
  }
}

init();
