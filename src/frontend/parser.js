var grammar;
var parser;
var request = new XMLHttpRequest();
request.open('GET', 'ra.pegjs');
request.onreadystatechange = function() {
    if (request.readyState == 4 && request.status == 200) {
      grammar = request.responseText;
      parser = PEG.buildParser(grammar);
      console.log("ready");
    }
};
request.send();