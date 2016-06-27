import * as React from "react";
import * as ReactDOM from "react-dom";
import { ASTRunResult } from "./parser.ts";
import { ResultTable } from "./ResultTable.tsx";
import { Globals } from "./globals.tsx";

export class QueryStringPair extends React.Component<{query: string, color: string, result: string}, {}> {
  render() {
    var result = this.props.result;
    var html = <span key={Globals.nodeId++}>{"\n"}{result}{"\n"}</span>;
    return <div><span><span className="raprompt" style={{color: this.props.color}}>ra&gt; </span>{this.props.query}</span><div>{html}</div></div>;
  }
};