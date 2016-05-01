function acidChart(study, options) {
  var uprightNormals = CONFIG.acidNormals.upright;
  var supineNormals = CONFIG.acidNormals.supine;
  var uprightNormals75 = CONFIG.acidNormals75.upright;
  var supineNormals75 = CONFIG.acidNormals75.supine;

  var margin = { top: 20, right: 20, bottom: 30, left: 50 },
      width = options.width - margin.left - margin.right,
      height = options.height - margin.top - margin.bottom;

  var x0 = d3.scale.ordinal()
      .rangeRoundBands([0, width], .1);

  var x1 = d3.scale.ordinal();

  var y = d3.scale.linear()
      .range([height, 0]);

  var color = d3.scale.ordinal()
      .range(["#98abc5", "#880", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

  var xAxis = d3.svg.axis()
      .scale(x0)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .tickFormat(d3.format("%"));

  $(options.container).empty();

  var svg = d3.select(options.container).append("svg")
      .attr('viewBox', '0 0 ' + options.width + ' ' + options.height)
      .attr('preserveAspectRatio', 'none')
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var data = [
    { threshold: '< 6.5', upright: options.uprightPercents[0], supine: options.supinePercents[0] },
    { threshold: '< 6.0', supine: options.supinePercents[1], upright: options.uprightPercents[1] },
    { threshold: '< 5.5', supine: options.supinePercents[2], upright: options.uprightPercents[2] },
    { threshold: '< 5.0', supine: options.supinePercents[3], upright: options.uprightPercents[3] }
  ];

  var categoryNames = d3.keys(data[0]).filter(function(key) { return key !== "threshold"; });

  data.forEach(function(d) {
    d.categories = categoryNames.map(function(name) { return {name: name, value: +d[name]}; });
  });

  x0.domain(data.map(function(d) { return d.threshold; }));
  x1.domain(categoryNames).rangeRoundBands([0, x0.rangeBand()], 0.1);
  y.domain([0,.8]); // adding this because they wanted 80% to always show as Y max
  //y.domain([0, d3.max(data, function(d) { return d3.max(d.categories, function(d) { return d.value; }); })]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);
  //   .append("text")
  //     .attr("transform", "rotate(-90)")
  //     .attr("y", 6)
  //     .attr("dy", ".71em")
  //     .style("text-anchor", "end")
  //     .text("% time")
  // ;

  var state = svg.selectAll(".state")
      .data(data)
    .enter().append("g")
      .attr("class", "g")
      .attr("transform", function(d) { return "translate(" + x0(d.threshold) + ",0)"; });

  state.selectAll("rect")
      .data(function(d) { return d.categories; })
    .enter().append("rect")
      .attr("width", x1.rangeBand())
      .attr("x", function(d) { return x1(d.name); })
      .attr("y", function(d) { return d.value ? y(d.value) : 0; })
      .attr("height", function(d) { return height - (d.value ? y(d.value) : 0); })
      .attr("class", function(d, i, j) {
        var name = d.name;

        if (
          (d.name === 'upright' && d.value > uprightNormals75[j]) ||
          (d.name === 'supine' && d.value > supineNormals75[j])
        ) {
          name += ' gt75';
        }

        if (
          (d.name === 'upright' && d.value > uprightNormals[j]) ||
          (d.name === 'supine' && d.value > supineNormals[j])
        ) {
          name += ' gt90';
        }

        return name;
      })
      .attr("visibility", function(d) {
        return d.value ? 'visible' : 'hidden';
      })
      // .style("fill", function(d, i, j) {
      //   if (
      //     (d.name === 'upright' && d.value > uprightNormals[j]) ||
      //     (d.name === 'supine' && d.value > supineNormals[j])
      //   ) {
      //     return '#f00';
      //   }
      // })
      ;

  var legend = svg.selectAll(".legend")
      .data(categoryNames.slice().concat([ 'normal75', 'normal95' ]))
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("x", width - 12)
      .attr("width", 12)
      .attr("height", 12)
      .attr("class", function(d, i) {
        return [ 'upright', 'supine' ][i];
      })
      // .style("fill", color)
      ;

  legend.append("text")
      .attr("x", width - 16)
      .attr("y", 6)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d; });

  // Replace the normal rects with a dashed line.

  // 75
  svg.select('.legend:nth-child(9)')
    .insert('line', 'rect')
      .attr("x1", width - 12 + 1)
      .attr("y1", 6)
      .attr("x2", width)
      .attr("y2", 6)
      .attr("stroke", "green")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "1, 2");
  svg.select('.legend:nth-child(9) > rect').remove();

  // 90
  svg.select('.legend:last-child')
    .insert('line', 'rect')
      .attr("x1", width - 12 + 1)
      .attr("y1", 6)
      .attr("x2", width)
      .attr("y2", 6)
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "2, 2");
  svg.select('.legend:last-child > rect').remove();

  state.selectAll(".normal")
      .data(function(d) { return d.categories; })
    .enter()
    .append("line")
      .attr("x1", function(d) { return x1(d.name) + 1; })
      .attr("y1", function(d, i, j) { return y((i === 0 ? uprightNormals : supineNormals)[j]); })
      .attr("x2", function(d) { return x1(d.name) + x1.rangeBand() + 1; })
      .attr("y2", function(d, i, j) { return y((i === 0 ? uprightNormals : supineNormals)[j]); })
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "2, 2")
  ;

  state.selectAll(".normal")
      .data(function(d) { return d.categories; })
    .enter()
    .append("line")
      .attr("x1", function(d) { return x1(d.name) + 1; })
      .attr("y1", function(d, i, j) { return y((i === 0 ? uprightNormals75 : supineNormals75)[j]); })
      .attr("x2", function(d) { return x1(d.name) + x1.rangeBand() + 1; })
      .attr("y2", function(d, i, j) { return y((i === 0 ? uprightNormals75 : supineNormals75)[j]); })
      .attr("stroke", "green")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "1, 2")
  ;
}
