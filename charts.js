function makeTimeSeries(data) {
  const svg = d3.select('#time'),
    margin = { top: 10, right: 60, bottom: 30, left: 30 };
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
    .curve(d3.curveBasis)
    .x(function(d) { return x(d.time); })
    .y(function(d) { return y(d.speed); });

  const speeds = data.columns.slice(1).map(id => ({
    id,
    values: data.map(d=> ({ time: d.time, speed: d[id] }))
  }));

  x.domain(d3.extent(data, d => d.time));

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
    .attr('x', 8)
    .attr('dy', '0.35em')
    .style('font', '10px sans-serif')
    .text(d => d.id);

  g.selectAll('circle')
    .data(speeds.reduce((a, b) =>
      a.concat(...b.values.map(d => {
        d.id = b.id;
        return d;
      })
    ), []))
    .enter()
    .append('circle')
    .attr('r', '2')
    .attr('cx', d => x(d.time))
    .attr('cy', d => y(d.speed))
    .style('fill', d => z(d.id));
}

function makeScatter(data) {
  const svg = d3.select('#scatter'),
    margin = { top: 10, right: 60, bottom: 30, left: 30 };
  const outer = svg.node().getBoundingClientRect();
  const inner = {
    width: outer.width - margin.left - margin.right,
    height: outer.height - margin.top - margin.bottom
  };

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
    .range([0, inner.width])
    .domain(d3.extent(data, d => d.upload))
    .nice();

  const y = d3.scaleLinear()
    .range([inner.height, 0])
    .domain(d3.extent(data, d => d.download))
    .nice();

  const trend = d3.mean(data, d => d.download) / d3.mean(data, d => d.upload);
  const z = d => d.download / d.upload > trend ? d3.schemeCategory10[0] : d3.schemeCategory10[1];

  g.append('g')
    .attr('class', 'axis axis--x')
    .attr('transform', 'translate(0,' + inner.height + ')')
    .call(d3.axisBottom(x))
    .append('text')
    .attr('x', inner.width)
    .attr('dy', '-0.71em')
    .attr('text-anchor', 'end')
    .attr('fill', '#000')
    .text('Upload speed (Mbps)');

  g.append('g')
    .attr('class', 'axis axis--y')
    .call(d3.axisLeft(y))
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 6)
    .attr('dy', '0.71em')
    .attr('fill', '#000')
    .text('Download speed (Mbps)');

  g.selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('r', '3')
    .attr('cx', d => x(d.upload))
    .attr('cy', d => y(d.download))
    .style('fill', z);
}

function parseDataTypes(d, _, columns) {
  d.time = new Date(d.time);
  for (let i = 1, n = columns.length; i < n; ++i) {
    let c = columns[i];
    d[c] = +d[c];
  }
  return d;
}

d3.csv('data.csv', parseDataTypes).then(data => {
  makeTimeSeries(data);
  makeScatter(data);
});