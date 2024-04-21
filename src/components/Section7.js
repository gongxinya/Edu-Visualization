import React          from "react";
import * as d3        from "d3";
import dataset        from "../data/json/chord.json";
import {FOOTNOTE_REF} from "../App";

const SVG_WIDTH = 1000;
const SVG_HEIGHT = 600;
const CANVAS_MARGIN = { top: 10, right: 20, bottom: 30, left: 250 };
const CANVAS_WIDTH = SVG_WIDTH - CANVAS_MARGIN.left - CANVAS_MARGIN.right;
const CANVAS_HEIGHT = SVG_HEIGHT - CANVAS_MARGIN.top - CANVAS_MARGIN.bottom;
const PATH_INNER_RATIO = 200;
const PATH_OUTER_RATIO = 210;
const PATH_ROTATION = 45;
const LINK_RATIO = 200;
const PAD_ANGLE = 0.05;
const HIDE_LINK = 5;
const OPACITY_HIGHLIGHT = 1;
const OPACITY_NORMAL = 0.3;
const HOVER_COLOR = "rgba(148,0,0,0.9)";
const LINK_ROTATION = 45;
const PATH_COLOR = "#F2F2EE";
const PATH_STROKE_WIDTH = 2;

const CUBE_NUMBER = 15;
const CUBE_WIDTH = 20;
const CUBE_HEIGHT = 40;
const CUBES_WIDTH = 420;
const ROUNDED_CORNER_RADIUS = 4;

const LABEL_TRANSLATE = PATH_INNER_RATIO + 40;
const LABEL_ROTATION = d => d.angle * 180 / Math.PI - 90;
const LABEL_TRANSFORM = d => `rotate(${isNaN(LABEL_ROTATION(d)) ? 0 : LABEL_ROTATION(d)}) 
                              translate(${LABEL_TRANSLATE}) 
                              ${d.angle > Math.PI ? `rotate(180)` : ""}`;
const COLORS =
    ["rgba(178,24,43,0.7)",
        "rgba(202,64,73,0.7)",
        "rgba(227,104,104,0.7)",
        "rgba(248, 144, 134, 0.7)",
        "rgba(244, 165, 97, 0.7)",
        "#00000000",
        "rgba(190, 152, 54, 0.7)",
        "rgba(140, 119, 49, 0.7)",
        "rgba(90, 86, 43, 0.7)",
        "rgba(120, 81, 169, 0.7)",
        "rgba(158, 116, 205, 0.7)",
        "rgba(196, 152, 240, 0.7)",
        "rgba(234, 187, 245, 0.7)",
        "rgba(222, 119, 174, 0.7)",
        "#00000000"];


export default function Section7() {
    return (
        <div className="Section7">
            <div className="Section7-title">
                <h4 style={{ "marginBottom": "10px" }}>
                    The outer arcs represent the proportion of universities from each country and academic field that
                    made it into the top five.
                    <br />The inner chords illustrate the academic contributions of these universities across different
                    fields,
                    <br />revealing the interconnectedness of nations and disciplines.
                </h4>
                <h3>In this chord diagram, we present an analysis of the top five universities in various academic
                    disciplines
                    <br />according to the 2022 QS World University Rankings.
                </h3>
                <h1>Global Distribution and <br />Interconnectivity</h1>
                <h2>of top universities in the 2022 QS World University Rankings
                    <a href="/" onClick={event => {
                        event.preventDefault();
                        FOOTNOTE_REF.current.scrollIntoView({behavior: 'smooth'});
                    }}>[2]</a>
                </h2>
                <ColorCubes />
                <p>Distinct colors are employed to represent various countries and academic fields
                    <br />Hovering the cursor over the elements to highlight the connections between countries and
                    academic fields</p>
                <h3>Approximately 70% of the institutions featured in the rankings are located in Europe and North
                    America.
                    <br />The United States exhibits a near-monopoly in the fields of natural sciences, social sciences
                    and
                    <br/>management, as well as life sciences.</h3>
            </div>
            <Chord />
        </div>
    );
}

/**
 * Set up chord
 * @returns 
 */
function Chord() {
    const ref       = React.useRef();
    const labels    = dataset.labels;
    const matrix    = dataset.matrix;
    const chordData = d3.chord().padAngle(PAD_ANGLE).sortSubgroups(d3.descending)(matrix);

    React.useEffect(() => {
        const svg = d3
            .select(ref.current)
            .append("g")
            .attr("transform", `translate(${CANVAS_WIDTH / 2},${CANVAS_HEIGHT / 2})`);
        addPaths(svg, chordData, labels, COLORS);
        addLabels(svg, labels);
        addLinks(svg, chordData, COLORS);
    });

    return (<svg ref={ref} width={SVG_WIDTH} height={SVG_HEIGHT} />);
}

/**
 * Add paths between the left and right arcs
 * @param svg
 * @param chordData
 * @param labels
 * @param colors
 */
