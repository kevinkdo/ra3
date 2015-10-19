// Table of contents
// Globals
// Parser
// React classes
//   TerminalEmulator
//   CurrentInput
//   QueryResultPair
//   TreeNode
//   TreeLink
//   Prenode
//   RaTree
// React render statements

// ===== Globals =====
var BACKSPACE = 8;
var ENTER = 13;
var TAB = 9;
var raCommands = ["project_{", "join", "select_{", "cross", "union", "diff", "intersect", "rename_{"];

function getDefaultCommandData() {
  return [
    {
      query: "help --verbose",
      result: "Michael, please type up a short help statement and a long help statement for 'help --verbose'"
    }
  ];
}

function scrollDown() {
  document.getElementById('leftpane').scrollTop = document.getElementById('leftpane').scrollHeight;
}

// ===== Parser =====
var parser = PEG.buildParser(
  'table "table" =  "\\\\select_{" condition "}"\n' +
  'condition "condition" = "a"\n'
);

function passToParser(string) {
  var answer;
  try {
    answer = parser.parse(string.replace(/ /g,''));
  }
  catch (err) {
    return err.message;
  }
  return answer;
}

// ===== React classes =====
// ----- TerminalEmulator -----
var TerminalEmulator = React.createClass({
  getInitialState: function() {
    return {
      commands: getDefaultCommandData(),
      currentInput: "",
      color: "#0f0"
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
      console.log(currDiff);
      console.log(raCommands[i]);
      console.log("dist: " + currDistFromCorrect);

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

  autoComplete: function(raComm) {
    console.log("this is autocomplete: " + raComm);
    //raComm = raComm.substring(1);
    var raCommands = ["project_{", "join", "select_{", "cross", "union", "diff", "intersect", "rename_{"];
    for (var i = 0; i < raCommands.length; i++) {
      if (raCommands[i].charAt(0) == raComm.charAt(0)) {
        return raCommands[i];
      }
    }
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
      } else if (this.colourNameToHex(this.state.currentInput)) {
        this.setState({currentInput: "", color: this.colourNameToHex(this.state.currentInput)});
      } else {
        var newCommands = this.state.commands.concat([{query: this.state.currentInput, result: "sample result"}]);
        this.setState({commands: newCommands, currentInput: ""});
      }
    } else if (e.keyCode == TAB) {
        e.preventDefault();
        /*var tabIndex = this.findPlaceOfTab(this.state.currentInput);
        var toBeCompleted = this.state.currentInput.substring(tabIndex + 1);
        console.log(toBeCompleted);
        var raCommand = this.autoComplete(toBeCompleted)
        if (raCommand == false) {
          raCommand = toBeCompleted;
        }
        this.setState({currentInput: this.state.currentInput.substring(0, tabIndex) + "\\" + raCommand});*/
        var tabIndex = this.findPlaceOfTab(this.state.currentInput);
        var toBeCompleted = this.state.currentInput.substring(tabIndex);
        console.log(toBeCompleted);
        var raCommand = this.autocorrect(toBeCompleted);
        this.setState({currentInput: this.state.currentInput.substring(0, tabIndex) + "\\" + raCommand});
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
      renderedLines.push(<QueryResultPair query={x.query} result={x.result} color={color} />);
    });
    renderedLines.push(<CurrentInput input={this.state.currentInput} color={color}/>);

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
  }
});

// ----- TreeNode -----
var TreeNode = React.createClass({
  setBlueFill: function(evt) {
    evt.target.setAttribute('fill', 'blue');
  },

  setGreenFill: function(evt) {
    evt.target.setAttribute('fill', 'green');
  },

  editNode: function() {
    console.log("hi");
  },

  render: function() {
    var rect = <rect className="noderect" width="16" height="16" fill="blue" x={this.props.x} y={this.props.y}></rect>;
    var circle = <circle className={this.props.showCircle ? "ghostCircle show" : "ghostCircle noshow"} r="30" cx={this.props.x + 8} cy={this.props.y + 8} opacity="0.2" fill="blue" onMouseOver={this.setGreenFill} onMouseOut={this.setBlueFill} onMouseUp={this.editNode}></circle>;
    var text = <text className="nodelabel" x={this.props.x + 20} y={this.props.y + 13}>{this.props.name}</text>;
    return <g>{rect}{text}{circle}</g>;
  }
});

