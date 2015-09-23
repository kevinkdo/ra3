var BACKSPACE = 8;
var ENTER = 13;

function getDefaultCommandData() {
  return [
    {
      query: "\\select_{bar = 'James Joyce Pub'} Frequents;",
      result: "Output schema: (drinker varchar, bar varchar, times_a_week int2)\n"
      + "-----\n"
      + "Eve|James Joyce Pub|2\n"
      + "Dan|James Joyce Pub|1\n"
      + "Amy|James Joyce Pub|2\n"
      + "Ben|James Joyce Pub|1\n"
      + "-----\n"
      + "Total number of rows: 4"
    },
    {
      query: "\\select_{bar = 'Some other pub'} Frequents)",
      result: "drinker1\ndrinker2\ndrinker3"
    }
  ];
}

function scrollDown() {
  document.body.scrollTop = document.body.scrollHeight;
}

var ExampleApplication = React.createClass({
  getInitialState: function() {
    return {
      commands: getDefaultCommandData(),
      currentInput: "this is what I'm typing"
    };
  },

  handleStrangeKeys: function(e) {
    if (e.keyCode == BACKSPACE) {
      //Prevent browser from going back
      e.preventDefault();

      if (this.state.currentInput.length > 0) {
        newCurrentInput = this.state.currentInput.slice(0, -1);
        this.setState({currentInput: newCurrentInput});
      }
    } else if (e.keyCode == ENTER) {
      if (this.state.currentInput.length == 0) {
        var newCommands = this.state.commands.concat([{query: "", result: ""}]);
        this.setState({commands: newCommands, currentInput: ""});
      } else if (this.state.currentInput == "clear") {
        this.setState({commands: [], currentInput: ""});
      } else {
        var newCommands = this.state.commands.concat([{query: this.state.currentInput, result: "Dummy output schema: ()\n-----\n-----\nTotal number of rows: 0"}]);
        this.setState({commands: newCommands, currentInput: ""});
      }
    }

    scrollDown();
  },

  //Annoyingly, onkeypress mostly only works with printable keys (i.e. not backspace)
  handlePrintableKeys: function(e) {
    if (e.keyCode < 32 || e.keyCode > 126) {
      return;
    }

    var keyCode = e.keyCode;
    var newCurrentInput;
    newCurrentInput = this.state.currentInput + String.fromCharCode(keyCode);
    this.setState({currentInput: newCurrentInput});
  },

  componentDidMount: function() {
    document.onkeypress = this.handlePrintableKeys;
    window.onkeydown = this.handleStrangeKeys;
  },

  render: function() {
    var renderedLines = [];
    this.state.commands.forEach(function(x) {
      renderedLines.push(<QueryResultPair query={x.query} result={x.result} />);
    });
    renderedLines.push(<CurrentInput input={this.state.currentInput} />);

    return <pre>{renderedLines}</pre>;
  }
});

var CurrentInput = React.createClass({
  render: function() {
    return <span><span className="raprompt">ra&gt; </span>{this.props.input}</span>;
  }
});

var QueryResultPair = React.createClass({
  render: function() {
    return <span><span className="raprompt">ra&gt; </span>{this.props.query}{"\n"}{this.props.result}{"\n"}</span>;
  }
});

React.render(
  <ExampleApplication />,
  document.getElementById('container')
);
