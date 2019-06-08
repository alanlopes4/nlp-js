function loadJSON(filename) {
  clearScreen();
  sigma.parsers.json(filename, {
    container: "sigma-container",
    settings: {
      defaultNodeColor: "#ec5148"
    }
  });
}

function clearScreen() {
  document.getElementById("sigma-container").innerHTML = "";
}
