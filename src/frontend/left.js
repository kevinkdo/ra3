// ----- TerminalEmulator -----
var TerminalEmulator = React.createClass({
  setInput: function(string) {
    this.setState({currentInput: string});
  },

  getInput: function() {
    return this.state.currentInput;
  },

  getInitialState: function() {
    return {
      commands: getDefaultCommandData(),
      currentInput: "",
      color: "#0f0",
      history: [""],
      historyIndex: -1,
      subqueryList: []
    };
  },

  autocomplete: function(s) {
    s = s.toLowerCase();
    var answer = s;
    tab_options.forEach(function(option) {
      if (s == option.substring(0, s.length)) {
        answer = option;
      }
    });
    return answer;
  },

  colourNameToHex: function(colour) {
    var colours = {"black":"#000000", "blue":"#0000ff", "gold":"#ffd700","gray":"#808080","green":"#008000", "orange":"#ffa500",
    "purple":"#800080", "red":"#ff0000", "white":"#ffffff", "yellow":"#ffff00","ghost protocol": "#000000"};

    if (typeof colours[colour.toLowerCase()] != 'undefined') {
      return colours[colour.toLowerCase()];
    }

    return false;
  },

  findPlaceOfSlash: function(raComm) {
    for (var i = raComm.length - 1; i >= 0; i--) {
      if (raComm[i] == "\\") {
        return i;
      }
    }
    return -1;
  },

  findAutocompleteLocation: function(s) {
    for (var i = s.length - 1; i >= 0; i--) {
      if (s[i] == "\\") {
        return i;
      }
      if (s[i] == " " || s[i] == "{") {
        return i + 1;
      }
    }
    return 0;
  },

  cleanQuery: function(query) {
    while (query.indexOf("\n>") != -1) {
      query = query.replace('\n>', '');
    }
    return query;
  },

  expandSubquery: function(query) {
    var keys = [];
    for (var key in this.state.subqueryList) {
      if (this.state.subqueryList.hasOwnProperty(key)) {
        keys.push(key);
      }
    }

    for (var i = 0; i < keys.length; i++) {
      while (query.indexOf(keys[i]) != -1) {
        query = query.replace(keys[i], this.state.subqueryList[keys[i]]);
      }
    }
    return query;
  },

  verifyNoSubqueryCycle: function(query) {
    var keyList = Object.keys(this.state.subqueryList);
    for (var i = 0; i < keyList.length; i++) {
      if (query.indexOf(keyList[i]) != -1) {
        return false;
      }
    }
    return true;
  },

  handleEnter: function(e) {
    if (this.state.currentInput.length == 0) {
      var newCommands = this.state.commands.concat([{query: "", result: ""}]);
      this.setState({commands: newCommands, currentInput: ""});
    } else if (this.state.currentInput == "clear") {
      this.setState({commands: [], currentInput: ""});
    } else if (this.state.currentInput == "help") {
      var newCommands = this.state.commands.concat([{query: this.state.currentInput, result: SHORT_HELP_MESSAGE}]);
      this.setState({commands: newCommands, currentInput: ""});
    } else if (this.state.currentInput == "help --verbose") {
      var newCommands = this.state.commands.concat([{query: this.state.currentInput, result: LONG_HELP_MESSAGE}]);
      this.setState({commands: newCommands, currentInput: ""});
    } else if (this.colourNameToHex(this.state.currentInput)) {
      this.setState({currentInput: "", color: this.colourNameToHex(this.state.currentInput)});
    } else if (this.state.currentInput.substring(0,8) == "subquery") {
      var firstSpaceIndex = 8;
      var secondSpaceIndex = -1;
      for (var i = firstSpaceIndex + 1; i < this.state.currentInput.length; i++) {
        if (this.state.currentInput.charAt(i) == " ") {
          secondSpaceIndex = i;
          break;
        }
      }
      var newHistory = this.state.history;
      newHistory.splice(this.state.history.length - 1, 0, this.state.currentInput);
      var newHistoryIndex = newHistory.length - 1;

      var subqueryName = this.state.currentInput.substring(firstSpaceIndex + 1, secondSpaceIndex);
      if (subqueryName[0] != ":") {
        var newCommands = this.state.commands.concat([{query: this.state.currentInput, result: SUBQUERY_FAIL_COLON_MSG}]);
        this.setState({commands: newCommands, currentInput: "", history: newHistory, historyIndex: newHistoryIndex});
        return;
      }
      var subqueryDefinition = this.state.currentInput.substring(secondSpaceIndex + 1);
      if (subqueryDefinition[subqueryDefinition.length-1] == ';') {
        subqueryDefinition = subqueryDefinition.substring(0, subqueryDefinition.length - 1);
      }
      subqueryDefinition = "(" + subqueryDefinition + ")";
      var newHistory = this.state.history;
      newHistory.splice(this.state.history.length - 1, 0, this.state.currentInput);
      var newHistoryIndex = newHistory.length - 1;
      if (this.verifyNoSubqueryCycle(subqueryDefinition)) {
        var tempSubqueryList = this.state.subqueryList;
        tempSubqueryList[subqueryName] = subqueryDefinition;
        var newCommands = this.state.commands.concat([{query: this.state.currentInput, result: SUBQUERY_SUCCESS_MSG}]);
        this.setState({commands: newCommands, currentInput: "", history: newHistory, historyIndex: newHistoryIndex, subqueryList: tempSubqueryList});
      } else {
        var newCommands = this.state.commands.concat([{query: this.state.currentInput, result: SUBQUERY_NEST_FAIL_MSG}]);
        this.setState({commands: newCommands, currentInput: "", history: newHistory, historyIndex: newHistoryIndex});
      }
    } else {
      var newHistory = this.state.history;
      newHistory.splice(this.state.history.length - 1, 0, this.state.currentInput);
      var newHistoryIndex = newHistory.length - 1;
      if (this.state.currentInput[this.state.currentInput.length - 1] != ";") {
        this.setState({currentInput: this.state.currentInput + "\n" + "> ", history: newHistory, historyIndex: newHistoryIndex});
      } else {
        var xhttp = new XMLHttpRequest();
        var newCommands = this.state.commands;
        var currentInputTemp = this.cleanQuery(this.state.currentInput);
        var temp = "";
        var me = this;
        var queryCleanedWithSubqueries = this.expandSubquery(this.cleanQuery(this.state.currentInput));
        var result = runQuery(queryCleanedWithSubqueries);

        newCommands = newCommands.concat([{query: currentInputTemp, result: result}]);
        me.setState({commands: newCommands, currentInput: "", history: newHistory, historyIndex: newHistoryIndex});
      }
    }
  },

  handleStrangeKeys: function(e) {
    if (e.keyCode == BACKSPACE) {
      e.preventDefault();
      if (this.state.currentInput.length > 0) {
        newCurrentInput = this.state.currentInput.slice(0, -1);
        this.setState({currentInput: newCurrentInput});
      }
    } else if (e.keyCode == ENTER) {
      this.handleEnter(e);
    } else if (e.keyCode == TAB) {
        e.preventDefault();
        var autocompleteIndex = this.findAutocompleteLocation(this.state.currentInput);
        if (autocompleteIndex != -1) {
          var toBeCompleted = this.state.currentInput.substring(autocompleteIndex);
          var completion = this.autocomplete(toBeCompleted);
          this.setState({currentInput: this.state.currentInput.substring(0, autocompleteIndex) + completion});
        }
    } else if (e.keyCode == UP) {
        e.preventDefault();
        var newHistoryIndex = this.state.historyIndex - 1;
        if (newHistoryIndex < 0) {
          newHistoryIndex = 0;
        }
        this.setState({historyIndex: newHistoryIndex});
        this.setState({currentInput: this.state.history[this.state.historyIndex]});
    } else if (e.keyCode == DOWN) {
        e.preventDefault();
        var newHistoryIndex = this.state.historyIndex + 1;
        if (newHistoryIndex > this.state.history.length - 1) {
          newHistoryIndex = this.state.history.length - 1;
        }
        this.setState({historyIndex: newHistoryIndex});
        this.setState({currentInput: this.state.history[this.state.historyIndex]});
    }

    scrollDown();
  },

  handlePrintableKeys: function(e) {
    e.preventDefault();
    if (e.keyCode >= 32 && e.keyCode <= 126) {
      var keyCode = e.keyCode;
      var newCurrentInput;
      newCurrentInput = this.state.currentInput + String.fromCharCode(keyCode);
      this.setState({currentInput: newCurrentInput});
    }
  },

  handlePaste: function(e) {
    var me = this;
    e.preventDefault();
    e.clipboardData.items[0].getAsString(function(s) {
      newCurrentInput = me.state.currentInput + s;
      me.setState({currentInput: newCurrentInput});
    });
  },

  componentDidMount: function() {
    document.onkeypress = this.handlePrintableKeys;
    window.onkeydown = this.handleStrangeKeys;
    document.onpaste = this.handlePaste;
  },

  render: function() {
    var renderedLines = [];
    var color = this.state.color;
    this.state.commands.forEach(function(x) {
      renderedLines.push(<QueryResultPair key={nodeId++} query={x.query} result={x.result} color={color} />);
    });
    renderedLines.push(<CurrentInput key={nodeId++} input={this.state.currentInput} color={color}/>);
    return <pre>{renderedLines}</pre>;
  }
});

