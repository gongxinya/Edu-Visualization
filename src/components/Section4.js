/**
 * The heatmap illustrates the correlations among the various indicators utilised in the calculation of rankings within
 * the 2023 QS World University Rankings.
 * Derived from https://d3-graph-gallery.com/graph/heatmap_style.html
 * Data Source: QS World University Rankings by Subject 2022 Excel Result Table. (2022). QS.
 * https://www.qs.com/portfolio-items/qs-world-university-rankings-by-subject-2022
 */

import React          from "react";
import * as d3        from "d3";
import dataset        from "../data/json/2023-QS-Corr.json";
import {FOOTNOTE_REF} from "../App";

/* HEATMAP CONFIG */
const SVG_WIDTH               = 550;
const SVG_HEIGHT              = 550;
const CANVAS_MARGIN           = {top: 0, right: 0, bottom: 220, left: 220};
const CANVAS_WIDTH            = SVG_WIDTH - CANVAS_MARGIN.left - CANVAS_MARGIN.right;
const CANVAS_HEIGHT           = SVG_HEIGHT - CANVAS_MARGIN.top - CANVAS_MARGIN.bottom;
const LABEL_FONT_SIZE         = 14;
const PADDING_SQUARES         = 0.05;
const MOUSE_HOVER_STROKE_LINE = "rgb(43, 43, 43)";
const ROUNDED_CORNER_RADIUS   = 4;
const SQUARE_OPACITY          = 0.7;
const SQUARE_STROKE_WIDTH     = 8;

/* CUBE CONFIG */
const CUBE_HEIGHT = 40;
const CUBE_NUMBER = 8;
const CUBE_WIDTH  = 40;
const CUBES_WIDTH = 400;

const DATA = dataset;

export default function Section4() {
    return (
        <div className="Section4" id="Section4-Container">
            <Heatmap/>
            <div className="Section4-title">
                <h3>Universities with a high academic reputation also tend to have a high employer reputation
                    <br/>
                    <br/> A lower student-to-faculty ratio may contribute somewhat to better reputations,
                    <br/> but it's not a strong driving factor
                </h3>
                <h1>KEY UNIVERSITY ATTRIBUTES</h1>
                <h1 id="line2">Correlation Analysis</h1>
                <h2>University reputation is driven by research, global networks,
                    <br/> employment outcomes, and international diversity.</h2>
                <h3>This chart illustrates the correlations among various indicators for each university featured
                    <br/>in the 2023 QS World University Rankings.
                    <a href="/" onClick={event => {
                        event.preventDefault();
                        FOOTNOTE_REF.current.scrollIntoView({behavior: 'smooth'});
                    }}>[1]</a>
                </h3>
                <br/>
                <ColorCubes/>
                <h4>The blocks arranged from left to right signify an increasing degree of correlation.</h4>
            </div>
        </div>
    );
}

function Heatmap() {
    const ref        = React.useRef();
    const Xs         = Array.from(new Set(DATA.map(d => d.x)));
    const Ys         = Array.from(new Set(DATA.map(d => d.y)));
    const colorScale = d3
        .scaleSequential()
        .interpolator(d3.interpolateInferno)
        .domain([Math.min(...DATA.map(d => d.value)),
                 Math.max(...DATA.map(d => d.value))]);

    React.useEffect(() => {
        const svg              = d3.select(ref.current);
        const [axis_X, axis_Y] = axes(svg, Xs, Ys);
        buildSquares(svg, DATA, axis_X, axis_Y, colorScale);
    });

    return (<svg ref={ref} className="Section4-Heatmap" width={SVG_WIDTH} height={SVG_HEIGHT}/>);
}

/**
 * X-Axis and Y-Axis
 * @param svg Svg container
 * @param Xs Data for X-Axis
 * @param Ys Data for Y-Axis
 * @returns {*[]}
 */
function axes(svg, Xs, Ys) {
    /* X axis */
    const axis_X = d3
        .scaleBand()
        .range([CANVAS_WIDTH, 0])
        .domain(Xs)
        .padding(PADDING_SQUARES);
    svg.append("g")
        .style("font-size", LABEL_FONT_SIZE)
        .attr("transform", `translate(${CANVAS_MARGIN.left}, ${CANVAS_HEIGHT})`)
        .call(d3.axisBottom(axis_X).tickSize(0))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-0.5em")
        .attr("dy", "0.5em")
        .attr("transform", "rotate(-60)");
    svg.select(".domain").remove();

    /* Y axis */
    const axis_Y = d3
        .scaleBand()
        .range([CANVAS_HEIGHT, 0])
        .domain(Ys)
        .padding(PADDING_SQUARES);
    svg.append("g")
        .style("font-size", LABEL_FONT_SIZE)
        .attr("transform", `translate(${CANVAS_MARGIN.left}, 0)`)
        .call(d3.axisLeft(axis_Y).tickSize(0));
    svg.select(".domain").remove();

    return [axis_X, axis_Y];
}

/**
 * Add squares to the heatmap
 * @param svg Svg container
 * @param data Data
 * @param axis_X X-Axis
 * @param axis_Y Y-Axis
 * @param colorScale Color Scale
 */
function buildSquares(svg, data, axis_X, axis_Y, colorScale) {
    const hoverEvent = function () {
        d3.select(this).style("stroke", MOUSE_HOVER_STROKE_LINE).style("opacity", 1);
    };
    const leaveEvent = function () {
        d3.select(this).style("stroke", "none").style("opacity", 0.8);
    };
    svg.selectAll()
        .data(data, d => `${d.x}:${d.y}`)
        .join("rect")
        .attr("x", d => axis_X(d.x) + CANVAS_MARGIN.left)
        .attr("y", d => axis_Y(d.y))
        .attr("rx", ROUNDED_CORNER_RADIUS)
        .attr("ry", ROUNDED_CORNER_RADIUS)
        .attr("width", axis_X.bandwidth())
        .attr("height", axis_Y.bandwidth())
        .call(circle => circle.append("title").text(d => `${d.value}`))
        .style("fill", d => colorScale(d.value))
        .style("stroke-width", SQUARE_STROKE_WIDTH)
        .style("stroke", "none")
        .style("opacity", SQUARE_OPACITY)
        .on("mouseover", hoverEvent)
        .on("mouseleave", leaveEvent);
}

/**
 * Legend.
 * @returns {JSX.Element}
 */
function ColorCubes() {
    const ref   = React.useRef();
    const dots  = Array.from(Array(CUBE_NUMBER).keys());
    const color = d3.scaleSequential().interpolator(d3.interpolateInferno).domain([0, CUBE_NUMBER]);

    React.useEffect(() => {
        const svg = d3.select(ref.current);
        svg
            .selectAll(".firstrow")
            .data(dots)
            .enter()
            .append("rect")
            .attr("x", (d, i) => 5 + i * (CUBE_WIDTH + 10))
            .attr("opacity", SQUARE_OPACITY)
            .attr("rx", ROUNDED_CORNER_RADIUS)
            .attr("ry", ROUNDED_CORNER_RADIUS)
            .attr("width", CUBE_WIDTH)
            .attr("height", CUBE_WIDTH)
            .attr("fill", d => color(d));
    });

    return (<svg ref={ref} className="ColorBar" height={CUBE_HEIGHT} width={CUBES_WIDTH}/>);
}