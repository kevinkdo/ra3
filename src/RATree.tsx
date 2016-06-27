import * as React from "react";
import * as ReactDOM from "react-dom";
import { Globals } from "./globals.tsx";
import { Const } from "./constants.tsx";
import { TreeNode } from "./TreeNode.tsx";
import { TreeLink } from "./TreeLink.tsx";
import { Prenode } from "./Prenode.tsx";

var ra_parser = require("!pegjs!./ra.pegjs");

export interface RATreeProps {
  setTerminalInput: (s:string)=>void,
  getTerminalInput: ()=>string
}

export interface RATreeState {
  targetId: number,
  sourceId: number,
  xOffset: number,
  yOffset: number,
  selecting: boolean,
  tree: RATreeNode,
  prenodes: Array<PrenodeState>
}

export interface PrenodeState {
  name: string,
  id: number,
  x0: number,
  y0: number,
  x: number,
  y: number
}

export interface RATreeNode {
  name: string,
  id: number,
  subscript: string,
  children: Array<RATreeNode>
}

export interface D3Node {
  name: string,
  id: number,
  subscript: string,
  children: Array<RATreeNode>,
  x: number,
  y: number
}

export interface DragState {
  sourceId: number,
  xOffset: number,
  yOffset: number
}

export class RATree extends React.Component<RATreeProps, RATreeState> {
    constructor(props: any) {
    super(props);
    this.state = {
      targetId: 0,
      sourceId: 0,
      xOffset: 0,
      yOffset: 0,
      selecting: false,
      tree: {
        name: "\u2212",
        id: 1,
        subscript: "",
        children: [
          {
            name: "\u03C0",
            id: 2,
            subscript: "bar,beer",
            children: [
              {
                name: "Serves",
                id: 3,
                subscript: "",
                children: []
              }
            ]
          },
          {
            name: "\u03C0",
            id: 4,
            subscript: "bar1,beer1",
            children: [
              {
                name: "\u22c8",
                id: 5,
                subscript: "beer1=beer2 and price1>price2",
                children: [
                  {
                    name: "\u03c1",
                    id: 6,
                    subscript: "bar1,beer1,price1",
                    children: [
                      {
                        name: "Serves",
                        id: 7,
                        subscript: "",
                        children: [] as Array<RATreeNode>
                      }
                    ]
                  },
                  {
                    name: "\u03c1",
                    id: 8,
                    subscript: "bar2,beer2,price2",
                    children: [
                      {
                        name: "Serves",
                        id: 9,
                        subscript: "",
                        children: []
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      prenodes: [
        {
          name: "\u03c3",
          id: 12,
          x0: 0,
          y0: 0,
          x: 0,
          y: 0
        },
        {
          name: "\u03C0",
          id: 10,
          x0: 0,
          y0: 20,
          x: 0,
          y: 20
        },
        {
          name: "\u00d7",
          id: 11,
          x0: 0,
          y0: 40,
          x: 0,
          y: 40
        },
        {
          name: "\u22c8",
          id: 13,
          x0: 0,
          y0: 60,
          x: 0,
          y: 60
        },
        {
          name: "\u222a",
          id: 14,
          x0: 0,
          y0: 80,
          x: 0,
          y: 80
        },
        {
          name: "\u2212",
          id: 15,
          x0: 0,
          y0: 100,
          x: 0,
          y: 100
        },
        {
          name: "\u2229",
          id: 16,
          x0: 0,
          y0: 120,
          x: 0,
          y: 120
        },
        {
          name: "\u03c1",
          id: 17,
          x0: 0,
          y0: 140,
          x: 0,
          y: 140
        }
      ]
    };
  }

  setTargetId = (targetId: number) => {
    this.setState(prevState => {
      prevState.targetId = targetId;
      return prevState;
    });
  }

  startDrag = (dragState: DragState) => {
    this.setState(prevState => {
      prevState.sourceId = dragState.sourceId;
      prevState.xOffset = dragState.xOffset;
      prevState.yOffset = dragState.yOffset;
      return prevState;
    });
  }

  handleMouseMove = (evt: MouseEvent) => {
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
  }

  handleMouseUp = () => {
    this.setState(function(state, props) {
      var newName = "";
      state.prenodes.forEach(function(prenode) {
          prenode.x = prenode.x0;
          prenode.y = prenode.y0;
          if (prenode.id == state.sourceId) {
            newName = prenode.name;
          }
      });

      var traverse = function(node: RATreeNode) {
        if (node.id == state.targetId) {
          node.name = newName;
          node.children = [];
          node.subscript = "";
          for (var i = 0; i < Globals.numChildren(newName); i++) {
            node.children.push({
              name: "",
              id: Globals.nodeId++,
              children: [],
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
  }

  setText = (targetId: number, str: string) => {
    this.setState(function(state, props) {
      var traverse = function(node: RATreeNode) {
        if (node.id == targetId) {
          if (node.children && node.children.length > 0) {
            node.subscript = str;
          }
          else {
            node.name = str;
          }
        }
        else if (node.children) {
          node.children.forEach(traverse);
        }
      };
      traverse(state.tree);
      return state;
    });
  }

  serialize = (root: RATreeNode) => {
    var serializeNode = function(node: RATreeNode): string {
      if (!node.children || node.children.length == 0) {
        return node.name;
      }

      if (node.children.length == 1) {
        return Const.mapping[node.name]
          + (Globals.subscriptable(node.name) && node.subscript ? "_{" + node.subscript + "}" : "")
          + " (" + serializeNode(node.children[0]) + ")";
      }

      if (node.children.length == 2) {
        return "(" + serializeNode(node.children[0]) + ") " + Const.mapping[node.name]
          + (Globals.subscriptable(node.name) && node.subscript ? "_{" + node.subscript + "}" : "")
          + " (" + serializeNode(node.children[1]) + ")";
      }
    };
    return serializeNode(root) + ";";
  }

  getHelpText = () => {
    return this.state.sourceId != 0 ? "Drag onto a target circle" :
      this.state.selecting ? "Select a node to serialize" :
      "Drag pre-built nodes or click to edit";
  }

  serializeId = (id: number) => {
    var me = this;
    var traverse = function(node: RATreeNode) {
      if (node.id == id) {
        me.props.setTerminalInput(me.serialize(node));
      }
      else if (node.children) {
        node.children.forEach(traverse);
      }
    };
    traverse(me.state.tree);
    this.setState(prevState => {
      prevState.selecting = false;
      return prevState;
    });
  }

  postProcess = (tree: RATreeNode) => {
    var traverse = function(node: RATreeNode) {
      node.id = Globals.nodeId++;
      if (Const.mapping[node.name] != undefined) {
        node.name = Const.mapping[node.name];
      }
      if (node.children) {
        node.children.forEach(traverse);
      }
    };

    traverse(tree);
    return tree;
  }

  generateTree = () => {
    var me = this;
    var text = this.props.getTerminalInput();
    if (text.length == 0) return;
    var tree = ra_parser.parse(text);
    this.setState(prevState => {
      prevState.tree = me.postProcess(tree);
      return prevState;
    });
  }

  setSelectingTrue = () => {
    this.setState(prevState => {
      prevState.selecting = true;
      return prevState;
    });
  }

  render() {
    var me = this;
    var width = document.getElementById('rightpane').clientWidth;
    var height = document.getElementById('rightpane').clientHeight - 150;
    var tree = d3.layout.tree().size([width*5/6, height*5/6]).separation(function(a, b) {return (a.parent == b.parent ? 2 : 1);});
    var nodes = tree.nodes(this.state.tree) as Array<D3Node>;
    var links = tree.links(nodes);

    var renderedNodes = nodes.map(function(node) {
      return <TreeNode key={node.id} id={node.id} x={node.x} y={node.y} name={node.name} numChildren={node.children ? node.children.length : 0} setTargetId={me.setTargetId} setText={me.setText} dragging={me.state.sourceId != 0 ? true : false} selecting={me.state.selecting} subscript={node.subscript} serializeId={me.serializeId}/>;
    });
    var renderedLinks = links.map(function(link) {
      return <TreeLink key={Globals.nodeId++} source={link.source} target={link.target} />;
    });
    var renderedPrenodes = this.state.prenodes.map(function(prenode) {
      return <Prenode id={prenode.id} key={prenode.id} name={prenode.name} x={prenode.x} y={prenode.y} startDrag={me.startDrag} dragging={me.state.sourceId != 0 ? true : false}/>;
    });

    var button1 = <button key={Globals.nodeId++} type="button" className="btn btn-default" onClick={function() {me.props.setTerminalInput(me.serialize(me.state.tree))}}>Generate query</button>;
    var button2 = <button key={Globals.nodeId++} type="button" className="btn btn-default" onClick={this.setSelectingTrue}>Generate subquery</button>;
    var button3 = <button key={Globals.nodeId++} type="button" className="btn btn-default" onClick={this.generateTree}>Generate tree</button>;
    var toolbar = [button1, button2, button3];
    var helpText = <div className="helpText">{me.getHelpText()}</div>;
    var svg = <svg id="mysvg" width={width} height={height} onMouseMove={me.state.sourceId != 0 ? this.handleMouseMove : null} onMouseUp={me.state.sourceId != 0 ? this.handleMouseUp : null}>{renderedNodes}{renderedLinks}{renderedPrenodes}</svg>;

    return <div><div className="btn-group" id="toolbar">{toolbar}</div>{helpText}<br /><br />{svg}</div>;
  }
};