// ----- CurrentInput -----
var CurrentInput = React.createClass({
  render: function() {
    var obj = {color: this.props.color, background: "#fff"};
    return <span><span id = "raprompt" style={obj}>ra&gt; </span>{this.props.input}</span>;
  }
});

// ----- QueryResultPair -----
var QueryResultPair = React.createClass({
  render: function() {
    var html;
    var result = this.props.result;
    var fallback = <span key={nodeId++}>{"\n"}{this.props.result}{"\n"}</span>;

    if (result.length == 0 || result == SUBQUERY_SUCCESS_MSG || result == SUBQUERY_NEST_FAIL_MSG || result == SHORT_HELP_MESSAGE || result == LONG_HELP_MESSAGE || result == SUBQUERY_FAIL_COLON_MSG) {
      html = fallback;
    } else {
      if (result.isError) {
        results.push(<span key={nodeId++}>{result.error.message}{"\n"}{"at location " + parsed.error.start + " to " + parsed.error.end + "\n"}</span>);
      } else {
        html = <span key={nodeId++}><ResultTable parsed={result}/></span>;
      }
    }
    return <div><span><span className="raprompt" style={{color: this.props.color}}>ra&gt; </span>{this.props.query}</span><div>{html}</div></div>;
  }
});

// ----- ResultTable -----
var ResultTable = React.createClass({
  render: function() {
    var colNames = this.props.parsed.columns;
    var renderColName = function(x) {return <td key={nodeId++}>{x}</td>};
    var renderedRows = [<tr key={nodeId++} >{colNames.map(renderColName)}</tr>];
    this.props.parsed.tuples.forEach(function(x) {
      var renderColVal = function(colName) {
        return <td key={nodeId++}>{x[colName]}</td>;
      };

      renderedRows.push(<tr key={nodeId++}>{colNames.map(renderColVal)}</tr>);
    });
    return <table className="resultTable">{renderedRows}</table>
  }
});
