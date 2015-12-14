// ===== Globals =====
var BACKSPACE = 8;
var ENTER = 13;
var TAB = 9;
var UP = 38;
var DOWN = 40;
var raCommands = ["project_{", "join", "select_{", "cross", "union", "diff", "intersect", "rename_{"];
var attributes = [];
var SHORT_HELP_MESSAGE = "Welcome to RA3\nThis works very similarly to Jun Yang's Relational Algebra Interpreter.\n" 
                        + "'help --verbose' for a list of commands";
var LONG_HELP_MESSAGE = "Relational Algebra Expressions: \n"
                       + "\\select_{COND} EXP: selection over an expression \n"
                       + "\\project_{ATTR_LIST} EXP: projection of an expression \n"
                       + "EXP_1 \\join EXP_2: natural join between two expressions \n"
                       + "EXP_1 \\join_{COND} EXP_2: theta-join between two expressions \n"
                       + "EXP_1 \\cross EXP_2: cross-product between two expressions \n"
                       + "EXP_1 \\union EXP_2: union between two expressions \n"
                       + "EXP_1 \\diff EXP_2: difference between two expressions \n"
                       + "EXP_1 \\intersect EXP_2: intersection between two expressions \n"
                       + "\\rename_{NEW_ATTR_NAME_LIST} EXP: rename all attributes of an expression \n"
                       + "\\d: for a list of all relations \n"
                       + "\\d [TABLENAME]: schema of the TABLENAME \n\n"
                       + "subquery [SUBQUERYNAME] [DEFINITION]: Defines a subquery named SUBQUERYNAME with definition DEFINITION. "
                       + "Subquery names must start with a colon (:). Subqueries can't be nested. \n\n"
                       + "Additional Functionality: \n"
                       + "AUTOCORRECT \n"
                       + "There is autocorrect implemented for the RA commands. Hit tab after starting a command with '\\'. \n\n"
                       + "AUTOCOMPLETE \n"
                       + "There is autocomplete implemented for the relation names and attributes. Hit tab after starting the relation name or attribute. "
                       + "If there are multiple possibilities for what you have entered, no autocomplete will occur.\n\n"
                       + "CLEAR \n"
                       + "By typing 'clear', you can clear the screen of text. \n\n"
                       + "COLORS \n"
                       + "By typing in a color from below list of colors, you can change the color of the prompt. \n"
                       + "List of Colors: black, blue, gold, gray, green, orange, purple, red, white, yellow, ghost protocol \n\n"
                       + "HISTORY \n"
                       + "By using the up and down arrow keys, you can navigate the command history"; 
var SUBQUERY_SUCCESS_MSG = "Successfully stored subquery.";
var SUBQUERY_NEST_FAIL_MSG = "Error: Subqueries can not be nested.";
var SUBQUERY_FAIL_COLON_MSG = "Error: Subqueries must begin with a colon (:)"

var nodeId = 100;

function getDefaultCommandData() {
  return [
    {
      query: "help",
      result: SHORT_HELP_MESSAGE
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
  <RaTree setTerminalInput={terminal.setInput} getTerminalInput={terminal.getInput} />,
  document.getElementById('rightpane')
);
