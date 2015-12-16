{
  function getEQSelectFunc(column, v) {
    return function(tuple) {
      return tuple[column] == v;
    };
  }

  function getLTSelectFunc(column, v) {
    return function(tuple) {
      return tuple[column] < v;
    };
  }

  function getLESelectFunc(column, v) {
    return function(tuple) {
      return tuple[column] <= v;
    };
  }

  function getGTSelectFunc(column, v) {
    return function(tuple) {
      return tuple[column] > v;
    };
  }

  function getGESelectFunc(column, v) {
    return function(tuple) {
      return tuple[column] >= v;
    };
  }

  function getNESelectFunc(column, v) {
    return function(tuple) {
      return tuple[column] != v;
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
  = s:COLUMN WS* EQUAL WS* v:val { return {columns:[s], select_func: getEQSelectFunc(s, v)}; }
  / s:COLUMN WS* LT WS* v:val { return {columns:[s], select_func: getLTSelectFunc(s, v)}; }
  / s:COLUMN WS* LE WS* v:val { return {columns:[s], select_func: getLESelectFunc(s, v)}; }
  / s:COLUMN WS* GT WS* v:val { return {columns:[s], select_func: getGTSelectFunc(s, v)}; }
  / s:COLUMN WS* GE WS* v:val { return {columns:[s], select_func: getGESelectFunc(s, v)}; }
  / s:COLUMN WS* NE WS* v:val { return {columns:[s], select_func: getNESelectFunc(s, v)}; }
  / LEFT_PAREN WS* n:exp WS* RIGHT_PAREN { return n; }

val
  = QUOTE s:INSIDE_QUOTE QUOTE { return s; }
  / f:FLOAT { return f; }
  / i:INT { return i; }

DIGIT = s:[0-9] { return s; }
INT = s:[0-9]+ { return parseInt(s.join(""), 10); }
FLOAT = s1:(DIGIT*) s2:'.' s3:(DIGIT*) { return parseFloat(s1.join("") + s2 + s3.join("")); }
ALPHA = s:([a-zA-Z]+) { return s.join(""); }
COLUMN = s1:ALPHA s2:(ALPHA/DIGIT/'_')* { return s1 + s2.join(""); }
INSIDE_QUOTE = s:([^'])+ { return s.join(""); }

WS = [ \t\r\n]
LEFT_PAREN = '('
RIGHT_PAREN = ')'
QUOTE = '\''
AND = 'and'
OR = 'or'
NOT = 'not'
EQUAL = '='
LT = '<'
LE = '<='
GT = '>'
GE = '>='
NE = '<>'