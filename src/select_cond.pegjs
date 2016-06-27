{
  function getEQvalSelectFunc(column, v) {
    return function(tuple) {
      return tuple[column] == v;
    };
  }

  function getLTvalSelectFunc(column, v) {
    return function(tuple) {
      return tuple[column] < v;
    };
  }

  function getLEvalSelectFunc(column, v) {
    return function(tuple) {
      return tuple[column] <= v;
    };
  }

  function getGTvalSelectFunc(column, v) {
    return function(tuple) {
      return tuple[column] > v;
    };
  }

  function getGEvalSelectFunc(column, v) {
    return function(tuple) {
      return tuple[column] >= v;
    };
  }

  function getNEvalSelectFunc(column, v) {
    return function(tuple) {
      return tuple[column] != v;
    };
  }

  function getEQcolSelectFunc(column1, column2) {
    return function(tuple) {
      return tuple[column1] == tuple[column2];
    };
  }

  function getLTcolSelectFunc(column1, column2) {
    return function(tuple) {
      return tuple[column1] < tuple[column2];
    };
  }

  function getLEcolSelectFunc(column1, column2) {
    return function(tuple) {
      return tuple[column1] <= tuple[column2];
    };
  }

  function getGTcolSelectFunc(column1, column2) {
    return function(tuple) {
      return tuple[column1] > tuple[column2];
    };
  }

  function getGEcolSelectFunc(column1, column2) {
    return function(tuple) {
      return tuple[column1] >= tuple[column2];
    };
  }

  function getNEcolSelectFunc(column1, column2) {
    return function(tuple) {
      return tuple[column1] != tuple[column2];
    };
  }

  function getNotSelectFunc(selectFunc) {
    return function(tuple) {
      return !selectFunc(tuple);
    };
  }

  function getAndSelectFunc(selectFunc1, selectFunc2) {
    return function(tuple) {
      return selectFunc1(tuple) && selectFunc2(tuple);
    };
  }

  function getOrSelectFunc(selectFunc1, selectFunc2) {
    return function(tuple) {
      return selectFunc1(tuple) || selectFunc2(tuple);
    };
  }
}

start
  = WS* n:exp WS* { return n; }

exp
  = NOT WS* n1:exp_unit { return {columns:n1.columns, select_func: getNotSelectFunc(n1.select_func)}; }
  / n1:exp_unit WS* AND WS* n2:exp_unit { return {columns:n1.columns.concat(n2.columns), select_func: getAndSelectFunc(n1.select_func, n2.select_func)}; }
  / n1:exp_unit WS* OR WS* n2:exp_unit { return {columns:n1.columns.concat(n2.columns), select_func: getOrSelectFunc(n1.select_func, n2.select_func)}; }
  / n:exp_unit { return n; }

exp_unit
  = s:COLUMN WS* EQ WS* v:val { return {columns:[s], select_func: getEQvalSelectFunc(s, v)}; }
  / s:COLUMN WS* LT WS* v:val { return {columns:[s], select_func: getLTvalSelectFunc(s, v)}; }
  / s:COLUMN WS* LE WS* v:val { return {columns:[s], select_func: getLEvalSelectFunc(s, v)}; }
  / s:COLUMN WS* GT WS* v:val { return {columns:[s], select_func: getGTvalSelectFunc(s, v)}; }
  / s:COLUMN WS* GE WS* v:val { return {columns:[s], select_func: getGEvalSelectFunc(s, v)}; }
  / s:COLUMN WS* NE WS* v:val { return {columns:[s], select_func: getNEvalSelectFunc(s, v)}; }
  / s1:COLUMN WS* EQ WS* s2:COLUMN { return {columns:[s1, s2], select_func: getEQcolSelectFunc(s1, s2)}; }
  / s1:COLUMN WS* LT WS* s2:COLUMN { return {columns:[s1, s2], select_func: getLTcolSelectFunc(s1, s2)}; }
  / s1:COLUMN WS* LE WS* s2:COLUMN { return {columns:[s1, s2], select_func: getLEcolSelectFunc(s1, s2)}; }
  / s1:COLUMN WS* GT WS* s2:COLUMN { return {columns:[s1, s2], select_func: getGTcolSelectFunc(s1, s2)}; }
  / s1:COLUMN WS* GE WS* s2:COLUMN { return {columns:[s1, s2], select_func: getGEcolSelectFunc(s1, s2)}; }
  / s1:COLUMN WS* NE WS* s2:COLUMN { return {columns:[s1, s2], select_func: getNEcolSelectFunc(s1, s2)}; }
  / LEFT_PAREN WS* n:exp WS* RIGHT_PAREN { return n; }

val
  = QUOTE s:INSIDE_QUOTE QUOTE { return s; }
  / f:FLOAT { return f; }
  / i:INT { return i; }

DIGIT = [0-9]
ALPHA = [a-zA-Z]
WS = [ \t\r\n]

INT = l:[0-9]+ { return parseInt(l.join(""), 10); }
FLOAT = l1:(DIGIT*) s1:'.' l2:(DIGIT*) { return parseFloat(s1.join("") + s1 + l2.join("")); }
COLUMN = s1:ALPHA l1:(ALPHA/DIGIT/'_')* { return (s1 + l1.join("")).toLowerCase(); }
INSIDE_QUOTE = l:([^'])+ { return l.join(""); }

LEFT_PAREN = '('
RIGHT_PAREN = ')'
QUOTE = '\''
AND = 'and'i
OR = 'or'i
NOT = 'not'i
EQ = '='
LT = '<'
LE = '<='
GT = '>'
GE = '>='
NE = '<>'