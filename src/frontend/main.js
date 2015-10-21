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

var nodeId = 100;

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
      } else if (this.state.currentInput == "help") {
        var newCommands = this.state.commands.concat([{query: this.state.currentInput, result: shortHelpMessage}]);
        this.setState({commands: newCommands, currentInput: ""});
      } else if (this.state.currentInput == "help --verbose") {
        var newCommands = this.state.commands.concat([{query: this.state.currentInput, result: longHelpMessage}]);
        this.setState({commands: newCommands, currentInput: ""});
      } else if (this.colourNameToHex(this.state.currentInput)) {
        this.setState({currentInput: "", color: this.colourNameToHex(this.state.currentInput)});
      } else {
        var newCommands = this.state.commands.concat([{query: this.state.currentInput, result: "sample result"}]);
        this.setState({commands: newCommands, currentInput: ""});
      }
    } else if (e.keyCode == TAB) {
        e.preventDefault();
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

  handleMouseOver: function(evt) {
    this.setGreenFill(evt);
    this.props.setTargetId(this.props.id);
  },

  handleMouseOut: function(evt) {
    this.setBlueFill(evt);
    this.props.setTargetId(0);
  },

  handleClick: function(evt) {
    if (this.props.numChildren > 0) {
      this.props.setText(this.props.id, prompt("Enter a new subscript: ", this.props.subscript));
    } else {
      this.props.setText(this.props.id, prompt("Enter a new name: ", this.props.name));
    }
  },

  render: function() {
    var marker = this.props.subscriptable ?
      <rect className="noderect" width="16" height="16" fill={this.props.numChildren > 0 || this.props.name.length > 0 ? "blue" : "red"} x={this.props.x} y={this.props.y} onClick={!this.props.dragging ? this.handleClick : null} /> :
      <circle className="nodecirc" r="8" fill={this.props.numChildren > 0 || this.props.name.length > 0 ? "blue" : "red"} cx={this.props.x+8} cy={this.props.y+8} onClick={!this.props.dragging && this.props.numChildren == 0 ? this.handleClick : null} />;
    var circle = <circle className={this.props.dragging ? "ghostCircle show" : "ghostCircle noshow"} r="30" cx={this.props.x + 8} cy={this.props.y + 8} opacity="0.2" fill="blue" onMouseOver={this.handleMouseOver} onMouseOut={this.setBlueFill} onMouseOut={this.handleMouseOut} />;
    var text = <text className="nodelabel" x={this.props.x + 20} y={this.props.y + 13}>{this.props.name}</text>;
    var subscript = <text className="nodesubscript" x={this.props.x + 28} y={this.props.y + 20}>{this.props.subscript}</text>;
    return <g>{marker}{text}{subscript}{circle}</g>;
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
  handleMouseDown: function(evt) {
    this.props.setDragState({
      sourceId: this.props.id,
      xOffset: evt.clientX - this.props.x,
      yOffset: evt.clientY - this.props.y
    });
  },

  render: function() {
    var rect = <rect className="noderect" width="16" height="16" fill="blue" x={this.props.x} y={this.props.y}></rect>;
    var text = <text className="nodelabel" x={this.props.x + 20} y={this.props.y + 13}>{this.props.name}</text>;
    return <g className={this.props.dragging ? "draggable nopointer" : "draggable yespointer"} onMouseDown={this.handleMouseDown}>{rect}{text}</g>;
  }
});