// ----- TreeLink -----
var TreeLink = React.createClass({
  render: function() {
    return <line className="link" x1={this.props.source.x+8} y1={this.props.source.y+16} x2={this.props.target.x+8} y2={this.props.target.y}></line>;
  }
});

// ----- Prenode -----
var Prenode = React.createClass({
  getInitialState: function() {
    return {
      x: this.props.x0,
      y: this.props.y0,
      xOffset: 0,
      yOffset: 0
    }
  },

  moveElement: function(evt) {
    var newstate = {
      x: evt.clientX - this.state.xOffset,
      y: evt.clientY - this.state.yOffset
    };
    this.setState(newstate);
  },

  resetElement: function() {
    this.setState({
      x: this.props.x0,
      y: this.props.y0
    })
  },

  startDrag: function(evt) {
    this.setState({
      xOffset: evt.clientX - this.state.x,
      yOffset: evt.clientY - this.state.y
    });
    this.props.setDragHandlers({
      moveElement: this.moveElement,
      resetElement: this.resetElement
    });
  },

  render: function() {
    var rect = <rect className="noderect" width="16" height="16" fill="blue" x={this.state.x} y={this.state.y}></rect>;
    var text = <text className="nodelabel" x={this.state.x + 20} y={this.state.y + 13}>{this.props.name}</text>;
    return <g className={this.props.dragging ? "draggable nopointer" : "draggable yespointer"} onMouseDown={this.startDrag}>{rect}{text}</g>;
  }
});

// ----- RaTree -----
var RaTree = React.createClass({ 
  getInitialState: function() {
    return {
      moveElement: null,
      tree: {
        name: "—",
        selected: false,
        children: [
          {
            name: "\\select_{name='Billπ'}",
            selected: false,
            children: [
              {
                name: "Drinker",
                selected: false,
                children: []
              }
            ]
          },
          {
            name: "\\select_{name='John'}",
            selected: true,
            children: [
              {
                name: "Drinker",
                selected: false,
                children: []
              }
            ]
          }
        ]
      },
      prenodes: [
        {
          name: "\\project",
          x0: 0,
          y0: 400,
          x: 0,
          y: 400
        },
        {
          name: "\\join",
          x0: 0,
          y0: 450,
          x: 0,
          y: 450
        },
        {
          name: "\\cross",
          x0: 0,
          y0: 500,
          x: 0,
          y: 500
        }
      ]
    };
  },

  setDragHandlers: function(dragHandlers) {
    this.setState({
      moveElement: dragHandlers.moveElement,
      resetElement: dragHandlers.resetElement
    });
  },

  endDrag: function() {
    this.state.resetElement();
    this.setDragHandlers({
      moveElement: null,
      resetElement: null
    });
  },

  render: function() {
    var me = this;
    var tree = d3.layout.tree().size([300, 300]);
    var nodes = tree.nodes(this.state.tree);
    var links = tree.links(nodes);

    var renderedNodes = nodes.map(function(node) {
      return <TreeNode x={node.x} y={node.y} name={node.name} showCircle={me.state.moveElement ? true : false} />;
    });

    var renderedLinks = links.map(function(link) {
      return <TreeLink source={link.source} target={link.target} />;
    });

    var i = -1;
    var renderedPrenodes = this.state.prenodes.map(function(prenode) {
      i++;
      return <Prenode name={prenode.name} x0={0} y0={i * 50 + 400} setDragHandlers={me.setDragHandlers} dragging={me.state.moveElement ? true : false}/>;
    });

    var svg = <svg id="mysvg" width="400" height="600" onMouseMove={this.state.moveElement ? this.state.moveElement : null} onMouseUp={this.endDrag}>{renderedNodes}{renderedLinks}{renderedPrenodes}</svg>;
    return svg;
  }
});

// ===== React render statements =====
React.render(
  <TerminalEmulator />,
  document.getElementById('leftpane')
);

React.render(
  <RaTree />,
  document.getElementById('rightpane')
);
