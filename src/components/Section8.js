import React          from "react";
import * as d3        from "d3";
import dataset        from "../data/json/bubble.json";
import dataset2       from "../data/json/bubble-ext.json";
import {FOOTNOTE_REF} from "../App";

const SVG_WIDTH                   = 700;
const SVG_HEIGHT                  = 600;
const SCALE_UP                    = 100;
const CONTINENTS                  = ["Asia", "Europe", "Africa", "Oceania", "America", "Asia/Europe"];
const SIZE_DOMAIN                 = [0, 1400];
const SIZE_RANGE                  = [0, 40];
const SIMULATION_ALPHA            = 0.03;
const CIRCLE_COLOR                = [
    "rgba(31, 119, 180)",
    "rgba(255, 127, 14)", 
    "rgba(44, 160, 44)", 
    "rgba(214, 39, 40)", 
    "rgba(148, 103, 189)", 
    "rgba(247, 207, 42)", 
];

const LABEL_DISPLAY_VALUE         = 6;
const LABEL_DISPLAY_MAX_LENGTH    = 10;
const FILL_NORMAL_OPACITY         = 0.8;
const FILL_HOVER_OPACITY          = 1;
const STROKE_HOVER_WIDTH          = 4;
const STROKE_WIDTH                = 2;
const STROKE_NORMAL_OPACITY       = 0.8;
const STROKE_HOVER_OPACITY        = 1;
const STROKE_NORMAL_COLOUR        = "rgb(43, 43, 43)";
const STROKE_HOVER_COLOUR         = "rgb(43, 43, 43)";
const SIMULATION_CHARGE_STRENGTH  = 0.1;
const SIMULATION_COLLIDE_STRENGTH = 0.2;

/* SUB LINE CHART SETTING */
const LC_SVG_WIDTH             = 700;
const LC_SVG_HEIGHT            = 200;
const LC_MARGIN                = {top: 50, right: 30, bottom: 50, left: 30};
const LC_WIDTH                 = LC_SVG_WIDTH - LC_MARGIN.left - LC_MARGIN.right;
const LC_HEIGHT                = LC_SVG_HEIGHT - LC_MARGIN.top - LC_MARGIN.bottom;
const LC_DEFAULT_COUNTRY       = "United States";
const LC_X_AXIS_TICKS          = 10;
const LC_X_AXIS_LABEL_Y_OFFSET = 30;
const LC_Y_AXIS_LABEL_X_OFFSET = -10;
const LC_Y_AXIS_LABEL_Y_OFFSET = -10;
const LC_X_LABEL               = "Year";
const LC_Y_LABEL               = "Average Total Years of Schooling for Adult Population";
const LC_Y_RANGE               = [0, 15];
const LC_LINE_COLOR            = "#69b3a2";
const LC_LINE_STROKE_WIDTH     = 2;


const CUBE_WIDTH = 100;
const CUBE_HEIGHT = 30;
const ROUNDED_CORNER_RADIUS = 10;

const SHARED = {};


const TOOLTIP = data =>
    `Country: ${data.key}\n` +
    `Continent: ${data.region}\n` +
    `Years of schooling: ${data.value} years`;

export default function Section8() {
    return (
        <div className="Section8">
            <div className="Section8-title">
                <h3>This bubble chart visually represents the average years of education in 78 of the most significant
                    <br />and closely observed countries worldwide.
                </h3>
                <h1>Global Education Disparity</h1>
                <h2>A Draggable Bubble Chart Analysis of Years of Schooling</h2>
                <h3>
                    The challenging circumstances faced by underdeveloped regions as they strive to improve
                    <br/>their educational systems.
                    <a href="/" onClick={event => {
                        event.preventDefault();
                        FOOTNOTE_REF.current.scrollIntoView({behavior: 'smooth'});
                    }}>[4,5,6]</a>
                </h3>
                <h4>The majority of larger bubbles (orange and purple) are from European and American countries,
                    <br />while smaller bubbles (green) are predominantly from African countries.
                </h4>
                <Legend1 />
                <p>The size of the bubble indicates the number of years of education</p>
                <Legend2 />
                <p>The color of each bubble corresponds to the respective continent</p>
            </div>
            <div className="Section8-svg">
                <Bubble/>
                <LineChart/>
            </div>
        </div>
    );
}

/**
 * Chart introduction 
 * @returns 
 */
function Legend1() {
    const ref = React.useRef();
    const dots = Array.from(Array(CONTINENTS.length - 1).keys());
    const pos = [0, 34, 74, 122, 178];
    const r0 = 4;
    React.useEffect(() => {
        const svg = d3.select(ref.current);
        svg
            .selectAll(".firstrow")
            .data(dots)
            .enter()
            .append("circle")
            .attr("cx", (d, i) => 5 + pos[i])
            .attr("cy", 22)
            .attr("r", (d, i) => r0 + i * r0)
            .attr("stroke", STROKE_NORMAL_COLOUR)
            .style("stroke-width", STROKE_WIDTH)
            .attr("fill", "transparent");
    });

    return (<svg ref={ref} className="ColorBar" height={44} width={220} />);
}