// ----- RaTree -----
var RaTree = React.createClass({ 
  getInitialState: function() {
    return {
      targetId: 0,
      sourceId: 0,
      xOffset: 0,
      yOffset: 0,
      tree: {
        name: "\u00d7",
        id: 1,
        subscriptable: false,
        children: [
          {
            name: "\u03c3",
            id: 2,
            subscriptable: true,
            children: [
              {
                name: "Drinker",
                id: 3,
                subscriptable: false,
                children: []
              }
            ]
          },
          {
            name: "\u03c3",
            id: 4,
            subscriptable: true,
            children: [
              {
                name: "Drinker",
                id: 5,
                subscriptable: false,
                children: []
              }
            ]
          }
        ]
      },
      prenodes: [
        {
          name: "\u03c3",
          id: 12,
          numchildren: 1,
          subscriptable: true,
          x0: 0,
          y0: 0,
          x: 0,
          y: 0
        },
        {
          name: "\u03C0",
          id: 10,
          numchildren: 1,
          subscriptable: true,
          x0: 0,
          y0: 20,
          x: 0,
          y: 20
        },
        {
          name: "\u00d7",
          id: 11,
          numchildren: 2,
          subscriptable: false,
          x0: 0,
          y0: 40,
          x: 0,
          y: 40
        },
        {
          name: "\u22c8",
          id: 13,
          numchildren: 2,
          subscriptable: true,
          x0: 0,
          y0: 60,
          x: 0,
          y: 60
        },
        {
          name: "\u222a",
          id: 14,
          numchildren: 2,
          subscriptable: false,
          x0: 0,
          y0: 80,
          x: 0,
          y: 80
        },
        {
          name: "\u2212",
          id: 15,
          numchildren: 2,
          subscriptable: false,
          x0: 0,
          y0: 100,
          x: 0,
          y: 100
        },
        {
          name: "\u2229",
          id: 16,
          numchildren: 2,
          subscriptable: false,
          x0: 0,
          y0: 120,
          x: 0,
          y: 120
        },
        {
          name: "\u03c1",
          id: 17,
          numchildren: 1,
          subscriptable: true,
          x0: 0,
          y0: 140,
          x: 0,
          y: 140
        }
      ]
    };
  },

  setTargetId: function(targetId) {
    this.setState({
      targetId: targetId
    });
  },

  setDragState: function(dragState) {
    this.setState({
      sourceId: dragState.sourceId,
      xOffset: dragState.xOffset,
      yOffset: dragState.yOffset
    });
  },

  handleMouseMove: function(evt) {
    var me = this;
    var clientX = evt.clientX;
    var clientY = evt.clientY;
    this.setState(function(state, props) {
      state.prenodes.forEach(function(prenode) {
        if (prenode.id == state.sourceId) {
          prenode.x = clientX - state.xOffset;
          prenode.y = clientY - state.yOffset;
        }
      });
      return state;
    });
  },

  handleMouseUp: function() {
    this.setState(function(state, props) {
      var newName = "";
      var numChildren = 0;
      var subscriptable = false;
      state.prenodes.forEach(function(prenode) {
          prenode.x = prenode.x0;
          prenode.y = prenode.y0;
          if (prenode.id == state.sourceId) {
            newName = prenode.name;
            numChildren = prenode.numchildren;
            subscriptable = prenode.subscriptable;
          }
      });

      var traverse = function(node) {
        if (node.id == state.targetId) {
          node.name = newName;
          node.children = [];
          node.subscriptable = subscriptable;
          for (var i = 0; i < numChildren; i++) {
            node.children.push({
              name: "",
              id: nodeId++,
              children: [],
              subscriptable: false
            });
          }
        }
        else if (node.children) {
          node.children.forEach(traverse);
        }
      };

      traverse(state.tree);
      state.sourceId = 0;
      state.targetId = 0;
      return state;
    });
  },

  setText(targetId, string) {
    this.setState(function(state, props) {
      var traverse = function(node) {
        if (node.id == targetId) {
          if (node.children && node.children.length > 0) {
            node.subscript = string;
          }
          else {
            node.name = string;
          }
        }
        else if (node.children) {
          node.children.forEach(traverse);
        }
      };
      traverse(state.tree);
      return state;
    });
  },

  render: function() {
    var me = this;
    var width = document.getElementById('rightpane').clientWidth;
    var height = document.getElementById('rightpane').clientHeight;
    var tree = d3.layout.tree().size([width*5/6, height*5/6]).separation(function(a, b) {return (a.parent == b.parent ? 2 : 1);});
    var nodes = tree.nodes(this.state.tree);
    var links = tree.links(nodes);
    var renderedNodes = nodes.map(function(node) {
      return <TreeNode key={node.id} id={node.id} x={node.x} y={node.y} name={node.name} subscriptable={node.subscriptable} numChildren={node.children ? node.children.length : 0} setTargetId={me.setTargetId} setText={me.setText} dragging={me.state.sourceId != 0 ? true : false} subscript={node.subscript} />;
    });

    var renderedLinks = links.map(function(link) {
      return <TreeLink key={nodeId++} source={link.source} target={link.target} />;
    });

    var i = -1;
    var renderedPrenodes = this.state.prenodes.map(function(prenode) {
      i++;
      return <Prenode id={prenode.id} key={prenode.id} name={prenode.name} x={prenode.x} y={prenode.y} setDragState={me.setDragState} dragging={me.state.sourceId != 0 ? true : false}/>;
    });

    var svg = <svg id="mysvg" width={width} height={height} onMouseMove={me.state.sourceId != 0 ? this.handleMouseMove : null} onMouseUp={me.state.sourceId != 0 ? this.handleMouseUp : null}>{renderedNodes}{renderedLinks}{renderedPrenodes}</svg>;
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
