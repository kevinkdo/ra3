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
  = WS* n:exp WS* STATEMENT_TERMINATOR WS* { return n; }

exp
  = n1:exp_unit WS* JOIN s:OPERATOR_OPTION WS* n2:exp_unit { return astNode("\u22c8", s, [n1, n2]); }
  / n1:exp_unit WS* JOIN WS* n2:exp_unit { return astNode("\u22c8", "", [n1, n2]); }
  / n1:exp_unit WS* CROSS WS* n2:exp_unit { return astNode("\u00d7", "", [n1, n2]); }
  / n1:exp_unit WS* UNION WS* n2:exp_unit { return astNode("\u222a", "", [n1, n2]); }
  / n1:exp_unit WS* DIFF WS* n2:exp_unit { return astNode("\u2212", "", [n1, n2]); }
  / n1:exp_unit WS* INTERSECT WS* n2:exp_unit { return astNode("\u2229", "", [n1, n2]); }
  / n:exp_unit { return n; }

exp_unit
  = SELECT s:OPERATOR_OPTION WS* n:exp_unit { return astNode("\u03c3", s, [n]); }
  / PROJECT s:OPERATOR_OPTION WS* n:exp_unit { return astNode("\u03C0", s, [n]); }
  / RENAME s:OPERATOR_OPTION WS* n:exp_unit { return astNode("\u03c1", s, [n]); }
  / LEFT_PAREN WS* n:exp WS* RIGHT_PAREN { return n; }
  / n:TABLE_NAME { return n; }

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