(function() {
  const svg = d3.select('#line'),
    margin = { top: 20, right: 80, bottom: 30, left: 30 };
  const outer = svg.node().getBoundingClientRect();
  const inner = {
    width: outer.width - margin.left - margin.right,
    height: outer.height - margin.top - margin.bottom
  };

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleTime().range([0, inner.width]),
    y = d3.scaleLinear().range([inner.height, 0]),
    z = d3.scaleOrdinal(d3.schemeCategory10);

  const line = d3.line()
    .x(function(d) { return x(d.time); })
    .y(function(d) { return y(d.speed); });

  d3.csv('data.csv', type).then(data => {
    const speeds = data.columns.slice(1).map(function(id) {
      return {
        id: id,
        values: data.map(function(d) {
          return {time: d.time, speed: d[id]};
        })
      };
    });

    x.domain(d3.extent(data, function(d) { return d.time; }));

    y.domain([
      d3.min(speeds, c => d3.min(c.values, d => d.speed)),
      d3.max(speeds, c => d3.max(c.values, d => d.speed))
    ])
    .nice();

    z.domain(speeds.map(function(c) { return c.id; }));

    g.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + inner.height + ')')
      .call(d3.axisBottom(x));

    g.append('g')
      .attr('class', 'axis axis--y')
      .call(d3.axisLeft(y))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '0.71em')
      .attr('fill', '#000')
      .text('Speed (Mbps)');

    const speed = g.selectAll('.speed')
      .data(speeds)
      .enter().append('g')
      .attr('class', 'speed');

    speed.append('path')
      .attr('class', 'line')
      .attr('d', d => line(d.values))
      .style('stroke', d => z(d.id));

    speed.append('text')
      .datum(d => ({ id: d.id, value: d.values[d.values.length - 1] }))
      .attr('transform', d => `translate(${x(d.value.time)},${y(d.value.speed)})`)
      .attr('x', 3)
      .attr('dy', '0.35em')
      .style('font', '10px sans-serif')
      .text(d => d.id);
  });

  function type(d, _, columns) {
    d.time = new Date(d.time);
    for (let i = 1, n = columns.length; i < n; ++i) {
      let c = columns[i];
      d[c] = +d[c];
    }
    return d;
  }
})();