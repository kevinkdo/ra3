start
  = exp WS* STATEMENT_TERMINATOR

exp_unit
  = TABLE_NAME
  / LEFT_PAREN WS* exp1 WS* RIGHT_PAREN

exp_unary
  = exp_unit
  / SELECT OPERATOR_OPTION WS* exp_unary
  / PROJECT OPERATOR_OPTION WS* exp_unary
  / RENAME OPERATOR_OPTION WS* exp_unary

exp
  = exp_unary
  / exp_unary WS* JOIN OPERATOR_OPTION WS* exp_unary
  / exp_unary WS* JOIN WS* exp_unary
  / exp_unary WS* CROSS WS* exp_unary
  / exp_unary WS* UNION WS* exp_unary
  / exp_unary WS* DIFF WS* exp_unary
  / exp_unary WS* INTERSECT WS* exp_unary

exp1
  = exp
  / exp WS* JOIN OPERATOR_OPTION WS* exp_unary
  / exp WS* JOIN WS* exp_unary
  / exp WS* CROSS WS* exp_unary
  / exp WS* UNION WS* exp_unary
  / exp WS* DIFF WS* exp_unary
  / exp WS* INTERSECT WS* exp_unary

DIGIT = [0-9]
ALPHA = [a-zA-Z]+
WS = [ \t\r\n]

LEFT_PAREN = '('
RIGHT_PAREN = ')'
STATEMENT_TERMINATOR = ';'
TABLE_NAME = (ALPHA (ALPHA/DIGIT/'_')*)

SELECT = '\\select'
PROJECT = '\\project'
JOIN = '\\join'
CROSS = '\\cross'
UNION = '\\union'
DIFF = '\\diff'
INTERSECT = '\\intersect'
RENAME = '\\rename'

OPERATOR_OPTION = '_{' (INSIDE_OPERATOR_OPTION)* '}'
INSIDE_OPERATOR_OPTION = [^}\n\r]