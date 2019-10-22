let w = 2000, h = 2000;
//Mike Bostock's Margin Standard
var margin = {top: 150, right: 30, bottom: 30, left: 30};
var width = w - margin.left - margin.right,
    height = h - margin.top - margin.bottom;

var frame = d3.select("dgraph")
            .append("div")
            .append("svg")
            .attr("width", w)
            .attr("height", h)

svg = frame.append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var dataset;
let xLabels = ["5 Year", "10 Year", "15 Year", "20 Year"];
let xPos = [250, 400, 550, 700];
let srKeys = ["t5yr", "t10yr", "t15yr", "t20yr"];
let seKeys = ["t5se", "t10se", "t15se", "t20se"];

var linesColor = [];
var cancerNamesObj = [];

// function to create SVG path statement from a list of points
var lineGenerator = d3.line();
var rowConverter = function(d) {
  return {
    Type: d.Type,
    t5yr: parseFloat(d.t5yr),
    t10yr: parseFloat(d.t10yr),
    t15yr: parseFloat(d.t15yr),
    t20yr: parseFloat(d.t20yr),
    t5se: parseFloat(d.t5se),
    t10se: parseFloat(d.t10se),
    t15se: parseFloat(d.t15se),
    t20se: parseFloat(d.t20se),
  };
}
d3.csv("assets/CancerSurvivalRate/cancer_survival.csv", rowConverter, function(data) {

  dataset = data;

  console.log(data);
  let unitHeight = height / 100;
  let stroke_width = 5;

  createTitle();

  //Lines
  var lines = svg.append("g");
  lines.selectAll("path")
    .data(dataset)
    .enter()
    .append("path")
    .attr('d',
      (function(d) {
        return lineGenerator(
          [
            [250, (height - unitHeight * d.t5yr)],
            [400, (height - unitHeight * d.t10yr)],
            [550, (height - unitHeight * d.t15yr)],
            [700, (height - unitHeight * d.t20yr)]
          ])
      }))
    .attr("stroke-width", stroke_width)
    .attr("stroke", function(d) {
      let color = "rgba(" + parseInt(255 - 2 * d.t5yr) + "," +
        parseInt(2 * d.t20yr) + "," + parseInt(2 * d.t5yr) + " ,0.5)";
      linesColor.push(color);
      return color;
    })
    .attr("fill", "none")
    .attr("class", "element")
    .on("mouseover", onMouseOver)
    .on("mouseout", onMouseOut)
    .on("touchstart", onMouseOver)
    .on("touchend", onMouseOut)

  //Standard Error Labels
  for (var i = 0; i < 4; i++) {
    createStandardErrorLabel(srKeys[i], seKeys[i], xPos[i], unitHeight);
  }
  //Data Labels
  for (var i = 0; i < 4; i++) {
    createDataLabel(srKeys[i], xPos[i], unitHeight);
  }
  //Table Headers
  var xLabelG = svg.append("g");
  for (var i = 0; i < 4; i++) {
    createXLabel(xLabelG, xLabels[i], xPos[i]);
  }


  //Cancer Names
  var yAxisLabelYPos = [];
  svg.append("g")
    .selectAll("text")
    .data(dataset)
    .enter()
    .append("text")
    .text(function(d) {
      return d.Type;
    })
    .attr("x", 10)
    .attr("font-family", "sans-serif")
    .attr("y", function(d) {
      var near = null;
      let y = height - unitHeight * d.t5yr;
      yAxisLabelYPos.forEach((d) => {
        if (Math.abs(y - d) <= 15) {
          near = Math.max(d, near);
        }
      })
      if (near) y = near + 15;
      yAxisLabelYPos.push(y);
      return y;
    })
    .attr("font-size", "15px")
    .attr("fill", "black")
    .attr("font-family", "sans-serif")
    .attr("class", (d, i) => { return `yAxisLabel label_row${i}`; });

});

function createDataLabel(tyr, x, unitHeight) {
  var labels = dataset.map((d, i) => {return [d[tyr], i]});
  labels.sort((a, b) => {return b[0] - a[0];});

  var yAxisLabelsYPos = [];
  var datalabels = svg.append("g")
  datalabels.selectAll("text").data(labels).enter()
    .append("text")
    .text((d) => {return d[0];})
    .attr("x", x)
    .attr("y", (d, i) => {
      let y = height - unitHeight * d[0] + 5 / 2;
      var near = null;
      yAxisLabelsYPos.forEach((d) => {
        if (Math.abs(y - d) <= 11) {
          near = Math.max(near, d);
        }
      })
      if (near) y = near + 11;
      yAxisLabelsYPos.push(y);
      return y;
    })
    // .attr("stroke", "black")
    .attr("font-weight", "bold")
    .attr("class", (d) => { return `row${d[1]} datalabel`})
    yAxisLabelsYPos = [];

}