function addPaths(svg, chordData, labels, colors) {
    const opacity = (d, j) => j === d.index ? OPACITY_HIGHLIGHT : OPACITY_NORMAL;

    svg
        .datum(chordData)
        .append("g")
        .attr("transform", `rotate(${PATH_ROTATION})`)
        .selectAll("g")
        .data(d => d.groups)
        .enter()
        .append("g")
        .append("path")
        .attr("class", "outer-arc")
        /*Modify the original chord diagram, hide the arcs directly above and directly below, 
        so that the chord diagram looks like the left and right are separated*/
        .style("stroke", (d, i) => labels[i + 1] === "" ? "none" : PATH_COLOR)
        .style("stroke-width", PATH_STROKE_WIDTH)
        .style("fill", (d, i) => labels[i + 1] === "" ? "none" : PATH_COLOR)
        .style("pointer-events", (d, i) => labels[i + 1] === "" ? "none" : "auto")
        .style("fill", (d, i) => colors[i])
        .attr("d", d3.arc().innerRadius(PATH_INNER_RATIO).outerRadius(PATH_OUTER_RATIO))
        .attr("id", (event, d, i) => "arc-" + i)
        .on("mouseenter", function (event, d, i) {
            svg.selectAll(".outer-arc").style("opacity", (_, j) => opacity(d, j));
            svg.selectAll(".links").style("opacity", 
                linkData => linkData.source.index === d.index || 
                            linkData.target.index === d.index ? OPACITY_HIGHLIGHT : OPACITY_NORMAL);
            // Highlight paths touched by the mouse while preventing hidden arcs from being highlighted
            if (i !== HIDE_LINK) {
                d3.select(this).style("fill", HOVER_COLOR);
                svg.select("#names-" + i).style("opacity", OPACITY_HIGHLIGHT);
                svg.select("#links-").filter(d => d.source.index !== d.index && d.target.index !== d.index);
            }
        })
        .on("mouseout", () => {
            svg.selectAll(".names").style("opacity", OPACITY_HIGHLIGHT);
            svg.selectAll(".links").style("opacity", OPACITY_HIGHLIGHT);
            svg.selectAll(".outer-arc").style("opacity", OPACITY_HIGHLIGHT).style("fill", d => colors[d.index]);
        });
}

/**
 * Add labels to chart on the left and right side
 * @param svg
 * @param labels
 */
function addLabels(svg, labels) {
    svg.selectAll("g")
        .append("text")
        .each(d => d.angle = (d.startAngle + d.endAngle) / 2)
        .attr("dy", ".35em")
        .attr("class", "names")
        .attr("text-anchor", d => d.angle > Math.PI ? "end" : null)
        .attr("transform", LABEL_TRANSFORM)
        .text((d, i) => labels[i]);
}

/**
 * Set mouse and chart interaction
 * @param svg
 * @param chordData
 * @param colors
 */
function addLinks(svg, chordData, colors) {
    const mousemove = function (event) {
        d3.select(".tooltip").attr("x", event.pageX).attr("y", event.pageY - 20);
    };
    const mouseenter = function (event, d) {
        if (d.source.index !== HIDE_LINK) {
            d3.select(this).style("fill", HOVER_COLOR);
            d3.select("svg")
                .append("text")
                .attr("class", "tooltip")
                .attr("x", event.pageX)
                .attr("y", event.pageY - 20)
                .text("Score: " + d.source.index);
        }
    };
    const mouseout = function () {
        d3.select(this).style("fill", d => (colors[d.source.index]));
        d3.select(".tooltip").remove();
    };

    svg
        .datum(chordData)
        .append("g")
        .attr("transform", `rotate(${LINK_ROTATION})`)
        .selectAll("path")
        .data(d => d)
        .enter()
        .append("path")
        .attr("class", "links")
        .attr("d", d3.ribbon().radius(LINK_RATIO))
        .style("fill", d => colors[d.source.index]) // colors depend on the source group. Change to target otherwise.
        .style("stroke", "transform")
        .on("mouseenter", mouseenter)
        .on("mousemove", mousemove)
        .on("mouseout", mouseout);
}

/**
 * Color block in description text
 * @returns 
 */
function ColorCubes() {
    const ref = React.useRef();
    const dots = Array.from(Array(CUBE_NUMBER).keys());

    React.useEffect(() => {
        const svg = d3.select(ref.current);
        svg
            .selectAll(".firstrow")
            .data(dots)
            .enter()
            .append("rect")
            .attr("x", (d, i) => 5 + i * (CUBE_WIDTH + 10))
            .attr("opacity", OPACITY_HIGHLIGHT)
            .attr("rx", ROUNDED_CORNER_RADIUS)
            .attr("ry", ROUNDED_CORNER_RADIUS)
            .attr("width", CUBE_WIDTH)
            .attr("height", CUBE_HEIGHT)
            .attr("fill", d => COLORS[d]);
    });

    return (<svg ref={ref} className="ColorBar" height={CUBE_HEIGHT} width={CUBES_WIDTH} />);
}