d3.json('/api/v1/data').then((data) => console.log(data));
// Set size of SVG
const svgWidth = 960;
const svgHeight = 620;

// Set margins for SVG
const margin = {
  top: 20,
  right: 40,
  bottom: 200,
  left: 100,
};

// Set height and width
const width = svgWidth - margin.right - margin.left;
const height = svgHeight - margin.top - margin.bottom;

// Create SVG wrapper, append an SVG group that holds chart and shift chart margins
const svg = d3
  .select('.scatter')
  .append('svg')
  .attr('width', svgWidth)
  .attr('height', svgHeight);

// Create a group for the SVG
const chartGroup = svg
  .append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

// Set Initial Parameters for X and Y
let chosenXAxis = 'Access to Drinking Water';
let chosenYAxis = 'Probability of Dying 5-9';

// Function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
  // create scales
  const xLinearScale = d3
    .scaleLinear()
    .domain([
      d3.min(data, (d) => d[chosenXAxis]) * 0.8,
      d3.max(data, (d) => d[chosenXAxis]) * 1.2,
    ])
    .range([0, width]);
  return xLinearScale;
}

// ------------------------------------

// Function for updating y-scale variable when label is clicked
function yScale(data, chosenYAxis) {
  let yLinearScale = d3
    .scaleLinear()
    .domain([
      d3.min(data, (d) => d[chosenYAxis]) * 0.8,
      d3.max(data, (d) => d[chosenYAxis]) * 1.2,
    ])
    .range([height, 0]);
  return yLinearScale;
}
// Function for updating the x axis
function renderXAxis(newXScale, xAxis) {
  let bottomAxis = d3.axisBottom(newXScale);
  xAxis.transition().duration(1000).call(bottomAxis);
  return xAxis;
}

// Function for updating Y axis
function renderYAxis(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);
  yAxis.transition().duration(1000).call(leftAxis);
  return yAxis;
}

// Function that updates circles
function renderCircles(
  circlesGroup,
  newXScale,
  chosenXAxis,
  newYScale,
  chosenYAxis
) {
  circlesGroup
    .transition()
    .duration(1000)
    .attr('cx', (data) => newXScale(data[chosenXAxis]))
    .attr('cy', (data) => newYScale(data[chosenYAxis]));
  return circlesGroup;
}

// Functiion that updates state labels
function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
  textGroup
    .transition()
    .duration(1000)
    .attr('x', (d) => newXScale(d[chosenXAxis]))
    .attr('y', (d) => newYScale(d[chosenYAxis]));
  return textGroup;
}

// Function for setting values in tooltip
function valueX(value, chosenXAxis) {
  //vale based on variable
  //poverty
  if (chosenXAxis === 'Probability of Dying 5-9') {
    return `${value}%`;
  }
  //household income
  else if (chosenXAxis === 'Probability of Dying 15-19') {
    return `${value}`;
  } else {
    return `${value}`;
  }
}