function createStandardErrorLabel(tyr, tse, x, unitHeight) {
  var seLabels = svg.append("g");
  let seWidth = 5;
  let seColor = "#4287f5";
  seLabels.selectAll("lines").data(dataset).enter()
    .append("line")
    .attr("x1", x).attr("y1", (d, i) => {
      return height - unitHeight * d[tyr] - d[tse] * 30;
    })
    .attr("x2", x).attr("y2", (d, i) => {
      return height - unitHeight * d[tyr] + d[tse] * 30;
    })
    .attr("style", `stroke:${seColor};stroke-width:1px`)
    .attr("visibility", "hidden")
    .attr("class", (d, i ) => { return `seLine row${i}`;})

  seLabels.selectAll("lines").data(dataset).enter()
    .append("line")
    .attr("x1", x-seWidth).attr("y1", (d, i) => {
      return height - unitHeight * d[tyr] - d[tse] * 30;
    })
    .attr("x2", x+seWidth).attr("y2", (d, i) => {
      return height - unitHeight * d[tyr] - d[tse] * 30;
    })
    .attr("style", `stroke:${seColor};stroke-width:1px`)
    .attr("visibility", "hidden")
    .attr("class", (d, i ) => { return `seLine row${i}`;})

  seLabels.selectAll("lines").data(dataset).enter()
    .append("line")
    .attr("x1", x-seWidth).attr("y1", (d, i) => {
      return height - unitHeight * d[tyr] + d[tse] * 30;
    })
    .attr("x2", x+seWidth).attr("y2", (d, i) => {
      return height - unitHeight * d[tyr] + d[tse] * 30;
    })
    .attr("style", `stroke:${seColor};stroke-width:1px`)
    .attr("visibility", "hidden")
    .attr("class", (d, i ) => { return `seLine row${i}`;})

  seLabels.selectAll("text").data(dataset).enter()
    .append("text")
    .text((d) => {return d[tse];})
    .attr("x", x).attr("y", (d, i) => {
      return height - unitHeight * d[tyr] - d[tse] * 30 - 5;
    })
    .attr("font-size", "11px")
    // .attr("fill", "black")
    .attr("font-family", "sans-serif")
    .attr("text-anchor", "middle")
    .attr("style", `stroke:${seColor};stroke-width:1px`)
    .attr("visibility", "hidden")
    .attr("class", (d, i ) => { return `seLine row${i}`;})
}

function createXLabel(g, labelText, x) {
  var ypos = -30;
  var tspan = g.append("text").text(null).append("tspan").text(labelText)
                .attr("x", x).attr("y", ypos)
                .attr("text-anchor", "middle");
  var t = tspan.node().getComputedTextLength()
  g.append("line")
    .attr("x1", x-t/2).attr("y1", ypos + 10)
    .attr("x2", x+t/2).attr("y2", ypos + 10)
    .attr("style", "stroke:#ccc;stroke-width:2px")
}

function createTitle() {
  var titleSection = svg.append("g");

  titleSection.append("text").text("t5-t20 Cancer Survival Rate")
              .attr("x", 700 / 2).attr("y", -margin.top/5*4)
              .attr("font-weight", "bold").attr("font-size", "20px")
              .attr("font-family", "sans-serif")
              .attr("text-anchor", "middle");

  titleSection.append("text").text("Hover your mouse over the lines to view individual survival rate trend and standard deviation.")
              .attr("x", 700 / 2).attr("y", -margin.top/5*3)
              .attr("font-weight", "normal").attr("font-size", "15px")
              .attr("font-family", "sans-serif")
              .attr("text-anchor", "middle");

  titleSection.append("text").text("Yinghao Michael Wang, 2019, Yale University.")
              .attr("x", 700 / 2).attr("y", height + margin.bottom/2)
              .attr("font-weight", "normal").attr("font-size", "15px")
              .attr("font-family", "sans-serif")
              .attr("text-anchor", "middle");

}

function onMouseOver(d, i) {
  frame.selectAll(".element").attr("stroke", "rgba(128, 128, 128, 0.2)");
  frame.selectAll(".datalabel").attr("stroke", "rgba(128, 128, 128, 0.2)").attr("fill", "rgba(128, 128, 128, 0.2)");
  frame.selectAll(".yAxisLabel").attr("stroke", "rgba(128, 128, 128, 0.2)").attr("fill", "rgba(128, 128, 128, 0.2)");

  d3.select(this).attr("stroke", linesColor[i]);
  frame.selectAll(`.row${i}`).attr("stroke", "rgba(0, 0, 0, 0)").attr("fill", "rgba(0, 0, 0, 1)");
  frame.select(`.label_row${i}`).attr("fill", "black");
  frame.selectAll(`.seLine`).filter(`.row${i}`).attr("visibility", "visible");
}

function onMouseOut(d, i) {
  frame.selectAll("path")
    .attr("stroke", (d, i) => {
      return linesColor[i];
    })
  frame.selectAll("*[class^=\"row\"]")
    .attr("fill", "rgba(0, 0, 0, 1)")
    .attr("stroke", (d, i) => {
      return linesColor[i % dataset.length];
    });
  frame.selectAll(".datalabel")
    .attr("stroke", "rgba(0, 0, 0, 0)").attr("fill", "rgba(0, 0, 0, 1)");
  frame.selectAll(".yAxisLabel")
    .attr("fill", "black");
  frame.selectAll(".seLine").attr("visibility", "hidden");
}
