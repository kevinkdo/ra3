var tab_options = ["\\project_{", "\\join", "\\select_{", "\\cross", "\\union", "\\diff", "\\intersect", "\\rename_{"];

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

var getSelectCondFunction = function(parsed_select_cond) {
  if (parsed_select_cond.oper == "=") {
    return function(tuple) { return tuple[parsed_select_cond.column] == parsed_select_cond.val };
  } else if (parsed_select_cond.oper == "<") {
    return function(tuple) { return [parsed_select_cond.column] < parsed_select_cond.val };
  } else if (parsed_select_cond.oper == ">") {
    return function(tuple) { return tuple[parsed_select_cond.column] > parsed_select_cond.val };
  } else if (parsed_select_cond.oper == "<=") {
    return function(tuple) { return tuple[parsed_select_cond.column] <= parsed_select_cond.val };
  } else if (parsed_select_cond.oper == ">=") {
    return function(tuple) { return tuple[parsed_select_cond.column] >= parsed_select_cond.val };
  } else if (parsed_select_cond.oper == "<>") {
    return function(tuple) { return tuple[parsed_select_cond.column] != parsed_select_cond.val };
  } else {
    isError = true;
    error_message = "Select condition contains unknown operator."
  }
};

var runQuery = function(query) {
  var ast = ra_parser.parse(query);
  return runAstNode(ast);
};

var runAstNode = function(node) {
  var isError = false;
  var tuples = [];
  var columns = [];
  var error_message = "";
  if (node.name == "\u03c3") { // select
    try {
      var child_result = runAstNode(node.children[0]);
      var parsed_select_cond = select_cond_parser.parse(node.subscript);
      if (child_result.isError) {
        isError = true;
        error_message = child_result .error_message;
      }
      else if (child_result.columns.indexOf(parsed_select_cond.column) == -1) {
        isError = true;
        error_message = "Column does not exist: " + parsed_select_cond.column;
      }
      else {
        columns = child_result.columns;
        tuples = child_result.tuples.filter(getSelectCondFunction(parsed_select_cond));
      }
    } catch (e) {
      isError = true;
      error_message = e.message;
    }
  } else if (node.name == "\u03C0") { // project
  } else if (node.name == "\u00d7") { // cross
  } else if (node.name == "\u22c8") { // join
  } else if (node.name == "\u222a") { // union
  } else if (node.name == "\u2212") { // diff
  } else if (node.name == "\u2229") { // intersection
  } else if (node.name == "\u03c1") { // rename
  } else { // table name
    if (beers.table_names.indexOf(node.name) > -1) {
      tuples = beers.tables[node.name].tuples;
      columns = beers.tables[node.name].columns;
    } else {
      isError = true;
      error_message = "Table does not exist";
    }
  }

  return {
    isError: isError,
    columns: columns,
    tuples: tuples,
    error: {
      message: error_message,
      start: 0,
      end: 0,
    }
  };
};