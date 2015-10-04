var d3Tree = {};

d3Tree.create = function(el, state) {
  var svg = d3.select(el).append('svg')
      .attr('class', 'd3')
      .attr('width', 400)
      .attr('height', 600);

  svg.append('g')
      .attr('class', 'd3-points');

/*  this.update(el, state);
};

d3Tree.update = function(el, state) {*/
  // Compute the new tree layout.
  var tree = d3.layout.tree();
  var nodes = tree.nodes(state.root);

  var node = svg.selectAll(".node")
    .data(nodes)
    .enter().append("g");

  node.append("svg:circle")
    .attr("r", 1e-6)
    .style("fill", "blue");

  node.append("svg:text")
    .attr("x", 0)
    .attr("dy", "1em")
    .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
    .text(function(d) { return "hi"; });
};

d3Tree.destroy = function(el) {};

var Tree = React.createClass({
  componentDidMount: function() {
    var el = this.getDOMNode();
    d3Tree.create(el, this.state);
  },

  componentDidUpdate: function() {
    var el = this.getDOMNode();
    d3Chart.update(el, this.state);
  },

  componentWillUnmount: function() {
    var el = this.getDOMNode();
    d3Chart.destroy(el);
  },

  getInitialState: function() {
    return {
      root: {
        type: "join",
        l: "left",
        r: "right"
      }
    };
  },

  render: function() {
    return <div className="tree"></div>;
  }
});

React.render(
  <Tree />,
  document.getElementById('rightpane')
);
