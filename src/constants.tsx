export namespace Const {
    export var BACKSPACE: number = 8;
    export var ENTER: number = 13;
    export var TAB: number = 9;
    export var UP: number = 38;
    export var DOWN: number = 40;
    export var tab_options = ["project_{", "join", "select_{", "cross", "union", "diff", "intersect", "rename_{"];
    export var SHORT_HELP_MESSAGE: string = "Welcome to RA3\nJordan Ly, Jennie Ju, Michael Han, and Kevin Do\nInspired by Jun Yang's ra interpreter\n"
        + "'help --verbose' for a list of commands";
    export var LONG_HELP_MESSAGE: string = "Relational Algebra Expressions: \n"
        + "\\select_{COND} EXP: selection over an expression \n"
        + "\\project_{ATTR_LIST} EXP: projection of an expression \n"
        + "EXP_1 \\join EXP_2: natural join between two expressions \n"
        + "EXP_1 \\join_{COND} EXP_2: theta-join between two expressions \n"
        + "EXP_1 \\cross EXP_2: cross-product between two expressions \n"
        + "EXP_1 \\union EXP_2: union between two expressions \n"
        + "EXP_1 \\diff EXP_2: difference between two expressions \n"
        + "EXP_1 \\intersect EXP_2: intersection between two expressions \n"
        + "\\rename_{NEW_ATTR_NAME_LIST} EXP: rename all attributes of an expression \n"
        + "subquery [SUBQUERYNAME] [DEFINITION]: Defines a subquery named SUBQUERYNAME with definition DEFINITION. "
        + "Subquery names must start with a colon (:). Subqueries can't be nested. \n\n"
        + "Additional Functionality: \n"
        + "AUTOCOMPLETE \n"
        + "There is autocomplete implemented for the relation names and attributes. Hit tab after starting the relation name or attribute. "
        + "If there are multiple possibilities for what you have entered, no autocomplete will occur.\n\n"
        + "CLEAR \n"
        + "By typing 'clear', you can clear the screen of text. \n\n"
        + "COLORS \n"
        + "By typing in a color from the following list, you can change the color of the prompt: "
        + "black, blue, gold, gray, green, orange, purple, red, white, yellow, ghost protocol \n\n"
        + "HISTORY \n"
        + "By using the up and down arrow keys, you can navigate the command history\n\n"
        + "SCHEMA\n"
        + "Bar(name, address)\n"
        + "Beer(name, brewer)\n"
        + "Drinker(name, address)\n"
        + "Frequents(drinker, bar, times_a_week)\n"
        + "Serves(bar, beer, price)\n"
        + "Likes(drinker, beer)\n";
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