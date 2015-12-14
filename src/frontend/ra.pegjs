{
  function astNode(name, subscript, children) {
    return {
      name: name,
      subscript: subscript,
      children: children
    };
  }
}

start
  = n:exp WS* STATEMENT_TERMINATOR { return n; }

exp
  = n:exp_unary { return n; }
  / n1:exp_unary WS* JOIN s:OPERATOR_OPTION WS* n2:exp_unary { return astNode("\u22c8", s, [n1, n2]); }
  / n1:exp_unary WS* JOIN WS* n2:exp_unary { return astNode("\u22c8", "", [n1, n2]); }
  / n1:exp_unary WS* CROSS WS* n2:exp_unary { return astNode("\u00d7", "", [n1, n2]); }
  / n1:exp_unary WS* UNION WS* n2:exp_unary { return astNode("\u222a", "", [n1, n2]); }
  / n1:exp_unary WS* DIFF WS* n2:exp_unary { return astNode("\u2212", "", [n1, n2]); }
  / n1:exp_unary WS* INTERSECT WS* n2:exp_unary { return astNode("\u2229", "", [n1, n2]); }

exp_unary
  = n:exp_unit { return n; }
  / SELECT s:OPERATOR_OPTION WS* n:exp_unary { return astNode("\u03c3", s, [n]); }
  / PROJECT s:OPERATOR_OPTION WS* n:exp_unary { return astNode("\u03c3", s, [n]); }
  / RENAME s:OPERATOR_OPTION WS* n:exp_unary { return astNode("\u03c3", s, [n]); }

exp_unit
  = n:TABLE_NAME { return n; }
  / LEFT_PAREN WS* n:exp1 WS* RIGHT_PAREN { return n; }

exp1
  = n:exp { return n; }
  / n1:exp WS* JOIN OPERATOR_OPTION WS* n2:exp_unary { return astNode("\u22c8", s, [n1, n2]); }
  / n1:exp WS* JOIN WS* n2:exp_unary { return astNode("\u22c8", "", [n1, n2]); }
  / n1:exp WS* CROSS WS* n2:exp_unary { return astNode("\u00d7", "", [n1, n2]); }
  / n1:exp WS* UNION WS* n2:exp_unary { return astNode("\u222a", "", [n1, n2]); }
  / n1:exp WS* DIFF WS* n2:exp_unary { return astNode("\u2212", "", [n1, n2]); }
  / n1:exp WS* INTERSECT WS* n2:exp_unary { return astNode("\u2229", "", [n1, n2]); }

DIGIT = [0-9]
ALPHA = s:([a-zA-Z]+) { return s.join(""); }
WS = [ \t\r\n]

LEFT_PAREN = '('
RIGHT_PAREN = ')'
STATEMENT_TERMINATOR = ';'

TABLE_NAME = s:(ALPHA (ALPHA/DIGIT/'_')*) { return astNode(s.join(""), "", []); }

SELECT = '\\select'
PROJECT = '\\project'
JOIN = '\\join'
CROSS = '\\cross'
UNION = '\\union'
DIFF = '\\diff'
INTERSECT = '\\intersect'
RENAME = '\\rename'

OPERATOR_OPTION = '_{' s:((INSIDE_OPERATOR_OPTION)*) '}' { return s.join(""); }
INSIDE_OPERATOR_OPTION = s:([^}\n\r]) { return s; }