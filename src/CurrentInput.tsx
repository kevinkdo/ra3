import * as React from "react";
import * as ReactDOM from "react-dom";

export class CurrentInput extends React.Component<{input: string, color: string}, {}> {
  render() {
    var obj = {color: this.props.color, background: "#fff"};
    return <span><span id = "raprompt" style={obj}>ra&gt; </span>{this.props.input}</span>;
  }
};
