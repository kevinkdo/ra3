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

var runQuery = function(query) {
  try {
    var ast = ra_parser.parse(query);
  } catch (e) {
    return {
      isError: true,
      error_message: e.message
    }
  }
  return runAstNode(ast);
};

var runAstNode = function(node) {
  var isError = false;
  var tuples = [];
  var columns = [];
  var error_message = "";
  if (node.name == "\u03c3") { // select
    try {
      var parsed_select_cond = select_cond_parser.parse(node.subscript);
    } catch (e) {
      isError = true;
      error_message = "Bad \\select condition: " + e.message;
    }

    if (!isError) {
      var child_result = runAstNode(node.children[0]);
      if (child_result.isError) {
        isError = true;
        error_message = child_result.error_message;
      }
    }

    if (!isError) {
      parsed_select_cond.columns.forEach(function(column) {
        if (child_result.columns.indexOf(column) == -1) {
          isError = true;
          error_message = "Column does not exist: " + column;
        }
      });
    }

    if (!isError) {
      columns = child_result.columns;
      tuples = child_result.tuples.filter(parsed_select_cond.select_func);
    }
  } else if (node.name == "\u03C0") { // project
  } else if (node.name == "\u00d7") { // cross
  } else if (node.name == "\u22c8") { // join
  } else if (node.name == "\u222a") { // union
  } else if (node.name == "\u2212") { // diff
  } else if (node.name == "\u2229") { // intersection
  } else if (node.name == "\u03c1") { // rename
    try {
      var new_columns = rename_attr_list_parser.parse(node.subscript);
    } catch (e) {
      isError = true;
      error_message = "Bad rename attribute list: " + e.message;
    }

    if (!isError) {
      var child_result = runAstNode(node.children[0]);
      if (child_result.isError) {
        isError = true;
        error_message = child_result.error_message;
      }
    }

    if (!isError) {
      var old_columns = child_result.columns;
      if (old_columns.length !== new_columns.length) {
        isError = true;
        error_message = "\\rename contains the wrong number of columns";
      }
    }

    if (!isError) {
      var column_set = {};
      new_columns.forEach(function(new_column) {
        if (new_column in column_set) {
          isError = true;
          error_message = "\\rename contains duplicate columns: " + new_column;
        } else {
          column_set[new_column] = true;
        }
      });
    }

    if (!isError) {
      columns = new_columns;
      tuples = child_result.tuples.map(function(old_tuple) {
        var new_tuple = {};
        for (var i = 0; i < new_columns.length; i++) {
          new_tuple[new_columns[i]] = old_tuple[old_columns[i]];
        }
        return new_tuple;
      });
    }
  } else { // table name
    if (beers.table_names.indexOf(node.name) > -1) {
      tuples = beers.tables[node.name].tuples;
      columns = beers.tables[node.name].columns;
    } else {
      isError = true;
      error_message = "Table does not exist: " + node.name;
    }
  }

  return {
    isError: isError,
    columns: columns,
    tuples: tuples,
    error_message: error_message
  };
};