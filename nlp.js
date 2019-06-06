var pdfjsLib = require("pdfjs-dist");

var pdfPath = "../nlp-javascrit/pdfs/13.pdf";

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
        console.log("# Página " + pageNum);
        var viewport = page.getViewport({ scale: 1.0 });
        console.log("Tamanho: " + viewport.width + "x" + viewport.height);
        console.log();
        return page
          .getTextContent()
          .then(function(content) {
            var strings = content.items.map(function(item) {
              return item.str;
            });
            console.log("## Conteúdo do texto");
            console.log(strings.join(" "));
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
      console.log("# fim do documento");
    },
    function(err) {
      console.error("Error: " + err);
    }
  );
