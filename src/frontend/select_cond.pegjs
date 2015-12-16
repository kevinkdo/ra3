{
  function unit(column, oper, val) {
    return {
      column: column,
      oper: oper,
      val: val
    };
  }
}

start
  = WS* n:exp WS* { return n; }

exp
  = NOT WS* exp_unit
  / exp_unit WS* AND WS* exp_unit
  / exp_unit WS* OR WS* exp_unit
  / n:exp_unit { return n; }

exp_unit
  = s:COLUMN WS* EQUAL WS* v:val { return unit(s, "=", v); }
  / s:COLUMN WS* LT WS* v:val { return unit(s, "<", v); }
  / s:COLUMN WS* LE WS* v:val { return unit(s, "<=", v); }
  / s:COLUMN WS* GT WS* v:val { return unit(s, ">", v); }
  / s:COLUMN WS* GE WS* v:val { return unit(s, ">=", v); }
  / s:COLUMN WS* NE WS* v:val { return unit(s, "<>", v); }
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