// Function for updating circles group
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
  // overty
  if (chosenXAxis === 'Probability of Dying 5-9') {
    var xLabel = 'Probability of Dying 5-9:';
  }
  //income
  else if (chosenXAxis === 'Probability of Dying 15-19') {
    var xLabel = 'Probability of Dying 15-19:';
  }
  //age
  else {
    var xLabel = 'Probability of Dying 10-14:';
  }
  //Y label
  //healthcare
  if (chosenYAxis === 'Basic Sanitation') {
    var yLabel = 'Basic Sanitation:';
  } else if (chosenYAxis === 'Access to Drinking Water') {
    var yLabel = 'Access to Drinking Water:';
  }
  //smoking
  else {
    var yLabel = 'Access to Electricity:';
  }

  //create tooltip
  var toolTip = d3
    .tip()
    .attr('class', 'd3-tip')
    .offset([-8, 0])
    .html(function (d) {
      return `${
        d.state
      }<br>${xLabel} ${valueX(d[chosenXAxis], chosenXAxis)}<br>${yLabel} ${d[chosenYAxis]}%`;
    });

  circlesGroup.call(toolTip);

  // onmouseout event
  circlesGroup.on('mouseover', toolTip.show).on('mouseout', toolTip.hide);

  return circlesGroup;
}
// Retrieve data from CSV file and execute code
d3.json('/api/v1/data').then(function (data) {
  // Parse data
  data.forEach(function (data) {
    data['Access to Drinking Water'] = +data['Access to Drinking Water'];
    data['Access to Electricity'] = +data['Access to Electricity'];
    data['Basic Sanitation'] = +data['Basic Sanitation'];
    data['Probability of Dying 5-9'] = +data['Probability of Dying 5-9'];
    data['Probability of Dying 10-14'] = +data['Probability of Dying 10-14'];
    data['Probability of Dying 15-19'] = +data['Probability of Dying 15-19'];
  });

  // Create x and y linear scales
  var xLinearScale = xScale(data, chosenXAxis);
  var yLinearScale = yScale(data, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // Append x axis
  var xAxis = chartGroup
    .append('g')
    .classed('x-axis', true)
    .attr('transform', `translate(0, ${height})`)
    .call(bottomAxis);

  // Append y axis
  var yAxis = chartGroup.append('g').classed('y-axis', true).call(leftAxis);

  // Append initial circles
  var circlesGroup = chartGroup
    .selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .classed('stateCircle', true)
    .attr('cx', (d) => xLinearScale(d[chosenXAxis]))
    .attr('cy', (d) => yLinearScale(d[chosenYAxis]))
    .attr('r', 3)
    .attr('opacity', '.5');

  // Append Initial Text
  var textGroup = chartGroup
    .selectAll('.stateText')
    .data(data)
    .enter()
    .append('text')
    .classed('stateText', true)
    .attr('x', (d) => xLinearScale(d[chosenXAxis]))
    .attr('y', (d) => yLinearScale(d[chosenYAxis]))
    .attr('dy', 3)
    .attr('font-size', '10px')
    .text(function (d) {
      return d.abbr;
    });

  // Create group for  x axis labels
  var xLabelsGroup = chartGroup
    .append('g')
    .attr('transform', `translate(${width / 2}, ${height + 10 + margin.top})`);

  var povertyLabel = xLabelsGroup
    .append('text')
    .classed('aText', true)
    .classed('active', true)
    .attr('x', 0)
    .attr('y', 20)
    .attr('value', 'Probability of Dying 5-9')
    .text('Probability of Dying 5-9 (%)');

  var ageLabel = xLabelsGroup
    .append('text')
    .classed('aText', true)
    .classed('inactive', true)
    .attr('x', 0)
    .attr('y', 40)
    .attr('value', 'Probability of Dying 10-14')
    .text('Probability of Dying 10-14');

  var incomeLabel = xLabelsGroup
    .append('text')
    .classed('aText', true)
    .classed('inactive', true)
    .attr('x', 0)
    .attr('y', 60)
    .attr('value', 'Probability of Dying 15-19')
    .text('Probability of Dying 15-19');

  //create a group for Y labels
  var yLabelsGroup = chartGroup
    .append('g')
    .attr('transform', `translate(${0 - margin.left / 4}, ${height / 2})`);

  var healthcareLabel = yLabelsGroup
    .append('text')
    .classed('aText', true)
    .classed('active', true)
    .attr('x', 0)
    .attr('y', 0 - 20)
    .attr('dy', '1em')
    .attr('transform', 'rotate(-90)')
    .attr('value', 'Basic Sanitation')
    .text('Basic Sanitation (%)');

  var smokesLabel = yLabelsGroup
    .append('text')
    .classed('aText', true)
    .classed('inactive', true)
    .attr('x', 0)
    .attr('y', 0 - 40)
    .attr('dy', '1em')
    .attr('transform', 'rotate(-90)')
    .attr('value', 'Access to Electricity')
    .text('Access to Electricity (%)');

  var obesityLabel = yLabelsGroup
    .append('text')
    .classed('aText', true)
    .classed('inactive', true)
    .attr('x', 0)
    .attr('y', 0 - 60)
    .attr('dy', '1em')
    .attr('transform', 'rotate(-90)')
    .attr('value', 'Access to Drinking Water')
    .text('Access to Drinking Water');

  // Update Tooltip
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // X Axis event listener
  xLabelsGroup.selectAll('text').on('click', function () {
    var value = d3.select(this).attr('value');

    if (value != chosenXAxis) {
      // Replace X with a value
      chosenXAxis = value;

      // Updates x for new data
      xLinearScale = xScale(data, chosenXAxis);

      // Updates x axis with transition
      xAxis = renderXAxis(xLinearScale, xAxis);

      // Updates circles with a new x value
      circlesGroup = renderCircles(
        circlesGroup,
        xLinearScale,
        chosenXAxis,
        yLinearScale,
        chosenYAxis
      );

      // Udates Text
      // textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

      // Updates Tooltip
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

      // Change of classes to change text depending on selection
      if (chosenXAxis === 'Access to Drinking Water') {
        povertyLabel.classed('active', true).classed('inactive', false);
        ageLabel.classed('active', false).classed('inactive', true);
        incomeLabel.classed('active', false).classed('inactive', true);
      } else if (chosenXAxis === 'Probability of Dying 10-14') {
        povertyLabel.classed('active', false).classed('inactive', true);
        ageLabel.classed('active', true).classed('inactive', false);
        incomeLabel.classed('active', false).classed('inactive', true);
      } else {
        povertyLabel.classed('active', false).classed('inactive', true);
        ageLabel.classed('active', false).classed('inactive', true);
        incomeLabel.classed('active', true).classed('inactive', false);
      }
    }
  });
  // Y Axis event listener
  yLabelsGroup.selectAll('text').on('click', function () {
    var value = d3.select(this).attr('value');

    if (value != chosenYAxis) {
      // Replace y
      chosenYAxis = value;

      // Update Y scale
      yLinearScale = yScale(data, chosenYAxis);

      // Update Y Axis
      yAxis = renderYAxis(yLinearScale, yAxis);

      // Update circles with new y
      circlesGroup = renderCircles(
        circlesGroup,
        xLinearScale,
        chosenXAxis,
        yLinearScale,
        chosenYAxis
      );

      // Update text with new x
      // textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

      // Update tooltip
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

      // Change of classes to change text depending on selection
      if (chosenYAxis === 'Access to Drinking Water') {
        obesityLabel.classed('active', true).classed('inactive', false);
        smokesLabel.classed('active', false).classed('inactive', true);
        healthcareLabel.classed('active', false).classed('inactive', true);
      } else if (chosenYAxis === 'Access to Electricity') {
        obesityLabel.classed('active', false).classed('inactive', true);
        smokesLabel.classed('active', true).classed('inactive', false);
        healthcareLabel.classed('active', false).classed('inactive', true);
      } else {
        obesityLabel.classed('active', false).classed('inactive', true);
        smokesLabel.classed('active', false).classed('inactive', true);
        healthcareLabel.classed('active', true).classed('inactive', false);
      }
    }
  });
});
