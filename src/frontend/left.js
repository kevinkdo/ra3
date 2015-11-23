// ----- TerminalEmulator -----
var TerminalEmulator = React.createClass({
  setInput: function(string) {
    this.setState({currentInput: string});
  },

  getInitialState: function() {
    return {
      commands: getDefaultCommandData(),
      currentInput: "",
      color: "#0f0",
      history: [],
      historyIndex: -1,
      historyDirection: "0", // 0 is starting, 1 is up, -1 is down
      subqueryList: []
    };
  },

  autocorrect: function(partialCommand)
  { 
    partialCommand = partialCommand.toLowerCase();
    if (partialCommand.charAt(0) != '\\') {
      //return -1;
      partialCommand = partialCommand.substring(1);
    }
    
    var raCommandCharacterMap = {};
    for (var i = 0; i < raCommands.length; i++) {
      raCommandCharacterMap[raCommands[i]] = {};
      for (var j = 0; j < raCommands[i].length; j++) {
        if (!(raCommands[i][j] in raCommandCharacterMap[raCommands[i]])) {
          raCommandCharacterMap[raCommands[i]][raCommands[i][j]] = 0;
        }
        raCommandCharacterMap[raCommands[i]][raCommands[i][j]]++;
      }
    }
    var distFromCorrect = 10000;
    var currClosestCommand = "";
    var minDiff = -1000;
    for (var i = 0; i < raCommands.length; i++) {
      var currDiff = 0;
      var currDistFromCorrect = 0;
      for (var j = 0; j < partialCommand.length; j++) {
        if (partialCommand[j] in raCommandCharacterMap[raCommands[i]] && raCommandCharacterMap[raCommands[i]][partialCommand[j]] > 0) {
          raCommandCharacterMap[raCommands[i]][partialCommand[j]]--;
        } else {
          currDiff--;
        }
        currDistFromCorrect += Math.abs(j - raCommands[i].indexOf(partialCommand[j]));
      }

      if (currDiff >= minDiff && currDistFromCorrect < distFromCorrect) {
        minDiff = currDiff;
        distFromCorrect = currDistFromCorrect;
        currClosestCommand = raCommands[i];
      }
    }
    return currClosestCommand;

  },

  autocomplete: function(s) {
    s = s.toLowerCase();
    var matchCount = 0;
    var matchIndex = -1;
    for (var i = 0; i < raCommands.length; i++) {      
      if (s == raCommands[i].substring(0, s.length)) {
        matchCount++;
        matchIndex = i;
      }
      if (matchCount > 1) {
        return s;
      }
    }
    if (matchIndex == -1) {
      return s;
    }

    return raCommands[matchIndex];
  },

  //http://stackoverflow.com/questions/1573053/javascript-function-to-convert-color-names-to-hex-codes
  colourNameToHex: function(colour)
  {
    var colours = {"aqua":"#00ffff", "azure":"#f0ffff", "black":"#000000", "blue":"#0000ff","blueviolet":"#8a2be2","brown":"#a52a2a",
    "coral":"#ff7f50","crimson":"#dc143c","cyan":"#00ffff", "darkblue":"#00008b","darkcyan":"#008b8b","darkgray":"#a9a9a9","darkgreen":"#006400",
    "fuchsia":"#ff00ff", "ghostwhite":"#f8f8ff","gold":"#ffd700","gray":"#808080","green":"#008000","greenyellow":"#adff2f", "hotpink":"#ff69b4",
    "indigo":"#4b0082", "lavender":"#e6e6fa","lavenderblush":"#fff0f5","lightblue":"#add8e6","lightcoral":"#f08080","lightcyan":"#e0ffff",
    "lightgrey":"#d3d3d3","lightgreen":"#90ee90","lightpink":"#ffb6c1","lightsalmon":"#ffa07a","lightseagreen":"#20b2aa","lightskyblue":"#87cefa",
    "lime":"#00ff00","limegreen":"#32cd32", "magenta":"#ff00ff","maroon":"#800000", "navy":"#000080", "orange":"#ffa500","orangered":"#ff4500",
    "peachpuff":"#ffdab9","peru":"#cd853f","pink":"#ffc0cb","plum":"#dda0dd", "purple":"#800080", "red":"#ff0000","royalblue":"#4169e1","salmon":"#fa8072",
    "seagreen":"#2e8b57","seashell":"#fff5ee","silver":"#c0c0c0","skyblue":"#87ceeb","snow":"#fffafa","springgreen":"#00ff7f","steelblue":"#4682b4",
    "tan":"#d2b48c","teal":"#008080","tomato":"#ff6347","turquoise":"#40e0d0", "violet":"#ee82ee", "white":"#ffffff", "yellow":"#ffff00","ghost protocol": "#000000"};

    if (typeof colours[colour.toLowerCase()] != 'undefined')
        return colours[colour.toLowerCase()];

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

  findPlaceOfAutocomplete: function(s) {
    for (var i = s.length - 1; i >= 0; i--) {
      if (s[i] == " " || s[i] == "{") {
        return i + 1;
      }
      if (s[i] == "\\") {
        return -1; 
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
      while (query.indexOf(" " + keys[i]) != -1) {
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

  handleStrangeKeys: function(e) {
    if (e.keyCode == BACKSPACE) {
      //Prevent browser from going back
      e.preventDefault();

      if (this.state.currentInput.length > 0) {
        newCurrentInput = this.state.currentInput.slice(0, -1);
        this.setState({currentInput: newCurrentInput});
      }
    } else if (e.keyCode == ENTER) {
      if (this.state.currentInput.length == 0) {
        var newCommands = this.state.commands.concat([{query: "", result: ""}]);
        this.setState({commands: newCommands, currentInput: ""});
      } else if (this.state.currentInput == "clear") {
        this.setState({commands: [], currentInput: ""});
      } else if (this.state.currentInput == "help") {
        var newCommands = this.state.commands.concat([{query: this.state.currentInput, result: shortHelpMessage}]);
        this.setState({commands: newCommands, currentInput: ""});
      } else if (this.state.currentInput == "help --verbose") {
        var newCommands = this.state.commands.concat([{query: this.state.currentInput, result: longHelpMessage}]);
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
        var subqueryName = this.state.currentInput.substring(firstSpaceIndex + 1, secondSpaceIndex);
        var subqueryDefinition = this.state.currentInput.substring(secondSpaceIndex + 1);
        if (subqueryDefinition[subqueryDefinition.length-1] == ';') {
          subqueryDefinition = subqueryDefinition.substring(0, subqueryDefinition.length - 1);
        }
        subqueryDefinition = "(" + subqueryDefinition + ")";
        var newHistory = this.state.history.concat(this.state.currentInput);
        var newHistoryIndex = newHistory.length - 1;
        if (this.verifyNoSubqueryCycle(subqueryDefinition)) {
          var tempSubqueryList = this.state.subqueryList;
          tempSubqueryList[subqueryName] = subqueryDefinition;
          var newCommands = this.state.commands.concat([{query: this.state.currentInput, result: subquerySuccess}]);
          this.setState({commands: newCommands, currentInput: "", history: newHistory, historyIndex: newHistoryIndex, subqueryList: tempSubqueryList});     
        } else {
          var newCommands = this.state.commands.concat([{query: this.state.currentInput, result: subqueryFailure}]);  
          this.setState({commands: newCommands, currentInput: "", history: newHistory, historyIndex: newHistoryIndex});       
        }

      } else {
        var newHistory = this.state.history.concat(this.state.currentInput);
        var newHistoryIndex = newHistory.length - 1;
        if (this.state.currentInput[this.state.currentInput.length - 1] != ";") {
          this.setState({currentInput: this.state.currentInput + "\n" + "> ", history: newHistory, historyIndex: newHistoryIndex});            
        } else {
          var xhttp = new XMLHttpRequest();
          var newCommands = this.state.commands;
          var currentInputTemp = this.cleanQuery(this.state.currentInput);
          var temp = "";
          var that = this;
          xhttp.onreadystatechange = function() {
            if (xhttp.readyState == 4) {
              newCommands = newCommands.concat([{query: currentInputTemp, result: xhttp.responseText}]);
            }
            that.setState({commands: newCommands, currentInput: "", history: newHistory, historyIndex: newHistoryIndex});

          }
          var queryCleanedWithSubqueries = this.expandSubquery(this.cleanQuery(this.state.currentInput));
          if (queryCleanedWithSubqueries.substring(0,2) == "\\d") {
            xhttp.open("GET", "https://ra-beers-example.herokuapp.com/schema/"+encodeURIComponent(queryCleanedWithSubqueries), true);
            xhttp.send();
            this.setState({commands: newCommands, currentInput: "", history: newHistory, historyIndex: newHistoryIndex});
          } else {
            xhttp.open("GET", "https://ra-beers-example.herokuapp.com/query/"+encodeURIComponent(queryCleanedWithSubqueries), true);
            xhttp.send();
            this.setState({commands: newCommands, currentInput: "", history: newHistory, historyIndex: newHistoryIndex});
          }
          
        }        
      }
    } else if (e.keyCode == TAB) {
        e.preventDefault();

        var autocompleteIndex = this.findPlaceOfAutocomplete(this.state.currentInput);
        if (autocompleteIndex == -1) {
          var tabIndex = this.findPlaceOfSlash(this.state.currentInput);                  
          var toBeCorrected = this.state.currentInput.substring(tabIndex);
          var raCommand = this.autocorrect(toBeCorrected); 
          this.setState({currentInput: this.state.currentInput.substring(0, tabIndex) + "\\" + raCommand});  
        } else {
          var toBeCompleted = this.state.currentInput.substring(autocompleteIndex);
          var raCommand = this.autocomplete(toBeCompleted); 
          this.setState({currentInput: this.state.currentInput.substring(0, autocompleteIndex) + raCommand});  
        }
        
    } else if (e.keyCode == UP) {
        e.preventDefault();
        if (this.state.historyDirection == -1) {
          var newHistoryIndex = this.state.historyIndex - 1; 
          this.setState({historyIndex: newHistoryIndex});
          this.setState({currentInput: this.state.history[this.state.historyIndex], historyDirection: 1});    
        } else {
          this.setState({currentInput: this.state.history[this.state.historyIndex], historyDirection: 1});  
          var newHistoryIndex = this.state.historyIndex - 1; 
          this.setState({historyIndex: newHistoryIndex});
        }
        if (this.state.historyIndex < 0) {
          this.setState({historyIndex: 0});
        }       
    } else if (e.keyCode == DOWN) {
        e.preventDefault();
        if (this.state.historyDirection == 1) {
          var newHistoryIndex = this.state.historyIndex + 1; 
          this.setState({historyIndex: newHistoryIndex});
          this.setState({currentInput: this.state.history[this.state.historyIndex], historyDirection: 1});    
        } else {
          this.setState({currentInput: this.state.history[this.state.historyIndex], historyDirection: -1});  
          var newHistoryIndex = this.state.historyIndex + 1; 
          this.setState({historyIndex: newHistoryIndex});
        }
        if (this.state.historyIndex > this.state.history.length - 1) {
          this.setState({historyIndex: this.state.history.length - 1});
        }
        this.setState({currentInput: this.state.history[this.state.historyIndex], historyDirection: -1});  
    }

    scrollDown();
  },
  
  //Annoyingly, onkeypress mostly only works with printable keys (i.e. not backspace)
  handlePrintableKeys: function(e) {
    if (e.keyCode < 32 || e.keyCode > 126) {
      return;
    }

    var keyCode = e.keyCode;
    var newCurrentInput;
    newCurrentInput = this.state.currentInput + String.fromCharCode(keyCode);
    this.setState({currentInput: newCurrentInput});
  },

  componentDidMount: function() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (xhttp.readyState == 4) {
        var attrList = JSON.parse(xhttp.responseText);
        for (var i = 0; i < attrList.length; i++) {
          raCommands.push(attrList[i]);
        }
      }
    }
    xhttp.open("GET", "http://ra-beers-example.herokuapp.com/lookahead/");
    xhttp.send();
  
    document.onkeypress = this.handlePrintableKeys;
    window.onkeydown = this.handleStrangeKeys;
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
    var fallback = <span><span className="raprompt" style={{color: this.props.color}}>ra&gt; </span>{this.props.query}{"\n"}{this.props.result}{"\n"}</span>;

    if (this.props.result.length == 0 || this.props.result == subquerySuccess || this.props.result == subqueryFailure) {
      return fallback;
    }

    var parsedList = JSON.parse(this.props.result);
    var tables = [];
    var first = true; 
    for (var i = 0; i < parsedList.length; i++) {
      var parsed = parsedList[i];
      if (!parsed) {
        tables.push(fallback);
      }
      if (first) {
        if (parsed.isError) {
          console.log(parsed);
          tables.push(<span><span className="raprompt" style={{color: this.props.color}}>ra&gt; </span>{this.props.query}{"\n"}{parsed.error.message}{"\n"}{"at location " + parsed.error.start + " to " + parsed.error.end + "\n"}</span>);
        }
        else if (!parsed.data) {
          tables.push(fallback);
        } else {
          if (parsed.title) {
            tables.push(<span><span className="raprompt" style={{color: this.props.color}}>ra&gt; </span>{this.props.query}{"\n"}<span>{parsed.title}{"\n"}</span><ResultTable parsed={parsed}/></span>);
          } else {
            tables.push(<span><span className="raprompt" style={{color: this.props.color}}>ra&gt; </span>{this.props.query}{"\n"}<ResultTable parsed={parsed}/></span>);  
          }
          
        }
        first = false;
      } else {
        if (parsed.isError) {
          console.log(parsed);
          tables.push(<span>{parsed.error.message}{"\n"}{"at location " + parsed.error.start + " to " + parsed.error.end + "\n"}</span>);
        }
        else if (!parsed.data) {
          tables.push(fallback);
        } else {
          if (parsed.title) {
            tables.push(<span><span>{parsed.title}{"\n"}</span><ResultTable parsed={parsed}/></span>);
          } else {
            tables.push(<span><ResultTable parsed={parsed}/></span>);
          }
        }
      }
      tables.push(<span>{"\n"}</span>);
    }
    return <div>{tables}</div>
  }
});

// ----- ResultTable -----
var ResultTable = React.createClass({
  render: function() {
    var colNames = [];
    this.props.parsed.columnNames.forEach(function(col) {
        colNames.push(col);
    });

    var renderColName = function(x) {return <td>{x}</td>};
    var renderedRows = [<tr>{colNames.map(renderColName)}</tr>];
    this.props.parsed.data.forEach(function(x) {
      var renderColVal = function(colName) {
        return <td>{x[colName]}</td>;
      };

      renderedRows.push(<tr>{colNames.map(renderColVal)}</tr>);
    });
    return <table className="resultTable">{renderedRows}</table>
  }
});
