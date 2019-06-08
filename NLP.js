var textract = require("textract");
var g_graph = require("./generateGraph.js");
var filePaths = [
  "13.pdf",
  "17.pdf",
  "19.pdf",
  "20.pdf",
  "21.pdf",
  "22.pdf",
  "23.pdf",
  "29.pdf",
  "31.pdf",
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
var reg_last_reference = /(\d{4})\./g;
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
  let i = 0;
  while (!text[i].includes(",") && !text[i].includes("ABSTRACT")) {
    title += `${text[i]} `;
    i++;
  }
  console.log(title);
  return title;
}

function getAuthors(text) {
  text.some((line, idx) => {
    idx_abstract = idx;
    return line.startsWith("ABSTRACT");
  });
  return text[idx_abstract - 1]
    .split(",")
    .filter(author => !author.includes("IEEE") && !author.includes("MEMBER"))
    .map(author => {
      if (author.includes("AND")) return author.slice(4);
      return author;
    });
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
//Armazena linhas de acordo com uma expressão regular
function getLinesByRegExpression(text, idx) {
  let references = [];
  let count = 0;
  for (let i = idx + 1; i < text.length; i++) {
    if (reg.test(text[i])) references.push(getWholeReference(text, i));
  }
  return references;
}
function getWholeReference(text, idx) {
  let reference = "";
  let count = 0;
  while (!reg_last_reference.test(text[idx])) {
    reference += text[idx];
    idx++;
    if (count++ > 5) break;
  }
  if (count <= 5)
    reference += text[idx].substring(
      0,
      text[idx].slice(0).search(reg_last_reference) + 5
    );
  return reference;
}

function getProblem(text) {
  let problem = [];
  text.some((line, idx) => {
    if (line.includes("THE WAY")) console.log("THE WAY", line);
    //return line.contains("PROBLEM");
  });
  return problem.join("");
}

function getMethodology(text) {
  let methodology = [];
  text.forEach((line, idx) => {
    if (line.includes("METHODOLOGY")) {
      methodology.push(getPhraseWhole(text, idx));
    } else if (line.includes("INTERVIEWS")) {
      methodology.push(getPhraseWhole(text, idx));
    } else if (line.includes("SURVEYS")) {
      methodology.push(getPhraseWhole(text, idx));
    }
  });
  return methodology;
}

function getObjective(text) {
  let objective = [];
  text.forEach((line, idx) => {
    if (line.includes("THIS RESEARCH")) {
      objective.push(getPhraseWhole(text, idx));
    } else if (line.includes("THIS PAPER, WE")) {
      objective.push(getPhraseWhole(text, idx));
    } else if (line.includes("WE PROPUSE")) {
      objective.push(getPhraseWhole(text, idx));
    } else if (line.includes("PURPOSE OF THIS")) {
      objective.push(getPhraseWhole(text, idx));
    }
  });
  return objective;
}

function getPhraseWhole(text, idx) {
  let phrase = "";
  while (!text[idx].includes(".")) {
    phrase += text[idx];
    idx++;
  }
  phrase += text[idx].substring(0, text[idx].indexOf("."));
  return phrase;
}

function test() {}

function init() {
  let num = 0;

  filePaths.forEach(file => {
    extractTextFromPdf("./pdfs/" + file, config)
      .then(text => {
        //remove first line
        text.shift();
        console.log(file);
        articles.push({
          article: file,
          title: getTitle(text),
          authors: getAuthors(text),
          institutions: [],
          abstract: getAbsctract(text),
          objective: getObjective(text),
          problem: "",
          methodology: getMethodology(text),
          contributes: "",
          references: getReferences(text),
          terms: []
        });
        num++;
        generateGraphToJSON(num);
      })
      .catch(error => console.log(error));
  });
}

function generateGraphToJSON(num) {
  if (num == filePaths.length) {
    //g_graph.generateEdgesGraphOfReferences(articles);
    //g_graph.generateEdgesGraphOfAuthors(articles);
  }
}

init();
//test();
