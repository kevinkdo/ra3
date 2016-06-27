import * as React from "react";
import * as ReactDOM from "react-dom";

export interface TreeLinkProps {
  source: {
    x?: number,
    y?: number
  },
  target: {
    x?: number,
    y?: number
  }
}

export class TreeLink extends React.Component<TreeLinkProps, {}> {
  render() {
    return <line className="link" x1={this.props.source.x+8} y1={this.props.source.y+16} x2={this.props.target.x+8} y2={this.props.target.y}></line>;
  }
}