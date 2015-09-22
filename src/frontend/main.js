var ExampleApplication = React.createClass({
  getInitialState: function() {
    return {
      commands: [
        {
          query: "\\select_{bar = 'James Joyce Pub'} Frequents;",
          result: "Output schema: (drinker varchar, bar varchar, times_a_week int2)\n"
          + "-----\n"
          + "Eve|James Joyce Pub|2\n"
          + "Dan|James Joyce Pub|1\n"
          + "Amy|James Joyce Pub|2\n"
          + "Ben|James Joyce Pub|1\n"
          + "-----\n"
          + "Total number of rows: 4\n"
        },
        {
          query: "\\select_{bar = 'Some other pub'} Frequents)",
          result: "drinker1\ndrinker2\ndrinker3"
        }
      ]
    };
  },

  render: function() {
    var answer = "";
    this.state.commands.forEach(function(x) {
      answer += x.query + "\n" + x.result;
    });

    return <pre>{answer}</pre>;
  }
});

React.render(
  <ExampleApplication />,
  document.getElementById('container')
);
