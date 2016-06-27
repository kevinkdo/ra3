import * as React from "react";
import * as ReactDOM from "react-dom";
import { Const } from "./constants.tsx";
import { TerminalEmulator} from "./TerminalEmulator.tsx";
import { RATree } from "./RATree.tsx"; 

// ===== React render statements =====

var terminal = ReactDOM.render(
  <TerminalEmulator />,
  document.getElementById('leftpane')
) as TerminalEmulator;

ReactDOM.render(
  <RATree setTerminalInput={terminal.setInput} getTerminalInput={terminal.getInput} />,
  document.getElementById('rightpane')
);
