var d3Tree = {};

d3Tree.create = function(el, state) {
  var svg = d3.select(el).append('svg')
      .attr('class', 'd3')
      .attr('width', 400)
      .attr('height', 600);

/*  this.update(el, state);
};

d3Tree.update = function(el, state) {*/
  // Compute the new tree layout.
  var tree = d3.layout.tree().size([300, 300]);
  var diagonal = d3.svg.diagonal();
  var nodes = tree.nodes(state);

  var node = svg.selectAll(".node")
    .data(nodes)
    .enter().append("svg:g")
    .attr("class", "node")
    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

  node.append("svg:rect")
    .attr("width", 10)
    .attr("height", 10)
    .style("fill", "blue");

  node.append("svg:text")
    .attr("x", 0)
    .attr("dy", "2em")
    .text(function(d) { return d.name; });

  var link = svg.selectAll("path.link")
    .data(tree.links(nodes));

  link.enter().insert("path", "g")
    .attr("class", "link")
    .attr("d", diagonal);
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
          "name": "join",
          "children": [
            {
              "name": "select_{name='Bill'}",
              "children": [
                {
                  "name": "Drinker",
                  "children": []
                }
              ]
            },
            {
              "name": "select_{name='John'",
              "children": [
                {
                  "name": "Drinker",
                  "children": []
                }
              ]
            }
          ]
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
