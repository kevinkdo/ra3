import * as React from "react";
import * as ReactDOM from "react-dom";
import { Const } from "./constants.tsx";
import * as Parser from "./parser.ts";
import { Globals } from "./globals.tsx";
import { QueryStringPair } from "./QueryStringPair.tsx";
import { QueryResultPair } from "./QueryResultPair.tsx";
import { CurrentInput } from "./CurrentInput.tsx";

export interface QueryAndResult {
  query: string,
  result: Parser.ASTRunResult | string
}

export interface TerminalEmulatorState {
  currentInput: string,
  color: string,
  history: Array<string>,
  historyIndex: number,
  subqueryList: { [s: string]: string; },
  commands: Array<QueryAndResult>
}

export class TerminalEmulator extends React.Component<{}, TerminalEmulatorState> {
  constructor(props: any) {
    super(props);
    this.state = {
      commands: [{
        query: "help",
        result: Const.SHORT_HELP_MESSAGE
      }],
      currentInput: "",
      color: "#0f0",
      history: [""],
      historyIndex: -1,
      subqueryList: {}
    };
  }

  public setInput = (newInput: string) => {
     this.setState(prevState => {
       prevState.currentInput = newInput;
       return prevState;
     });
  }

  public getInput = () => {
     return this.state.currentInput;
  }

  public autocomplete = (s: string) => {
    s = s.toLowerCase();
    var answer = s;
    Const.tab_options.forEach(function(option) {
        if (s == option.substring(0, s.length)) {
            answer = option;
        }
    });
    return answer;
  }

  public cleanQuery = (query: string) => {
    while (query.indexOf("\n>") != -1) {
        query = query.replace('\n>', '');
    }
    return query;
  }

  public expandSubquery = (query: string) => {
    var keys:Array<string> = Object.keys(this.state.subqueryList);

    for (var i = 0; i < keys.length; i++) {
        while (query.indexOf(keys[i]) != -1) {
            query = query.replace(keys[i], this.state.subqueryList[keys[i]]);
        }
    }
    return query;
  }

  public handleEnter = (e: KeyboardEvent) => {
      if (this.state.currentInput.length == 0) {
          var newCommands = this.state.commands.concat([{ query: "", result: "" }]);
          this.setState(prevState => {
            prevState.commands = newCommands;
            prevState.currentInput = "";
            return prevState;
          });
      } else if (this.state.currentInput == "clear") {
        this.setState(prevState => {
          prevState.commands = [];
          prevState.currentInput = "";
          return prevState;
        });
      } else if (this.state.currentInput == "help") {
          var newCommands = this.state.commands.concat([{ query: this.state.currentInput, result: Const.SHORT_HELP_MESSAGE }]);
          this.setState(prevState => {
            prevState.commands = newCommands;
            prevState.currentInput = "";
            return prevState;
          });
      } else if (this.state.currentInput == "help --verbose") {
          var newCommands = this.state.commands.concat([{ query: this.state.currentInput, result: Const.LONG_HELP_MESSAGE }]);
          this.setState(prevState => {
            prevState.commands = newCommands;
            prevState.currentInput = "";
            return prevState;
          });
      } else if (this.state.currentInput.substring(0, 8) == "subquery") {
          var newHistory = this.state.history;
          newHistory.push(this.state.currentInput);
          var newHistoryIndex = newHistory.length;

          var firstSpaceIndex = 8;
          var secondSpaceIndex = this.state.currentInput.substring(firstSpaceIndex + 1).indexOf(" ") + firstSpaceIndex + 1;
          var subqueryName = this.state.currentInput.substring(firstSpaceIndex + 1, secondSpaceIndex);
          var subqueryDefinition = this.state.currentInput.substring(secondSpaceIndex + 1);

          if (subqueryName[0] != ":") {
              var newCommands = this.state.commands.concat([{ query: this.state.currentInput, result: Const.SUBQUERY_FAIL_COLON_MSG }]);
              this.setState(prevState => {
                prevState.commands = newCommands;
                prevState.currentInput = "";
                prevState.history = newHistory;
                prevState.historyIndex = newHistoryIndex;
                return prevState;
              });
              return;
          }

          if (subqueryDefinition[subqueryDefinition.length - 1] == ';') {
              subqueryDefinition = subqueryDefinition.substring(0, subqueryDefinition.length - 1);
          }
          if (subqueryDefinition.indexOf(":") === -1) {
              var tempSubqueryList = this.state.subqueryList;
              tempSubqueryList[subqueryName] = subqueryDefinition;
              var newCommands = this.state.commands.concat([{ query: this.state.currentInput, result: Const.SUBQUERY_SUCCESS_MSG }]);
              this.setState(prevState => {
                prevState.commands = newCommands;
                prevState.currentInput = "";
                prevState.history = newHistory;
                prevState.historyIndex = newHistoryIndex;
                prevState.subqueryList = tempSubqueryList;
                return prevState;
              });
          } else {
              var newCommands = this.state.commands.concat([{ query: this.state.currentInput, result: Const.SUBQUERY_NEST_FAIL_MSG }]);
              this.setState(prevState => {
                prevState.commands = newCommands;
                prevState.currentInput = "";
                prevState.history = newHistory;
                prevState.historyIndex = newHistoryIndex;
                return prevState;
              });
          }
      } else {
          if (this.state.currentInput[this.state.currentInput.length - 1] != ";") {
              this.setInput(this.state.currentInput + "\n" + "> ");
          } else {
              var newHistory = this.state.history;
              newHistory.push(this.state.currentInput);
              var newHistoryIndex = newHistory.length;
              var result = Parser.runQuery(this.expandSubquery(this.cleanQuery(this.state.currentInput)));
              var newCommands = this.state.commands.concat([{ query: this.cleanQuery(this.state.currentInput), result: result }]);
              this.setState(prevState => {
                prevState.commands = newCommands;
                prevState.currentInput = "";
                prevState.history = newHistory;
                prevState.historyIndex = newHistoryIndex;
                return prevState;
              });
          }
      }
  }

