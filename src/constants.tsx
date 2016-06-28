export namespace Const {
    export var BACKSPACE: number = 8;
    export var ENTER: number = 13;
    export var TAB: number = 9;
    export var UP: number = 38;
    export var DOWN: number = 40;
    export var tab_options = ["\\project_{", "\\join", "\\select_{", "\\cross", "\\union", "\\diff", "\\intersect", "\\rename_{"];
    export var SHORT_HELP_MESSAGE: string = "Welcome to RA3\nJordan Ly, Jennie Ju, Michael Han, and Kevin Do\nPlease send bugs/comments to kevin.kydat.do |at| gmail.com\n"
        + "'help --verbose' for a list of commands\n";
    export var LONG_HELP_MESSAGE: string = "CORE COMMANDS\n"
        + "\\select_{COND} EXP: selection over an expression \n"
        + "\\project_{ATTR_LIST} EXP: projection of an expression \n"
        + "EXP_1 \\join EXP_2: natural join between two expressions \n"
        + "EXP_1 \\join_{COND} EXP_2: theta-join between two expressions \n"
        + "EXP_1 \\cross EXP_2: cross-product between two expressions \n"
        + "EXP_1 \\union EXP_2: union between two expressions \n"
        + "EXP_1 \\diff EXP_2: difference between two expressions \n"
        + "EXP_1 \\intersect EXP_2: intersection between two expressions \n"
        + "\\rename_{NEW_ATTR_NAME_LIST} EXP: rename all attributes of an expression \n\n"
        + "SCHEMA\n"
        + "Bar(name, address)\n"
        + "Beer(name, brewer)\n"
        + "Drinker(name, address)\n"
        + "Frequents(drinker, bar, times_a_week)\n"
        + "Serves(bar, beer, price)\n"
        + "Likes(drinker, beer)\n\n"
        + "SUBQUERIES\n"
        + "subquery [SUBQUERYNAME] [DEFINITION]: Defines a subquery named [SUBQUERYNAME] with definition [DEFINITION].\n"
        + "Subquery names must start with a colon (:). Subqueries can't be nested. \n\n"
        + "AUTOCOMPLETE \n"
        + "<TAB> to autocomplete commands.\n\n"
        + "CLEAR \n"
        + "'clear' will clear the screen of text. \n\n"
        + "HISTORY \n"
        + "Navigate the command history with the up and down arrow keys.\n";
    export var SUBQUERY_SUCCESS_MSG: string = "Successfully stored subquery.";
    export var SUBQUERY_NEST_FAIL_MSG: string = "Error: Subqueries can not be nested.";
    export var SUBQUERY_FAIL_COLON_MSG: string = "Error: Subqueries must begin with a colon (:)";
    export var mapping: { [s: string]: string } = {
        "\u03c3": "\\select",
        "\u03C0": "\\project",
        "\u00d7": "\\cross",
        "\u22c8": "\\join",
        "\u222a": "\\union",
        "\u2212": "\\diff",
        "\u2229": "\\intersect",
        "\u03c1": "\\rename"
    };
}