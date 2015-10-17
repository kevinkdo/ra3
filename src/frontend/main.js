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

// ===== (Global) Parser =====
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
var ExampleApplication = React.createClass({
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

var CurrentInput = React.createClass({
  render: function() {
    var obj = {color: this.props.color, background: "#fff"};
    return <span><span id = "raprompt" style={obj}>ra&gt; </span>{this.props.input}</span>;
  }
});

var QueryResultPair = React.createClass({
  render: function() {

    return <span><span className="raprompt" style={{color: this.props.color}}>ra&gt; </span>{this.props.query}{"\n"}{this.props.result}{"\n"}</span>;
  }
});


// ===== React render statements =====
React.render(
  <ExampleApplication />,
  document.getElementById('leftpane')
);







// ===== Right pane =====
var d3Tree = {};

d3Tree.create = function(el, state) {
  this.svg = d3.select(el).append('svg')
      .attr('class', 'd3')
      .attr('width', 400)
      .attr('height', 600)
      .attr('margin', 20);

  this.update(el, state);
};

d3Tree.update = function(el, state) {
  var tree = d3.layout.tree().size([300, 300]);
  var diagonal = d3.svg.diagonal();
  var line = d3.svg.line().x(function(d) { return d.x; })
    .y(function(d) { return d.y; })
    .interpolate("basis");
  var nodes = tree.nodes(state);

  var selectedNode = null;
  var draggingNode = null;

  dragListener = d3.behavior.drag()
    .on("dragstart", function(d) {
        dragStarted = true;
        nodes = tree.nodes(d);
        d3.event.sourceEvent.stopPropagation();
        // it's important that we suppress the mouseover event on the node being dragged. Otherwise it will absorb the mouseover event and the underlying node will not detect it d3.select(this).attr('pointer-events', 'none');
    })
    .on("drag", function(d) {
        if (dragStarted) {
            domNode = this;
            //initiateDrag(d, domNode);
        }
        d.x += d3.event.dx;
        d.y += d3.event.dy;
        var node = d3.select(this);
        node.attr("transform", "translate(" + d.x + "," + d.y + ")");
    }).on("dragend", function(d) {
        domNode = this;
    });

  var nodeEnter = this.svg.selectAll(".node")
    .data(nodes)
    .enter().append("svg:g")
    .call(dragListener)
    .attr("class", "node")
    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

  nodeEnter.append("svg:rect")
    .attr("width", 10)
    .attr("height", 10)
    .style("fill", function(d) { return d.selected ? "green" : "blue"});

  nodeEnter.append("svg:text")
    .attr("x", 15)
    .attr("dy", "1em")
    .text(function(d) { return d.name; });

  var link = this.svg.selectAll("path.link")
    .data(tree.links(nodes))
    .enter().append("svg:g")
    .attr("class", "link");

  link.append("line")
    .attr("class", "link")
    .attr("x1", function(d) { return d.source.x + 5; })
    .attr("y1", function(d) { return d.source.y + 10; })
    .attr("x2", function(d) { return d.target.x + 5; })
    .attr("y2", function(d) { return d.target.y; });
};

d3Tree.destroy = function(el) {};

var Tree = React.createClass({
  componentDidMount: function() {
    var el = this.getDOMNode();
    d3Tree.create(el, this.state.d3treestate);
  },

  componentDidUpdate: function() {
    var el = this.getDOMNode();
    d3Chart.update(el, this.state.d3treestate);
  },

  componentWillUnmount: function() {
    var el = this.getDOMNode();
    d3Chart.destroy(el);
  },

  getInitialState: function() {
    return {
        d3treestate: {
          name: "—",
          selected: false,
          children: [
            {
              name: "select_{name='Billπ'}",
              selected: true,
              children: [
                {
                  name: "Drinker",
                  children: []
                }
              ]
            },
            {
              name: "select_{name='John'}",
              selected: false,
              children: [
                {
                  name: "Drinker",
                  children: []
                }
              ]
            }
          ]
        }
    };
  },

  render: function() {
    return <div><br /><div className="tree"></div></div>;
  }
});

React.render(
  <Tree />,
  document.getElementById('rightpane')
);

