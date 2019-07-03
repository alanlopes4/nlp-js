var textract = require("textract");
var g_graph = require("./generateGraph.js");
var json = require("./generateJSON.js");
var watsonApiKey = require("./ibm-watson/credentials-watson.json").apikey;
var NaturalLanguageUnderstand = require("watson-developer-cloud/natural-language-understanding/v1");
var nlu = new NaturalLanguageUnderstand({
  iam_apikey: watsonApiKey,
  version: "2018-04-05",
  url: "https://gateway.watsonplatform.net/natural-language-understanding/api"
});

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

var wordCounts = [];
var NUM_TERMS = 10;

var idx_abstract, idx_index, idx_reference;
var reg = /\[[0-9]+\]/g;
var reg_last_reference = /(\d{4})\./g;
var articles = [];

function analyzeWatson(file, text) {
  nlu.analyze(
    {
      text: text,
      features: {
        keywords: {
          limit: 10,
          sentiment: true,
          emotion: true
        },
        categories: {
          limit: 10
        },
        concepts: {
          limit: 10
        },
        emotion: {},
        entities: {
          limit: 10,
          sentiment: true,
          emotion: true
        },
        relations: {},
        semantic_roles: {
          limit: 10
        },
        sentiment: {
          document: true
        }
      }
    },
    (error, response) => {
      if (error) {
        console.log("ERROR API WATSON:" + error);
      }

      json.generateFileJSON(response, `${file}-watson`);
    }
  );
}

function getInstituicions() {}

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
    if (text[i].startsWith("REFERENCES")) {
      idx_reference = i;
      return getLinesByRegExpression(text, i);
    }
  }
}

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
  text.forEach((line, idx) => {
    if (line.includes("THE WAY")) {
      problem.push(getPhraseWhole(text, idx));
    }else if (line.includes("CHALLENGE")) {
      problem.push(getPhraseWhole(text, idx));
    } else if (line.includes("DIFFICULT")) {
      problem.push(getPhraseWhole(text, idx));
    }else if (line.includes("SUFFERS")) {
      problem.push(getPhraseWhole(text, idx));
    }
  });
  return problem;
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

function getContributes(text) {
  let contributes = [];
  text.forEach((line, idx) => {
    if (line.includes("CONTRIBUTES")) {
      contributes.push(getPhraseWhole(text, idx));
    }
  });
  return contributes;
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

function getMostCommomWords(text) {
  let words = text
    .slice(idx_abstract, idx_reference)
    .join("")
    .split(/\b/);
  let count = 0;
  let terms = [];
  wordCounts = [];
  for (var i = 0; i < words.length; i++) {
    //para todas as palavras do artigo
    if (
      words[i].length > 4 &&
      isNaN(words[i]) &&
      (!words[i].trim().includes("· · ·") &&
        !words[i].trim().includes(", . . . ,"))
    ) {
      //se a palavra ter 5 caracteres ou mais e se n for um dígito
      wordCounts[words[i]] = (wordCounts[words[i]] || 0) + 1;
      if (count < NUM_TERMS) {
        terms.push({
          term: words[i],
          frequency: wordCounts[words[i]]
        });
        count++;
      } else if (count == NUM_TERMS) {
        count++;
        terms.sort((a, b) => a.frequency < b.frequency);
      } else {
        let idx_term = -1;
        let found_term = terms.some((v, idx) => {
          if (v.term.trim() == words[i].trim()) {
            idx_term = idx;
            return true;
          }
          return false;
        });

        if (found_term) {
          terms[idx_term] = { term: words[i], frequency: wordCounts[words[i]] };
          found_term = false;
        } else {
          let found = false;
          terms = terms.map(v => {
            if (v.frequency < wordCounts[words[i]] && !found) {
              found = true;
              return { term: words[i], frequency: wordCounts[words[i]] };
            }
            return v;
          });
        }
      }
    }
  }
  return terms.sort((a, b) => a.frequency < b.frequency);
}


function init() {
  let num = 0;
  //extractTextFromPdf("./pdfs/13.pdf", config);
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
          objective: getObjective(text),
          problem: getProblem(text),
          methodology: getMethodology(text),
          contributes: getContributes(text),
          references: getReferences(text),
          terms: getMostCommomWords(text).map(v => v.term)
        });
        num++;
        //analyzeWatson(file.split(".")[0], text.join(""));
        generateGraphToJSON(num);
      })
      .catch(error => console.log(error));
  });
}

function generateGraphToJSON(num) {
  if (num == filePaths.length) {
    g_graph.generateEdgesGraphOfReferences(articles);
    g_graph.generateEdgesGraphOfAuthors(articles);
    g_graph.generateEdgesGraphOfTerms(articles);

    json.generateFileJSON(articles, "articles");
  }
}

init();