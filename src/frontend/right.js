var d3Tree = {};

d3Tree.create = function(el, state) {
  this.svg = d3.select(el).append('svg')
      .attr('class', 'd3')
      .attr('width', 400)
      .attr('height', 600)
      .attr('margin', 20);

  this.update(el, state);
};

d3Tree.update = function(el, state) {
  // Compute the new tree layout.
  var tree = d3.layout.tree().size([300, 300]);
  var diagonal = d3.svg.diagonal();
  var line = d3.svg.line().x(function(d) { return d.x; })
    .y(function(d) { return d.y; })
    .interpolate("basis");
  var nodes = tree.nodes(state);

  var node = this.svg.selectAll(".node")
    .data(nodes)
    .enter().append("svg:g")
    .attr("class", "node")
    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

  node.append("svg:rect")
    .attr("width", 10)
    .attr("height", 10)
    .style("fill", function(d) { return d.selected ? "green" : "blue"});

  node.append("svg:text")
    .attr("x", 15)
    .attr("dy", "1em")
    .text(function(d) { return d.name; });

  var link = this.svg.selectAll("path.link")
    .data(tree.links(nodes))
    .enter().append("svg:g")
    .attr("class", "link");
;

  link.append("line")
    .attr("class", "link")
    .attr("x1", function(d) { return d.source.x + 5; })
    .attr("y1", function(d) { return d.source.y + 10; })
    .attr("x2", function(d) { return d.target.x + 5; })
    .attr("y2", function(d) { return d.target.y; });
};

d3Tree.destroy = function(el) {};

var Tree = React.createClass({
  componentDidMount: function() {
    var el = this.getDOMNode();
    d3Tree.create(el, this.state.d3treestate);
  },

  componentDidUpdate: function() {
    var el = this.getDOMNode();
    d3Chart.update(el, this.state.d3treestate);
  },

  componentWillUnmount: function() {
    var el = this.getDOMNode();
    d3Chart.destroy(el);
  },

  getInitialState: function() {
    return {
        d3treestate: {
          name: "—",
          selected: false,
          children: [
            {
              name: "select_{name='Billπ'}",
              selected: true,
              children: [
                {
                  name: "Drinker",
                  children: []
                }
              ]
            },
            {
              name: "select_{name='John'}",
              selected: false,
              children: [
                {
                  name: "Drinker",
                  children: []
                }
              ]
            }
          ]
        }
    };
  },

  render: function() {
    return <div><br /><div className="tree"></div></div>;
  }
});

React.render(
  <Tree />,
  document.getElementById('rightpane')
);