  public handleStrangeKeys = (e: KeyboardEvent) => {
      if (e.keyCode == Const.BACKSPACE) {
          e.preventDefault();
          if (this.state.currentInput.length > 0) {
              newCurrentInput = this.state.currentInput.slice(0, -1);
              this.setInput(newCurrentInput);
          }
      } else if (e.keyCode == Const.ENTER) {
          this.handleEnter(e);
      } else if (e.keyCode == Const.TAB) {
          e.preventDefault();
          var autocompleteIndex = this.state.currentInput.lastIndexOf("\\");
          if (autocompleteIndex != -1) {
              var toBeCompleted = this.state.currentInput.substring(autocompleteIndex);
              var completion = this.autocomplete(toBeCompleted);
              this.setInput(this.state.currentInput.substring(0, autocompleteIndex) + completion);
          }
      } else if (e.keyCode == Const.UP) {
          e.preventDefault();
          var newHistoryIndex = this.state.historyIndex - 1;
          if (newHistoryIndex < 0) {
              newHistoryIndex = 0;
          }
          this.setState(prevState => {
            prevState.currentInput = this.state.history[newHistoryIndex];
            prevState.historyIndex = newHistoryIndex;
            return prevState;
          });
      } else if (e.keyCode == Const.DOWN) {
          e.preventDefault();
          var newHistoryIndex = this.state.historyIndex + 1;
          var newCurrentInput = "";
          if (newHistoryIndex > this.state.history.length - 1) {
              newHistoryIndex = this.state.history.length;
              newCurrentInput = "";
          } else {
              newCurrentInput = this.state.history[newHistoryIndex];
          }
          this.setState(prevState => {
            prevState.currentInput = newCurrentInput;
            prevState.historyIndex = newHistoryIndex;
            return prevState;
          });
      }

      Globals.scrollDown(document.getElementById('leftpane'));
  }

  public handlePrintableKeys = (e: KeyboardEvent) => {
      e.preventDefault();
      if (e.keyCode >= 32 && e.keyCode <= 126) {
          var keyCode = e.keyCode;
          var newCurrentInput = this.state.currentInput + String.fromCharCode(keyCode);
          this.setInput(newCurrentInput);
      }
  }

  public handlePaste = (e: ClipboardEvent) => {
      var me = this;
      e.preventDefault();
      e.clipboardData.items[0].getAsString(function(s: string) {
          var newCurrentInput = me.state.currentInput + s;
          me.setInput(newCurrentInput);
      });
  }

  public componentDidMount = () => {
      document.onkeypress = this.handlePrintableKeys;
      window.onkeydown = this.handleStrangeKeys;
      (document as any).onpaste = this.handlePaste;
  }

  public render() {
    var renderedLines: Array<JSX.Element> = [];
    var color = this.state.color;
    this.state.commands.forEach(function(x) {
      if (typeof x.result === "string") {
        var str_result = x.result as string;
        renderedLines.push(<QueryStringPair key={Globals.nodeId++} query={x.query} result={str_result} color={color} />);
      } else {
        var ast_result = x.result as Parser.ASTRunResult;
        renderedLines.push(<QueryResultPair key={Globals.nodeId++} query={x.query} result={ast_result} color={color} />);
      }
    });
    renderedLines.push(<CurrentInput key={Globals.nodeId++} input={this.state.currentInput} color={color}/>);
    return <pre>{renderedLines}</pre>;
  }
}