/**
 * Chart introduction 
 * @returns 
 */
function Legend2() {
    const ref = React.useRef();
    const dots = Array.from(Array(CONTINENTS.length).keys());
    React.useEffect(() => {
        const svg = d3.select(ref.current);
        const cubes = svg
            .selectAll(".firstrow")
            .data(dots)
            .enter();
        cubes
            .append("rect")
            .attr("x", (d, i) => 5 + i * (CUBE_WIDTH + 10))
            .attr("opacity", FILL_NORMAL_OPACITY)
            .attr("rx", ROUNDED_CORNER_RADIUS)
            .attr("ry", ROUNDED_CORNER_RADIUS)
            .attr("width", CUBE_WIDTH)
            .attr("height", CUBE_HEIGHT)
            .attr("fill", (d, i) => CIRCLE_COLOR[i]);
        cubes
            .append("text")
            .attr("x", (d, i) => 5 + i * (CUBE_WIDTH + 10) + CUBE_WIDTH / 2)
            .attr("y", CUBE_HEIGHT / 2 - 2)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .text((d, i) => CONTINENTS[i])
            .style("fill", "#F2F2EE");
    });

    return (<svg ref={ref} className="ColorBar" height={CUBE_HEIGHT}
        width={5 + CONTINENTS.length * (CUBE_WIDTH + 10)} />);
}


function LineChart() {
    const ref = React.useRef();

    const filterLineChartData = countryName => dataset2.find(obj => obj.name === countryName)?.data;
    const Xs                  = d3.scaleLinear().range([0, LC_WIDTH]);
    const Ys                  = d3.scaleLinear().domain(LC_Y_RANGE).range([LC_HEIGHT, 0]);
    const [axisX, axisY]      = axes(Xs, Ys);
    const lines               = d3.line().x(d => Xs(d.year)).y(d => Ys(d[LC_Y_LABEL]));
    const grids               = grid(Xs, Ys);

    React.useEffect(() => {
        const svg = d3.select(ref.current);
        svg.append("g").call(axisX);
        svg.append("g").call(axisY);
        svg.append("g").call(grids);
        svg.append("g").append("path").attr("class", "section8-lines");
        updateLineChart(LC_DEFAULT_COUNTRY);
    });

    function updateLineChart(countryName) {
        const svg  = d3.select(ref.current);
        const data = filterLineChartData(countryName);

        Xs.domain(d3.extent(data, d => d.year));
        svg.select(".section8-x-axis").call(d3.axisBottom(Xs).ticks(LC_X_AXIS_TICKS));
        svg.select(".section8-y-axis-label").text(`${LC_Y_LABEL} - ${countryName}`);
        svg.selectAll(".section8-lines")
            .datum(filterLineChartData(countryName))
            .join("path")
            .attr("class", "section8-lines")
            .attr("d", lines)
            .attr("stroke", LC_LINE_COLOR)
            .attr("transform", `translate(${LC_MARGIN.left},${LC_MARGIN.top})`)
            .style("stroke-width", LC_LINE_STROKE_WIDTH)
            .style("fill", "none");
    }

    SHARED.updateLineChart = updateLineChart;
    return (<svg ref={ref} className="Section8-line" height={400} width={800}/>);
}

/**
 * Add grid to line chart
 * @param {*} Xs 
 * @param {*} Ys 
 * @returns 
 */
function grid(Xs, Ys) {
    return g => g
        .attr("stroke", "currentColor")
        .attr("stroke-opacity", 0.1)
        .call(g => g.append("g")
            .selectAll("line")
            .data(Ys.ticks())
            .join("line")
            .attr("y1", d => 0.5 + Ys(d) + LC_MARGIN.top)
            .attr("y2", d => 0.5 + Ys(d) + LC_MARGIN.top)
            .attr("x1", LC_MARGIN.left)
            .attr("x2", LC_WIDTH + LC_MARGIN.left));
}

/**
 * Set up x-axis and y-axis
 * @param {*} Xs 
 * @param {*} Ys 
 * @returns 
 */
function axes(Xs, Ys) {
    const axisX = g => g
        .attr("class", "section8-x-axis")
        .attr("transform", `translate(${LC_MARGIN.left},${LC_HEIGHT + LC_MARGIN.top})`)
        .call(d3.axisBottom(Xs).ticks(LC_X_AXIS_TICKS))
        .call(g => g.append("text")
            .attr("x", LC_WIDTH)
            .attr("y", LC_X_AXIS_LABEL_Y_OFFSET)
            .attr("fill", "currentColor")
            .attr("text-anchor", "end")
            .text(`${LC_X_LABEL}`));
    const axisY = g => g
        .attr("class", "section8-y-axis")
        .attr("transform", `translate(${LC_MARGIN.left},${LC_MARGIN.top})`)
        .call(d3.axisLeft(Ys))
        .call(g => g.append("text")
            .attr("class", "section8-y-axis-label")
            .attr("x", LC_Y_AXIS_LABEL_X_OFFSET)
            .attr("y", LC_Y_AXIS_LABEL_Y_OFFSET)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text(`${LC_Y_LABEL}`)
            .style("font-size", "15px"));

    return [axisX, axisY];
}


