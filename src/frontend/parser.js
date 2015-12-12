var input = "\\select_{name='Bill'} hi;";

var grammar;
var request = new XMLHttpRequest();
request.open('GET', 'ra.pegjs');
request.onreadystatechange = function() {
    if (request.readyState == 4 && request.status == 200) {
      grammar = request.responseText;
      var parser = PEG.buildParser(grammar);
      console.log(parser.parse(input));
    }
};
request.send();