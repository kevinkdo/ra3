import { Globals } from "./globals.tsx";

var tab_options = ["\\project_{", "\\join", "\\select_{", "\\cross", "\\union", "\\diff", "\\intersect", "\\rename_{"];
var ra_parser = require("!pegjs!./ra.pegjs");
var select_cond_parser = require("!pegjs!./select_cond.pegjs");
var attr_list_parser = require("!pegjs!./attr_list.pegjs");

export interface Tuple {
  name: string,
  [propName: string]: string | number
}

export interface Table {
  columns: Array<string>,
  tuples: Array<Tuple>
}

export interface Database {
  table_names: Array<string>,
  tables: { [s:string]: Table; }
}

export interface ASTNode {
  name: string,
  subscript: string,
  children: Array<ASTNode>
}

export interface ASTRunResult {
  isError: boolean,
  columns: Array<string>,
  tuples: Array<Tuple>,
  error_message: string
}

var beers: Database;
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

export function runQuery(query: string): ASTRunResult {
  try {
    var ast = ra_parser.parse(query);
  } catch (e) {
    return {
      isError: true,
      error_message: e.message,
      columns: [],
      tuples: []
    }
  }
  return runAstNode(ast);
};

var runAstNode = function(node: ASTNode): ASTRunResult {
  var result_isError = false;
  var result_tuples: Array<Tuple> = [];
  var result_columns: Array<string> = [];
  var result_error_message = "";
  if (node.name == "\u03c3") { // select
    try {
      var parsed_select_cond = select_cond_parser.parse(node.subscript);
    } catch (e) {
      result_isError = true;
      result_error_message = "Bad \\select condition: " + e.message;
    }

    if (!result_isError) {
      var child_result = runAstNode(node.children[0]);
      if (child_result.isError) {
        result_isError = true;
        result_error_message = child_result.error_message;
      }
    }

    if (!result_isError) {
      parsed_select_cond.columns.forEach(function(column: string) {
        if (child_result.columns.indexOf(column) == -1) {
          result_isError = true;
          result_error_message = "Column does not exist: " + column;
        }
      });
    }

    if (!result_isError) {
      result_columns = child_result.columns;
      result_tuples = child_result.tuples.filter(parsed_select_cond.select_func);
    }
  } else if (node.name == "\u03C0") { // project
    try {
      var new_columns = attr_list_parser.parse(node.subscript);
    } catch (e) {
      result_isError = true;
      result_error_message = "Bad project attribute list: " + e.message;
    }

    if (!result_isError) {
      var child_result = runAstNode(node.children[0]);
      if (child_result.isError) {
        result_isError = true;
        result_error_message = child_result.error_message;
      }
    }

    if (!result_isError) {
      var column_set: {[s:string]: boolean} = {};
      new_columns.forEach(function(new_column: string) {
        if (new_column in column_set) {
          result_isError = true;
          result_error_message = "\\project contains duplicate columns: " + new_column;
        } else {
          column_set[new_column] = true;
        }
      });
    }

    if (!result_isError) {
      new_columns.forEach(function(column: string) {
        if (child_result.columns.indexOf(column) == -1) {
          result_isError = true;
          result_error_message = "Column does not exist: " + column;
        }
      });
    }

    if (!result_isError) {
      result_columns = new_columns;
      result_tuples = child_result.tuples.map(function(old_tuple:Tuple) {
        var new_tuple:Tuple = {name: ""};
        for (var i = 0; i < new_columns.length; i++) {
          new_tuple[new_columns[i]] = old_tuple[new_columns[i]];
        }
        return new_tuple;
      });
      result_tuples = deduplicate_tuples(result_columns, result_tuples);
    }
  } else if (node.name == "\u00d7") { // cross
    var child_result0 = runAstNode(node.children[0]);
    var child_result1 = runAstNode(node.children[1]);
    if (child_result0.isError || child_result1.isError) {
      result_isError = true;
      result_error_message = child_result0.isError ?
        child_result0.error_message : child_result1.error_message;
    }

    if (!result_isError) {
      var column_set: { [s: string]: boolean } = {};
      result_columns = child_result0.columns.concat(child_result1.columns);
      result_columns.forEach(function(column) {
        if (column in column_set) {
          result_isError = true;
          result_error_message = "\\cross contains duplicate columns: " + column;
        } else {
          column_set[column] = true;
        }
      });
    }

    if (!result_isError) {
      child_result0.tuples.forEach(function(tuple0) {
        child_result1.tuples.forEach(function(tuple1) {
          var new_tuple: Tuple = { name: "" };
          child_result0.columns.forEach(function(column) {
            new_tuple[column] = tuple0[column];
          });
          child_result1.columns.forEach(function(column) {
            new_tuple[column] = tuple1[column];
          });
          result_tuples.push(new_tuple);
        })
      });
    }
  } else if (node.name == "\u22c8" && node.subscript.length == 0) { // natural join
    var child_result0 = runAstNode(node.children[0]);
    var child_result1 = runAstNode(node.children[1]);
    if (child_result0.isError || child_result1.isError) {
      result_isError = true;
      result_error_message = child_result0.isError ?
        child_result0.error_message : child_result1.error_message;
    }

    var common_columns: Array<string> = [];
    if (!result_isError) {
      var column_set: { [s: string]: boolean } = {};
      result_columns = child_result0.columns.concat(child_result1.columns);
      result_columns.forEach(function(column) {
        if (column in column_set) {
          common_columns.push(column);
        }
        column_set[column] = true;
      });
    }

    var left_only_columns = child_result0.columns.filter(function(column) {
      return !Globals.arrayContains(common_columns, column);
    });
    var right_only_columns = child_result1.columns.filter(function(column) {
      return !Globals.arrayContains(common_columns, column);
    });
    result_columns = common_columns.concat(left_only_columns).concat(right_only_columns);

    if (!result_isError) {
      child_result0.tuples.forEach(function(tuple0) {
        child_result1.tuples.forEach(function(tuple1) {
          var new_tuple: Tuple = { name: "" };
          child_result0.columns.forEach(function(column) {
            new_tuple[column] = tuple0[column];
          });
          child_result1.columns.forEach(function(column) {
            new_tuple[column] = tuple1[column];
          });

          var is_valid_join_tuple = true;
          common_columns.forEach(function(common_column) {
            if (tuple0[common_column] != tuple1[common_column]) {
              is_valid_join_tuple = false;
            }
          });
          if (is_valid_join_tuple) {
            result_tuples.push(new_tuple);
          }
        })
      });
    }
  } else if (node.name == "\u22c8" && node.subscript.length > 0) { // theta join
    var child_result0 = runAstNode(node.children[0]);
    var child_result1 = runAstNode(node.children[1]);
    try {
      var parsed_select_cond = select_cond_parser.parse(node.subscript);
    } catch (e) {
      result_isError = true;
      result_error_message = "Bad \\join condition: " + e.message;
    }

    if (!result_isError) {
      if (child_result0.isError || child_result1.isError) {
        result_isError = true;
        result_error_message = child_result0.isError ?
          child_result0.error_message : child_result1.error_message;
      }
    }

    if (!result_isError) {
      var column_set: { [s: string]: boolean } = {};
      result_columns = child_result0.columns.concat(child_result1.columns);
      result_columns.forEach(function(column) {
        if (column in column_set) {
          result_isError = true;
          result_error_message = "Subscripted \\join may not contain duplicate columns: " + column;
        } else {
          column_set[column] = true;
        }
      });
    }

    if (!result_isError) {
      child_result0.tuples.forEach(function(tuple0) {
        child_result1.tuples.forEach(function(tuple1) {
          var new_tuple:Tuple = {name: ""};
          child_result0.columns.forEach(function(column) {
            new_tuple[column] = tuple0[column];
          });
          child_result1.columns.forEach(function(column) {
            new_tuple[column] = tuple1[column];
          });
          result_tuples.push(new_tuple);
        })
      });
      result_tuples = result_tuples.filter(parsed_select_cond.select_func);
    }
  } else if (node.name == "\u222a") { // union
    var child_result0 = runAstNode(node.children[0]);
    var child_result1 = runAstNode(node.children[1]);
    var done = false;
    if (child_result0.isError || child_result1.isError) {
      result_isError = true;
      result_error_message = child_result0.isError ?
        child_result0.error_message : child_result1.error_message;
    }

    if (!result_isError) {
      if (child_result0.columns.length !== child_result1.columns.length) {
        result_isError = true;
        result_error_message = "Can't union tuples with different number of columns";
      }
    }

    if (child_result0.tuples.length === 0) {
      result_columns = child_result1.columns;
      result_tuples = child_result1.tuples;
      done = true;
    }

    if (child_result1.tuples.length === 0) {
      result_columns = child_result0.columns;
      result_tuples = child_result0.tuples;
      done = true;
    }

    if (!done && !result_isError) {
      for (var i = 0; i < child_result0.columns.length; i++) {
        var type0 = typeof child_result0.tuples[0][child_result0.columns[i]];
        var type1 = typeof child_result1.tuples[0][child_result1.columns[i]];
        if (type0 !== type1) {
          result_isError = true;
          result_error_message = "Children of \\union have different types: " + type0 + ", " + type1;
        }
      }
    }

    if (!done && !result_isError) {
      result_columns = child_result0.columns;
      var renamed_child1_tuples = child_result1.tuples.map(function(tuple) {
        var new_tuple: Tuple = { name: "" };
        for (var i = 0; i < result_columns.length; i++) {
          new_tuple[result_columns[i]] = tuple[child_result1.columns[i]];
        }
        return new_tuple;
      });
      result_tuples = deduplicate_tuples(result_columns, child_result0.tuples.concat(renamed_child1_tuples));
    }
  } else if (node.name == "\u2212") { // diff
    var child_result0 = runAstNode(node.children[0]);
    var child_result1 = runAstNode(node.children[1]);
    var done = false;
    if (child_result0.isError || child_result1.isError) {
      result_isError = true;
      result_error_message = child_result0.isError ?
        child_result0.error_message : child_result1.error_message;
    }

    if (!result_isError) {
      if (child_result0.columns.length !== child_result1.columns.length) {
        result_isError = true;
        result_error_message = "Can't diff tuples with different number of columns";
      }
    }

    if (child_result0.tuples.length === 0) {
      result_columns = child_result0.columns;
      result_tuples = [];
      done = true;
    }

    if (child_result1.tuples.length === 0) {
      result_columns = child_result0.columns;
      result_tuples = child_result0.tuples;
      done = true;
    }

    if (!done && !result_isError) {
      for (var i = 0; i < child_result0.columns.length; i++) {
        var type0 = typeof child_result0.tuples[0][child_result0.columns[i]];
        var type1 = typeof child_result1.tuples[0][child_result1.columns[i]];
        if (type0 !== type1) {
          result_isError = true;
          result_error_message = "Children of \\diff have different types: " + type0 + ", " + type1;
        }
      }
    }

    if (result_columns.length === 0 && !result_isError) {
      result_columns = child_result0.columns;
      var renamed_child1_tuples = child_result1.tuples.map(function(tuple) {
      var new_tuple: Tuple = { name: "" };
        for (var i = 0; i < result_columns.length; i++) {
          new_tuple[result_columns[i]] = tuple[child_result1.columns[i]];
        }
        return new_tuple;
      });

      child_result0.tuples.forEach(function(tuple0) {
        var duplicate = renamed_child1_tuples.some(function(tuple1) {
          return child_result0.columns.every(function(column) {
            return (tuple0[column] === tuple1[column]);
          });
        });
        if (!duplicate) {
          result_tuples.push(tuple0);
        }
      });
    }
  } else if (node.name == "\u2229") { // intersection
    var child_result0 = runAstNode(node.children[0]);
    var child_result1 = runAstNode(node.children[1]);
    var done = false;
    if (child_result0.isError || child_result1.isError) {
      result_isError = true;
      result_error_message = child_result0.isError ?
        child_result0.error_message : child_result1.error_message;
    }

    if (!result_isError) {
      if (child_result0.columns.length !== child_result1.columns.length) {
        result_isError = true;
        result_error_message = "Can't intersect tuples with different number of columns";
      }
    }

    if (child_result0.tuples.length === 0) {
      result_columns = child_result0.columns;
      result_tuples = [];
      done = true;
    }

    if (child_result1.tuples.length === 0) {
      result_columns = child_result0.columns;
      result_tuples = [];
      done = true;
    }

    if (!done && !result_isError) {
      for (var i = 0; i < child_result0.columns.length; i++) {
        var type0 = typeof child_result0.tuples[0][child_result0.columns[i]];
        var type1 = typeof child_result1.tuples[0][child_result1.columns[i]];
        if (type0 !== type1) {
          result_isError = true;
          result_error_message = "Children of \\intersect have different types: " + type0 + ", " + type1;
        }
      }
    }

    if (result_columns.length === 0 && !result_isError) {
      result_columns = child_result0.columns;
      var renamed_child1_tuples = child_result1.tuples.map(function(tuple) {
          var new_tuple: Tuple = { name: "" };
        for (var i = 0; i < result_columns.length; i++) {
          new_tuple[result_columns[i]] = tuple[child_result1.columns[i]];
        }
        return new_tuple;
      });

      child_result0.tuples.forEach(function(tuple0) {
        var duplicate = renamed_child1_tuples.some(function(tuple1) {
          return child_result0.columns.every(function(column) {
            return (tuple0[column] === tuple1[column]);
          });
        });
        if (duplicate) {
          result_tuples.push(tuple0);
        }
      });
    }
  } else if (node.name == "\u03c1") { // rename
    try {
      var new_columns = attr_list_parser.parse(node.subscript);
    } catch (e) {
      result_isError = true;
      result_error_message = "Bad rename attribute list: " + e.message;
    }

    if (!result_isError) {
      var child_result = runAstNode(node.children[0]);
      if (child_result.isError) {
        result_isError = true;
        result_error_message = child_result.error_message;
      }
    }

    if (!result_isError) {
      var old_columns = child_result.columns;
      if (old_columns.length !== new_columns.length) {
        result_isError = true;
        result_error_message = "\\rename contains the wrong number of columns";
      }
    }

    if (!result_isError) {
      var column_set: { [s: string]: boolean } = {};
      new_columns.forEach(function(new_column: string) {
        if (new_column in column_set) {
          result_isError = true;
          result_error_message = "\\rename contains duplicate columns: " + new_column;
        } else {
          column_set[new_column] = true;
        }
      });
    }

    if (!result_isError) {
      result_columns = new_columns;
      result_tuples = child_result.tuples.map(function(old_tuple) {
          var new_tuple: Tuple = { name: "" };
        for (var i = 0; i < new_columns.length; i++) {
          new_tuple[new_columns[i]] = old_tuple[old_columns[i]];
        }
        return new_tuple;
      });
    }
  } else { // table name
    if (beers.table_names.indexOf(node.name) > -1) {
      result_tuples = beers.tables[node.name].tuples;
      result_columns = beers.tables[node.name].columns;
    } else {
      result_isError = true;
      result_error_message = "Table does not exist: " + node.name;
    }
  }

  return {
    isError: result_isError,
    columns: result_columns,
    tuples: result_tuples,
    error_message: result_error_message
  };
};

var deduplicate_tuples = function(columns: Array<string>, old_tuples: Array<Tuple>) {
  var new_tuples: Array<Tuple> = [];
  old_tuples.forEach(function(old_tuple: Tuple) {
    var duplicate = new_tuples.some(function(new_tuple) {
      return columns.every(function(column: string) {
        return (new_tuple[column] === old_tuple[column]);
      });
    });
    if (!duplicate) {
      new_tuples.push(old_tuple);
    }
  });
  return new_tuples;
};