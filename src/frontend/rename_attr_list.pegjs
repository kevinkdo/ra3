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
  = WS* l:exp WS* { return l; }

exp
  = c:COLUMN WS* COMMA WS* l:exp { l.unshift(c); return l; }
  / c:COLUMN { return [c]; }

attr = "TODO"
WS = [ \t\r\n]
COLUMN = s1:ALPHA s2:(ALPHA/DIGIT/'_')* { return s1 + s2.join(""); }
COMMA = ','
ALPHA = s:([a-zA-Z]+) { return s.join(""); }
DIGIT = s:[0-9] { return s; }