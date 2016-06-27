import * as React from "react";
import * as ReactDOM from "react-dom";

export interface PrenodeProps {
  startDrag: (o: {
    sourceId: number,
    xOffset: number,
    yOffset: number
  })=>void,
  id: number,
  name: string,
  x: number,
  y: number,
  dragging: boolean
}

export class Prenode extends React.Component<PrenodeProps, {}> {
  handleMouseDown = (evt: MouseEvent) => {
    this.props.startDrag({
      sourceId: this.props.id,
      xOffset: evt.clientX - this.props.x,
      yOffset: evt.clientY - this.props.y
    });
  }

  render() {
    var rect = <rect width="16" height="16" fill="#5bc0de" x={this.props.x} y={this.props.y}></rect>;
    var text = <text className="nodelabel" x={this.props.x + 20} y={this.props.y + 13}>{this.props.name}</text>;
    return <g className={this.props.dragging ? "draggable nopointer" : "draggable yespointer"} onMouseDown={this.handleMouseDown}>{rect}{text}</g>;
  }
};