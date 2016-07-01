import * as React from "react";
import * as ReactDOM from "react-dom";
import { ASTRunResult } from "./ast_interpreter.ts";
import { ResultTable } from "./ResultTable.tsx";
import { Globals } from "./globals.tsx";

export class QueryResultPair extends React.Component<{query: string, color: string, result: ASTRunResult}, {}> {
  render() {
    var result = this.props.result;

    if (result.isError) {
      var html = <span key={Globals.nodeId++}>{result.error_message}{"\n"}</span>;
    } else {
      var html = <span key={Globals.nodeId++}><ResultTable parsed={result}/></span>;
    }

    return <div><span><span className="raprompt" style={{color: this.props.color}}>ra&gt; </span>{this.props.query}</span><div>{html}</div></div>;
  }
};