start
  = WS* l:exp WS* { return l; }

exp
  = c:COLUMN WS* COMMA WS* l:exp { l.unshift(c); return l; }
  / c:COLUMN { return [c]; }

COLUMN = s1:ALPHA l1:(ALPHA/DIGIT/'_')* { return (s1 + l1.join("")).toLowerCase(); }
COMMA = ','
DIGIT = [0-9]
ALPHA = [a-zA-Z]
WS = [ \t\r\n]