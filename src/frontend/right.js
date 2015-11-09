// ----- TreeNode -----
var TreeNode = React.createClass({
  setBlueFill: function(evt) {
    evt.target.setAttribute('fill', this.isValid() ? "#5bc0de" : "#d9534f");
  },

  setGreenFill: function(evt) {
    evt.target.setAttribute('fill', '#5cb85c');
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
    if (this.props.selecting) {
      this.props.serializeId(this.props.id);
    } else {
      if (this.props.numChildren > 0) {
        this.props.setText(this.props.id, prompt("Enter a new subscript: ", this.props.subscript) || this.props.subscript);
      } else {
        this.props.setText(this.props.id, prompt("Enter a new name: ", this.props.name) || this.props.name);
      }
    }
  },

  isValid: function() {
    return !((this.props.numChildren == 0 && this.props.name.length == 0)
      || (this.props.subscriptRequired && this.props.subscript.length == 0));
  },

  render: function() {
    var marker = this.props.subscriptable ?
      <rect width="16" height="16" fill={this.isValid() ? "#5bc0de" : "#d9534f"} x={this.props.x} y={this.props.y} onClick={this.props.dragging ? null : this.handleClick} /> :
      <circle r="8" fill={this.isValid() ? "#5bc0de" : "#d9534f"} cx={this.props.x+8} cy={this.props.y+8} onClick={(!this.props.dragging && this.props.numChildren == 0) || this.props.selecting ? this.handleClick : null} />;
    var circle = <circle className={this.props.dragging ? "ghostCircle show" : "ghostCircle noshow"} r="30" cx={this.props.x + 8} cy={this.props.y + 8} opacity="0.4" fill={this.isValid() ? "#5bc0de" : "#d9534f"} onMouseOver={this.handleMouseOver} onMouseOut={this.setBlueFill} onMouseOut={this.handleMouseOut} />;
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
    this.props.startDrag({
      sourceId: this.props.id,
      xOffset: evt.clientX - this.props.x,
      yOffset: evt.clientY - this.props.y
    });
  },

  render: function() {
    var rect = <rect width="16" height="16" fill="#5bc0de" x={this.props.x} y={this.props.y}></rect>;
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
      selecting: false,
      tree: {
        name: "\u00d7",
        id: 1,
        subscriptable: false,
        subscriptRequired: false,
        subscript: "",
        children: [
          {
            name: "\u03c3",
            id: 2,
            subscriptable: true,
            subscriptRequired: true,
            subscript: "",
            children: [
              {
                name: "Drinker",
                id: 3,
                subscriptable: false,
                subscriptRequired: false,
                subscript: "",
                children: []
              }
            ]
          },
          {
            name: "\u03c3",
            id: 4,
            subscriptable: true,
            subscriptRequired: true,
            subscript: "",
            children: [
              {
                name: "Drinker",
                id: 5,
                subscriptable: false,
                subscriptRequired: false,
                subscript: "",
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
          subscriptRequired: true,
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
          subscriptRequired: true,
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
          subscriptRequired: false,
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
          subscriptRequired: false,
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
          subscriptRequired: false,
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
          subscriptRequired: false,
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
          subscriptRequired: false,
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
          subscriptRequired: true,
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

  startDrag: function(dragState) {
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
      var subscriptRequired = false;
      state.prenodes.forEach(function(prenode) {
          prenode.x = prenode.x0;
          prenode.y = prenode.y0;
          if (prenode.id == state.sourceId) {
            newName = prenode.name;
            numChildren = prenode.numchildren;
            subscriptable = prenode.subscriptable;
            subscriptRequired = prenode.subscriptRequired;
          }
      });

      var traverse = function(node) {
        if (node.id == state.targetId) {
          node.name = newName;
          node.children = [];
          node.subscriptable = subscriptable;
          node.subscriptRequired = subscriptRequired;
          node.subscript = "";
          for (var i = 0; i < numChildren; i++) {
            node.children.push({
              name: "",
              id: nodeId++,
              children: [],
              subscriptable: false,
              subscriptRequired: false,
              subscript: ""
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

  setText: function(targetId, string) {
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

  serialize: function(root) {
    var mapping = {
      "\u03c3": "\\select",
      "\u03C0": "\\project",
      "\u00d7": "\\cross",
      "\u22c8": "\\join",
      "\u222a": "\\union",
      "\u2212": "\\diff",
      "\u2229": "\\intersect",
      "\u03c1": "\\rename"
    };
    var serializeNode = function(node) {
      if (!node.children || node.children.length == 0) {
        return node.name;
      }

      if (node.children.length == 1) {
        return mapping[node.name]
          + (node.subscriptable && node.subscript ? "_{" + node.subscript + "}" : "")
          + " (" + serializeNode(node.children[0]) + ")";
      }

      if (node.children.length == 2) {
        return "(" + serializeNode(node.children[0]) + ") " + mapping[node.name]
          + (node.subscriptable && node.subscript ? "_{" + node.subscript + "}" : "")
          + " (" + serializeNode(node.children[1]) + ")";
      }
    };
    return serializeNode(root) + ";";
  },

  getHelpText: function() {
    return this.state.sourceId != 0 ? "Drag onto a target circle" :
      this.state.selecting ? "Select a node to serialize" :
      "Drag pre-built nodes or click to edit";
  },

  serializeId: function(id) {
    var me = this;
    var traverse = function(node) {
      if (node.id == id) {
        me.props.setTerminalInput(me.serialize(node));
      }
      else if (node.children) {
        node.children.forEach(traverse);
      }
    };
    traverse(me.state.tree);
    this.setState({selecting: false});
  },

  render: function() {
    var me = this;
    var width = document.getElementById('rightpane').clientWidth;
    var height = document.getElementById('rightpane').clientHeight - 100;//TODO remove constant?
    var tree = d3.layout.tree().size([width*5/6, height*5/6]).separation(function(a, b) {return (a.parent == b.parent ? 2 : 1);});
    var nodes = tree.nodes(this.state.tree);
    var links = tree.links(nodes);
    var renderedNodes = nodes.map(function(node) {
      return <TreeNode key={node.id} id={node.id} x={node.x} y={node.y} name={node.name} subscriptable={node.subscriptable} subscriptRequired={node.subscriptRequired} numChildren={node.children ? node.children.length : 0} setTargetId={me.setTargetId} setText={me.setText} dragging={me.state.sourceId != 0 ? true : false} selecting={me.state.selecting} subscript={node.subscript} serializeId={me.serializeId}/>;
    });

    var renderedLinks = links.map(function(link) {
      return <TreeLink key={nodeId++} source={link.source} target={link.target} />;
    });

    var i = -1;
    var renderedPrenodes = this.state.prenodes.map(function(prenode) {
      i++;
      return <Prenode id={prenode.id} key={prenode.id} name={prenode.name} x={prenode.x} y={prenode.y} startDrag={me.startDrag} dragging={me.state.sourceId != 0 ? true : false}/>;
    });

    var button1 = <button type="button" className="btn btn-default" type="button" onClick={function() {me.props.setTerminalInput(me.serialize(me.state.tree))}}>Generate query</button>;
    var button2 = <button type="button" className="btn btn-default" type="button" onClick={function() {me.setState({selecting: true});}}>Generate subquery</button>;
    var toolbar = [button1, button2];

    var helpText = <div className="helpText">{me.getHelpText()}</div>;

    var svg = <svg id="mysvg" width={width} height={height} onMouseMove={me.state.sourceId != 0 ? this.handleMouseMove : null} onMouseUp={me.state.sourceId != 0 ? this.handleMouseUp : null}>{renderedNodes}{renderedLinks}{renderedPrenodes}</svg>;
    return <div><div className="btn-group" id="toolbar">{toolbar}</div><br /><br />{svg}{helpText}</div>;
  }
});
