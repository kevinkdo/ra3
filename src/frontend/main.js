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

var ExampleApplication = React.createClass({
  getInitialState: function() {
    return {
      commands: getDefaultCommandData(),
      currentInput: "this is what I'm typing"
    };
  },

  handleKeyPress: function(e) {
    var newCurrentInput = this.state.currentInput + String.fromCharCode(e.which);
    console.log(String.fromCharCode(e.charCode));
    this.setState({currentInput: newCurrentInput});
  },

  render: function() {
    var renderedLines = [];
    this.state.commands.forEach(function(x) {
      renderedLines.push(<QueryResultPair query={x.query} result={x.result} />);
    });
    renderedLines.push(<CurrentInput input={this.state.currentInput} />);

    return <pre tabIndex="0" onKeyDown={this.handleKeyPress}>{renderedLines}</pre>;
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
