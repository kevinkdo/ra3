import * as React from "react";
import * as ReactDOM from "react-dom";
import { ASTRunResult } from "./ast_interpreter.ts";
import { Globals } from "./globals.tsx";

export class ResultTable extends React.Component<{ parsed: ASTRunResult }, {}> {
  render() {
    var colNames = this.props.parsed.columns;
    var renderColName = function(x: string) {return <td key={Globals.nodeId++}>{x}</td>};
    var renderedRows = [<tr key={Globals.nodeId++} >{colNames.map(renderColName)}</tr>];
    this.props.parsed.tuples.forEach(function(x) {
      var renderColVal = function(colName: string) {
        return <td key={Globals.nodeId++}>{x[colName]}</td>;
      };

      renderedRows.push(<tr key={Globals.nodeId++}>{colNames.map(renderColVal)}</tr>);
    });
    return <div><div>{this.props.parsed.tuples.length} rows</div><table className="resultTable"><tbody>{renderedRows}</tbody></table></div>
  }
};