const pdfjsLib = require("pdfjs-dist");
const natural = require("natural");

const watsonApiKey = require("./watson-nlu.json").apikey;
const NaturalLanguageUnderstandingV1 = require("watson-developer-cloud/natural-language-understanding/v1.js");

const nlu = new NaturalLanguageUnderstandingV1({
  iam_apikey: watsonApiKey,
  version: "2018-04-05",
  url: "https://gateway.watsonplatform.net/natural-language-understanding/api/"
});

var contentOfPages = [];

var articles = [];
var article = {
  title: "",
  references: [],
  authors: [],
  institutions: [],
  terms: []
};

var pdfPath = "../nlp-javascrit/pdfs/118.pdf";
var tokenizer = new natural.WordTokenizer();
var tokenizerEndLine = new natural.RegexpTokenizer({ pattern: /\[[\d]+\]/ });
var Tfldf = natural.TfIdf;
var tfidf = new Tfldf();

var loadingTask = pdfjsLib.getDocument(pdfPath);
loadingTask.promise
  .then(function(doc) {
    var numPages = doc.numPages;
    console.log("# Documento carregador");
    console.log("Número de Páginas: " + numPages);
    console.log();

    var lastPromise;
    lastPromise = doc.getMetadata().then(function(data) {
      console.log("# Metadados carregados");
      console.log("## Info");
      console.log(JSON.stringify(data.info, null, 2));
      console.log();
      if (data.metadata) {
        console.log("## Metadado");
        console.log(JSON.stringify(data.metadata.getAll(), null, 2));
        console.log();
      }
    });

    var loadPage = function(pageNum) {
      return doc.getPage(pageNum).then(function(page) {
        return page
          .getTextContent()
          .then(function(content) {
            var strings = content.items.map(function(item) {
              console.log(item);
              return item.str.trim();
            });

            let contentOfPage = strings.join(" ").toUpperCase();
            //console.log(tokenizerEndLine.tokenize(contentOfPage));
            tfidf.addDocument(contentOfPage);
            contentOfPages.push(contentOfPage);
            //console.log(tokenizer.tokenize(contentOfPage));
          })
          .then(function() {
            console.log();
          });
      });
    };
    for (var i = 1; i <= numPages; i++) {
      lastPromise = lastPromise.then(loadPage.bind(null, i));
    }
    return lastPromise;
  })
  .then(
    function() {
      //fetchWatsonAndReturnKeywords(contentOfPages.join(" "));
      tfidf.tfidfs("EFERENCES", function(i, measure) {
        //console.log("documento #" + i + " is " + measure);
        if (measure > 0) {
        } //console.log(contentOfPages[i]);
      });
    },
    function(err) {
      console.error("Error: " + err);
    }
  );

async function fetchWatsonAndReturnKeywords(sentence) {
  return new Promise((resolve, reject) => {
    nlu.analyze(
      {
        text: sentence,
        features: {
          keywords: {}
        }
      },
      (error, response) => {
        if (error) {
          reject(error);
          return;
        }

        const keywords = response.keywords.map(keyword => {
          return keyword.text;
        });
        console.log(keywords);
        resolve(keywords);
      }
    );
  });
}
