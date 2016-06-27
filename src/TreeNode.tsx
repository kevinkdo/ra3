import * as React from "react";
import * as ReactDOM from "react-dom";
import { Globals } from "./globals.tsx";

export interface TreeNodeProps {
  setTargetId:(x: number)=>void,
  serializeId:(x: number)=>void,
  setText:(targetId: number, str: string)=>void,
  dragging: boolean,
  selecting: boolean,
  id: number,
  x: number,
  y: number,
  numChildren: number,
  subscript: string,
  name: string
}

export class TreeNode extends React.Component<TreeNodeProps, {}> {
  setBlueFill = (evt: MouseEvent) => {
    var target = evt.target as HTMLElement;
    target.setAttribute('fill', this.isValid() ? "#5bc0de" : "#d9534f");
  }

  setGreenFill = (evt: MouseEvent) => {
    var target = evt.target as HTMLElement;
    target.setAttribute('fill', '#5cb85c');
  }

  handleMouseOver = (evt: MouseEvent) => {
    this.setGreenFill(evt);
    this.props.setTargetId(this.props.id);
  }

  handleMouseOut = (evt: MouseEvent) => {
    this.setBlueFill(evt);
    this.props.setTargetId(0);
  }

  handleClick = (evt: MouseEvent) => {
    if (this.props.selecting) {
      this.props.serializeId(this.props.id);
    } else {
      if (this.props.numChildren > 0) {
        this.props.setText(this.props.id, prompt("Enter a new subscript: ", this.props.subscript) || this.props.subscript);
      } else {
        this.props.setText(this.props.id, prompt("Enter a new name: ", this.props.name) || this.props.name);
      }
    }
  }

  isValid = () => {
    return !((this.props.numChildren == 0 && this.props.name.length == 0)
      || (Globals.subscriptRequired(this.props.name) && this.props.subscript.length == 0));
  }

  render() {
    var marker = Globals.subscriptable(this.props.name) ?
      <rect width="16" height="16" fill={this.isValid() ? "#5bc0de" : "#d9534f"} x={this.props.x} y={this.props.y} onClick={this.props.dragging ? null : this.handleClick} /> :
      <circle r="8" fill={this.isValid() ? "#5bc0de" : "#d9534f"} cx={this.props.x+8} cy={this.props.y+8} onClick={(!this.props.dragging && this.props.numChildren == 0) || this.props.selecting ? this.handleClick : null} />;
    var circle = <circle className={this.props.dragging ? "ghostCircle show" : "ghostCircle noshow"} r="30" cx={this.props.x + 8} cy={this.props.y + 8} opacity="0.4" fill={this.isValid() ? "#5bc0de" : "#d9534f"} onMouseOver={this.handleMouseOver} onMouseOut={this.handleMouseOut} />;
    var text = <text className="nodelabel" x={this.props.x + 20} y={this.props.y + 13}>{this.props.name}</text>;
    var subscript = <text className="nodesubscript" x={this.props.x + 28} y={this.props.y + 20}>{this.props.subscript}</text>;
    return <g>{marker}{text}{subscript}{circle}</g>;
  }
}