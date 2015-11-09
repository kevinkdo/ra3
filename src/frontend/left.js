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
    if (partialCommand.charAt(0) != '\\') {
      return -1;
    }
    partialCommand = partialCommand.substring(1);
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

  findPlaceOfTab: function(raComm) {
    for (var i = 0; i < raComm.length; i++) {
      if (raComm[i] == "\\") {
        return i;
      }
    }
    return -1;
  }, 

  cleanQuery: function(query) {
    while (query.indexOf(">") != -1) {
      query = query.replace('>', '');
    }

    for (var key in Object.keys(this.state.subqueryList)) {
      while (query.indexOf(key) != -1) {
        query = query.replace(key, this.state.subqueryList[key]);
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

  createTable: function(json) {
    //need to handle multi queries
    if (json[0].isError == true) {
      return "start: " + json[0].error.start + "\n"
              + "end: " + json[0].error.end + "\n"
              + "error: " + json[0].error.message;
    } else {
      var table = "";
      var colList = json[0].columnNames;
      var tupleList = [];
      for (var i = 0; i < json[0].data.length; i++) {
        tupleList.push(json[0].data[0]);
      }
      var maxItemLen = [];
      var data = [];//key: col name, value: list of items
      for (var col in colList) {
        data[col.value] = [];
        for (var tuple in tupleList) {
          if (data[col.value].length == 0) {
            data[col.value] = [tuple.col];
          } else {
            data[col.value].push(tuple.col);
          }
        }
      }

      for (var col in colList) {
        table += "   " + col + "   |\n"; 
      }
      table += "---------------------\n";
      for (var col in colList) {
        for(var item in data[col]) {
          table += item.value + "    |\n";
        }
      }
      return table;
    }
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
        var newHistory = this.state.history.concat(this.state.currentInput);
        var newHistoryIndex = newHistory.length - 1;
        if (this.verifyNoSubqueryCycle(subqueryDefinition)) {
          var tempSubqueryList = this.state.subqueryList;
          tempSubqueryList[subqueryName] = subqueryDefinition;
          var newCommands = this.state.commands.concat([{query: this.state.currentInput, result: "subquery succesfully stored"}]);
          this.setState({commands: newCommands, currentInput: "", history: newHistory, historyIndex: newHistoryIndex, subqueryList: tempSubqueryList});       
        } else {
          var newCommands = this.state.commands.concat([{query: this.state.currentInput, result: "cannot define subquery using other subqueries"}]);  
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
              //var json = JSON.parse(xhttp.responseText);
              //var table = that.createTable(json);
              //newCommands = newCommands.concat([{query: currentInputTemp, result: table}]);
              newCommands = newCommands.concat([{query: currentInputTemp, result: xhttp.responseText}]);
            }
            that.setState({commands: newCommands, currentInput: "", history: newHistory, historyIndex: newHistoryIndex});

          }
          var queryCleanedWithSubqueries = this.cleanQuery(this.state.currentInput);
          
          xhttp.open("GET", "https://ra-beers-example.herokuapp.com/query/"+encodeURIComponent(queryCleanedWithSubqueries), true);
          xhttp.send();
          this.setState({commands: newCommands, currentInput: "", history: newHistory, historyIndex: newHistoryIndex});
        }        
      }
    } else if (e.keyCode == TAB) {
        e.preventDefault();
        var tabIndex = this.findPlaceOfTab(this.state.currentInput);
        var toBeCompleted = this.state.currentInput.substring(tabIndex);
        var raCommand = this.autocorrect(toBeCompleted);
        this.setState({currentInput: this.state.currentInput.substring(0, tabIndex) + "\\" + raCommand});
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
    return <span><span className="raprompt" style={{color: this.props.color}}>ra&gt; </span>{this.props.query}{"\n"}{this.props.result}{"\n"}</span>;
    
    //For testing
    //return <span><span className="raprompt" style={{color: this.props.color}}>ra&gt; </span>{this.props.query}{"\n"}<ResultTable />{"\n"}</span>;
  }
});

// ----- ResultTable -----
var ResultTable = React.createClass({
  getInitialState: function() {
    return {
      data: [
        {
          name:"jennie",
          age: "35",
          bar: "james joyce pub"
        },
        {
          name: "jordan",
          age: "323",
          bar: "james joyce pub"
        },
        {
          name: "kevin",
          age: "28",
          bar: "james joyce pub"
        },
        {
          name: "michael",
          age: "96",
          bar: "james joyce pub"
        },
      ]
    };
  },

  render: function() {
    var colNames = [];
    //TODO Ask for list of header names from backend
    for (var col in this.state.data[0]) {
      if (this.state.data[0].hasOwnProperty(col)) {
        colNames.push(col);
      }
    }

    var renderColName = function(x) {return <td>{x}</td>};
    var renderedRows = [<tr>{colNames.map(renderColName)}</tr>];
    this.state.data.forEach(function(x) {
      var renderColVal = function(colName) {
        return <td>{x[colName]}</td>;
      };

      renderedRows.push(<tr>{colNames.map(renderColVal)}</tr>);
    });
    return <table className="resultTable">{renderedRows}</table>
  }
});
