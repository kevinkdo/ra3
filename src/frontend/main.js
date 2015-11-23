// ===== Globals =====
var BACKSPACE = 8;
var ENTER = 13;
var TAB = 9;
var UP = 38;
var DOWN = 40;
var raCommands = ["project_{", "join", "select_{", "cross", "union", "diff", "intersect", "rename_{"];
var attributes = [];
var shortHelpMessage = "Welcome to RA3\nThis works very similarly to Jun Yang's Relational Algebra Interpreter. \n" 
                        + "type help --verbose for a list of commands";
var longHelpMessage = "Relational Algebra Expressions: \n"
                       +"\\select_{COND} EXP: selection over an expression \n"
                       +"\\project_{ATTR_LIST} EXP: projection of an expression \n"
                       +"EXP_1 \\join EXP_2: natural join between two expressions \n"
                       +"EXP_1 \\join_{COND} EXP_2: theta-join between two expressions \n"
                       +"EXP_1 \\cross EXP_2: cross-product between two expressions \n"
                       +"EXP_1 \\union EXP_2: union between two expressions \n"
                       +"EXP_1 \\diff EXP_2: difference between two expressions \n"
                       +"EXP_1 \\intersect EXP_2: intersection between two expressions \n"
                       +"\\rename_{NEW_ATTR_NAME_LIST} EXP: rename all attributes of an expression"; 
var subquerySuccess = "subquery succesfully stored";
var subqueryFailure = "cannot define subquery using other subqueries";

var nodeId = 100;

function getDefaultCommandData() {
  return [
    {
      query: "Type help for instructions, type help --verbose for list of commands",
      result: ""
    }
  ];
}

function scrollDown() {
  document.getElementById('leftpane').scrollTop = document.getElementById('leftpane').scrollHeight;
}

function subscriptable(str) {
  return str == "\u03c3" || str == "\u03C0" || str == "\u22c8" || str == "\u03c1";
}

function subscriptRequired(str) {
  return str == "\u03c3" || str == "\u03C0" || str == "\u03c1";
}

function numChildren(str) {
  if (str == "\u03c3" || str == "\u03C0" || str == "\u03c1") {
    return 1;
  } else {
    return 2;
  }
}

// ===== React render statements =====
var terminal = React.render(
  <TerminalEmulator />,
  document.getElementById('leftpane')
);

React.render(
  <RaTree setTerminalInput={terminal.setInput} />,
  document.getElementById('rightpane')
);
