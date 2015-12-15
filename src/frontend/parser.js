var tab_options = ["\\project_{", "\\join", "\\select_{", "\\cross", "\\union", "\\diff", "\\intersect", "\\rename_{"];

var grammar;
var parser;
var request = new XMLHttpRequest();
request.open('GET', 'ra.pegjs');
request.onreadystatechange = function() {
    if (request.readyState == 4 && request.status == 200) {
      grammar = request.responseText;
      parser = PEG.buildParser(grammar);
    }
};
request.send();

var beers;
var request2 = new XMLHttpRequest();
request2.open('GET', 'beers.json');
request2.onreadystatechange = function() {
    if (request2.readyState == 4 && request2.status == 200) {
        beers = JSON.parse(request2.responseText);

        beers.table_names.forEach(function(table) {
            tab_options.push(table);
            beers.tables[table].columns.forEach(function(column) {
                tab_options.push(column);
            })
        });
    }
};
request2.send();

var runQuery = function(query) {
    var ast = parser.parse(query);
    return runAstNode(ast);
};

var runAstNode = function(node) {
    var tuples = [];
    var columns;
    if (node.name == "\u03c3") { // select
    } else if (node.name == "\u03C0") { // project
        var table = beers[node.name];
    } else if (node.name == "\u00d7") { // cross
    } else if (node.name == "\u22c8") { // join
    } else if (node.name == "\u222a") { // union
    } else if (node.name == "\u2212") { // diff
    } else if (node.name == "\u2229") { // intersection
    } else if (node.name == "\u03c1") { // rename
    } else { // table name
        tuples = beers.tables[node.name].tuples;
        columns = beers.tables[node.name].columns;
    }

    return {
        isError: false,
        columns: columns,
        tuples: tuples
    };
};