function Bubble() {
    const ref = React.useRef();
    const color = d3.scaleOrdinal().domain(CONTINENTS).range(CIRCLE_COLOR);
    const size = d3.scaleLinear().domain(SIZE_DOMAIN).range(SIZE_RANGE);
    const simulation = d3.forceSimulation()
        .force("center", d3.forceCenter().x(SVG_WIDTH / 2).y(SVG_HEIGHT / 2))
        .force("charge", d3.forceManyBody().strength(SIMULATION_CHARGE_STRENGTH))
        .force("collide", d3.forceCollide().strength(SIMULATION_COLLIDE_STRENGTH)
            .radius((d) => size(d.value * SCALE_UP) + 3).iterations(1));

    React.useEffect(() => {
        const svg = d3.select(ref.current);
        const nodeGroup = svg.append("g");
        const node = nodeGroup
            .selectAll("circle")
            .data(dataset)
            .join("circle")
            .attr("class", "node")
            .attr("r", (d) => size(d.value * SCALE_UP))
            .attr("cx", SVG_WIDTH / 2)
            .attr("cy", SVG_HEIGHT / 2)
            .call(circle => circle.append("title").text(TOOLTIP))
            .style("fill", (d) => color(d.region))
            .style("fill-opacity", FILL_NORMAL_OPACITY)
            .style("opacity", FILL_NORMAL_OPACITY)
            .attr("stroke", STROKE_NORMAL_COLOUR)
            .style("stroke-opacity", STROKE_NORMAL_OPACITY)
            .style("stroke-width", STROKE_WIDTH)
            .on("mouseover", overEvent)
            .on("mouseleave", leaveEvent)
            .call(d3.drag()
                .on("start", (e, d) => dragstarted(simulation, e, d))
                .on("drag", (e, d) => dragged(simulation, e, d))
                .on("end", (e, d) => dragended(simulation, e, d)));
        const labels = nodeGroup
            .selectAll("text")
            .data(dataset)
            .join("text")
            .attr("class", "node-label")
            .attr("x", SVG_WIDTH / 2)
            .attr("y", SVG_HEIGHT / 2)
            .text(d => d.value > LABEL_DISPLAY_VALUE &&
                d.key.length < LABEL_DISPLAY_MAX_LENGTH
                ? d.key : "")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .style("pointer-events", "none")
            .style("fill", "black")
            .style("font-size", "12px");

        simulation
            .nodes(dataset)
            .on("tick", () => {
                node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
                labels.attr("x", (d) => d.x).attr("y", (d) => d.y);
            });
    });
    return (<svg ref={ref} className="Section8-bubble" height={SVG_HEIGHT} width={SVG_WIDTH}/>);
}

/**
 * Initializes the dragging event by setting the alpha target
 * and fixing the node's x and y coordinates.
 * @param simulation
 * @param {*} event
 * @param {*} d
 */
function dragstarted(simulation, event, d) {
    if (!event.active) simulation.alphaTarget(SIMULATION_ALPHA).restart();
    d.fx = d.x;
    d.fy = d.y;
}

/**
 * Setting the fixed (x, y) position of the dragged element
 * based on the position of the mouse pointer during dragging.
 * @param simulation
 * @param {*} event
 * @param {*} d
 */
function dragged(simulation, event, d) {
    d.fx = event.x;
    d.fy = event.y;
}

/**
 * Stop dragging a visual element,
 * reset its position,
 * and decrease the simulation alpha target.
 * @param simulation
 * @param {*} event
 * @param {*} d
 */
function dragended(simulation, event, d) {
    if (!event.active) simulation.alphaTarget(SIMULATION_ALPHA);
    d.fx = null;
    d.fy = null;
}

const overEvent = function (event, d) {
    d3
        .select(this)
        .style("stroke", STROKE_HOVER_COLOUR)
        .style("opacity", FILL_HOVER_OPACITY)
        .style("stroke-width", STROKE_HOVER_WIDTH)
        .style("stroke-opacity", STROKE_HOVER_OPACITY);
    SHARED.updateLineChart(d.key);
};

/**
 * The bubble reverts to its original status when the mouse leaves
 */
const leaveEvent = function () {
    d3
        .select(this)
        .style("stroke", STROKE_NORMAL_COLOUR)
        .style("opacity", FILL_NORMAL_OPACITY)
        .style("stroke-width", STROKE_WIDTH)
        .style("stroke-opacity", STROKE_NORMAL_OPACITY);
};