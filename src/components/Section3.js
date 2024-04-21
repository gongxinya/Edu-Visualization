/**
 * An interactive chart provides a comprehensive representation of the academic contributions made by universities from
 * various countries across multiple disciplines.
 * Derived From https://observablehq.com/@d3/zoomable-sunburst.
 * Data Source: https://www.topuniversities.com/subject-rankings/2022
 */

import React          from "react";
import dataset        from "../data/json/Sunburst.json";
import * as d3        from "d3";
import {FOOTNOTE_REF} from "../App";

/* SVG CONFIG */
const SVG_WIDTH  = 700;
const SVG_HEIGHT = 700;
const SVG_RADIUS = SVG_WIDTH / 7;
const CTR_RADIUS = SVG_RADIUS;

/* PIE FONT SETTINGS */
const FONT_SIZE   = "12px";
const FONT_WEIGHT = "400";
const FONT_COLOR  = "#d3d3cf";

/* PIE SETTINGS */
const PIE_COLORS       = d3.scaleOrdinal(d3.quantize(d3.interpolateHcl("#f4e153", "#362142"), dataset.children.length));
const PIE_PAD_RADIUS   = SVG_RADIUS * 1.5;
const PIE_PAD_ANGLE    = d => Math.min((d.x1 - d.x0) / 2, 0.005);
const PIE_INNER_RADIUS = d => d.y0 * SVG_RADIUS;
const PIE_OUTER_RADIUS = d => Math.max(d.y0 * SVG_RADIUS, d.y1 * SVG_RADIUS - 1);

/* LABEL SETTINGS */
const LABEL_VISIBLE   = d =>                                            // If labels are overlapping, we simply hide them
    d.y1 <= 3 &&
    d.y0 >= 1 &&
    (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
const LABEL_TRANSFORM = d => {                                          // Rotate labels and fit them in their arcs
    const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
    const y = (d.y0 + d.y1) / 2 * SVG_RADIUS;
    return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
};

/* ARC SETTINGS */
const ARC_PARENT_OPACITY = 0.6;
const ARC_CHILD_OPACITY  = 0.2;
const ARC_TRANS_DURATION = 750;

const ARC         = d3                                                  // A D3 Arc Wrapper
    .arc()
    .startAngle(d => d.x0)
    .endAngle(d => d.x1)
    .padAngle(PIE_PAD_ANGLE)
    .padRadius(PIE_PAD_RADIUS)
    .innerRadius(PIE_INNER_RADIUS)
    .outerRadius(PIE_OUTER_RADIUS);
const ARC_VISIBLE = d => d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;         // We only display a maximum of two arcs
const ARC_COLOR   = d => {                                              // Set the fill color of each path using a color based on the parent node
    while (d.depth > 1) d = d.parent;
    return PIE_COLORS(d.data.name);
};

const ARC_OPACITY_CURR = d => ARC_VISIBLE(d.current) ?                  // Current Child arcs/categories have lower opacity
                              (d.children ? ARC_PARENT_OPACITY : ARC_CHILD_OPACITY) : 0;
const ARC_OPACITY_TGRT = d => ARC_VISIBLE(d.target) ?                   // Target Child arcs/categories have lower opacity
                              (d.children ? ARC_PARENT_OPACITY : ARC_CHILD_OPACITY) : 0;

const ARC_PTR_EVE_CURR = d => ARC_VISIBLE(d.current) ? "auto" : "none"; // Pointer Event on the current Arcs: switch between auto and none
const ARC_PTR_EVE_TGRT = d => ARC_VISIBLE(d.target) ? "auto" : "none";  // Pointer Event on the target Arcs: switch between auto and none

/**
 * A Zoom-able Sunburst Chart
 * @returns {JSX.Element}
 * @constructor
 */
export default function Section3() {
    return (
        <div className="Section3">
            <Sunburst/>
            <div className="Section3-title">
                <h3>Gain insights into the global distribution of academic excellence.
                    <br/>
                    <br/> Certain countries dominate in certain fields,
                    <br/> while others have a more diverse range of top-ranked institutions across different fields.
                </h3>
                <h1>GLOBAL TOP UNI</h1>
                <h1 id="line2">BY FIELDS</h1>
                <h2>A Global Comparison of Top Universities Across Fields of Study
                    <a href="/" onClick={event => {
                        event.preventDefault();
                        FOOTNOTE_REF.current.scrollIntoView({behavior: 'smooth'});
                    }}>[2]</a>
                </h2>
                <h3>This interactive chart provides a comprehensive representation of the academic contributions made by
                    <br/>universities from various countries across multiple disciplines.</h3>
                <br/>
                <Legend/>
                <h4>A larger proportion indicates that a country possesses a greater number of top-tier universities
                    <br/>that have made significant contributions to the respective field of study.
                    <br/>
                    <br/>The academic contributions for each country are represented by the sum of the
                    <br/>Academic Reputation scores in the respective fields for all universities within that nation.
                    <br/>
                    <br/>Click to expand a particular category.
                    <br/>Click on the circle's center to return to the previous level.
                </h4>
            </div>
        </div>
    );
}

function Legend() {
    const ref  = React.useRef();
    const dots = Array.from(Array(dataset.children.length).keys());
    const pos  = [0, 34, 74, 122, 178];
    const r0   = 4;

    React.useEffect(() => {
        const svg = d3.select(ref.current);
        svg
            .selectAll(".firstrow")
            .data(dots)
            .enter()
            .append("circle")
            .attr("cx", (d, i) => 5 + pos[i])
            .attr("cy", 20)
            .attr("r", (d, i) => r0 + i * r0)
            .attr("fill", "white")
            .attr("fill-opacity", 0.5);
    });

    return (<svg ref={ref} className="ColorBar" height={40}/>);
}

function Sunburst() {
    const ref  = React.useRef();
    const data = loadData(dataset);
    data.each(d => d.current = d);

    React.useEffect(() => {
        const svg = d3.select(ref.current);
        sunburstBuilder(svg, data);
    });

    return (<svg ref={ref} width={SVG_WIDTH} height={SVG_HEIGHT} className="Section3-sunburst"/>);
}

/**
 * Load data into d3 from a json dataset.
 * @param ds Dataset
 * @returns {*}
 */
function loadData(ds = dataset) {
    const data = d3
        .hierarchy(ds)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);
    return d3
        .partition()
        .size([2 * Math.PI, data.height + 1])(data);
}

/**
 * Builder for a sunburst chart.
 * @param svg Svg to hold the Sunburst chart.
 * @param data Data
 */
function sunburstBuilder(svg, data) {
    setViewBox(svg);
    const container = _container();
    const arcs      = _arcs();
    const labels    = _labels();
    const center    = _center();

    arcs.filter(d => d.children)
        .style("cursor", "pointer")
        .on("click", expandEvent);

    /**
     * Main container that contains labels, arcs, circles, etc.
     * A transform function is applied to an element and its children.
     *
     * @param transform Default transform function: move the group element by half of
     *                  the SVG_WIDTH along both the x- and y-axes.
     * @returns {*} The main container.
     * @private
     */
    function _container(transform = `translate(${SVG_WIDTH / 2},${SVG_WIDTH / 2})`) {
        return svg
            .append("g")
            .attr("transform", transform);
    }

    /**
     * A group of Arcs in the Sunburst SVG
     * We bind data to the selection where the data is an array of descendants of the root node of a hierarchical
     * data structure, excluding the root node
     * @param color Fill Color
     * @param opacity Opacity of fill color
     * @param pointerEvents Pointer events.
     * @returns {*} Arcs.
     * @private
     */
    function _arcs(
        color         = ARC_COLOR,
        opacity       = ARC_OPACITY_CURR,
        pointerEvents = ARC_PTR_EVE_CURR
    ) {
        return container
            .append("g")
            .selectAll("path")
            .data(data.descendants().slice(1))
            .join("path")
            .attr("fill", color)
            .attr("fill-opacity", opacity)
            .attr("pointer-events", pointerEvents)
            .attr("d", d => ARC(d.current));
    }

    /**
     * A groups of labels.
     * @param pointerEvents Pointer Events.
     * @param textAnchor Text Anchor.
     * @param userSelect Allowing users to select labels?
     * @param dy Offset of position.
     * @param opacity Opacity.
     * @param transform Transform function.
     * @returns {*}
     * @private Labels.
     */
    function _labels(
        pointerEvents = "none",
        textAnchor    = "middle",
        userSelect    = "none",
        dy            = "0.35em",
        opacity       = d => +LABEL_VISIBLE(d.current),
        transform     = d => LABEL_TRANSFORM(d.current)
    ) {
        return container
            .append("g")
            .attr("pointer-events", pointerEvents)
            .attr("text-anchor", textAnchor)
            .style("user-select", userSelect)
            .selectAll("text")
            .data(data.descendants().slice(1))
            .join("text")
            .attr("dy", dy)
            .attr("fill-opacity", opacity)
            .attr("transform", transform)
            .text(d => d.data.name);
    }

    /**
     * The hole in the center of the pie.
     * @param color Color of the hole.
     * @param radius Radius.
     * @param pointerEvents Pointer Events.
     * @returns {*} The hole.
     * @private
     */
    function _center(
        color         = "none",
        radius        = CTR_RADIUS,
        pointerEvents = "all"
    ) {
        return container.append("circle")
            .datum(data)
            .attr("r", radius)
            .attr("fill", color)
            .attr("pointer-events", pointerEvents)
            .on("click", expandEvent);
    }

    /**
     * The on click event for expanding subsections.
     * @param eve Event
     * @param p
     * @param arcTransitionDuration The duration of the transition
     * @param labelOpacity Opacity function for labels
     * @param labelTransform Transform function for labels
     * @param arcOpacity Opacity function for arcs
     * @param arcPointerEvent Pointer event for arcs
     */
    function expandEvent(
        eve,
        p,
        arcTransitionDuration = ARC_TRANS_DURATION,
        labelOpacity          = d => +LABEL_VISIBLE(d.target),
        labelTransform        = d => () => LABEL_TRANSFORM(d.current),
        arcOpacity            = ARC_OPACITY_TGRT,
        arcPointerEvent       = ARC_PTR_EVE_TGRT
    ) {
        center.datum(p.parent || data);
        data.each(d => d.target = {
            x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
            x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
            y0: Math.max(0, d.y0 - p.depth),
            y1: Math.max(0, d.y1 - p.depth)
        });

        /* Transition the data on all arcs, even the ones that are not visible */
        const t = container.transition().duration(arcTransitionDuration);
        arcs
            .transition(t)
            .tween("data", d => {
                const i = d3.interpolate(d.current, d.target);
                return t => d.current = i(t);
            })
            .filter(function (d) {
                return +this.getAttribute("fill-opacity") || ARC_VISIBLE(d.target);
            })
            .attr("fill-opacity", arcOpacity)
            .attr("pointer-events", arcPointerEvent)
            .attrTween("d", d => () => ARC(d.current));

        /* Filter visible labels and update its opacity and transform function */
        labels
            .filter(function (d) {
                return +this.getAttribute("fill-opacity") || LABEL_VISIBLE(d.target);
            })
            .transition(t)
            .attr("fill-opacity", labelOpacity)
            .attrTween("transform", labelTransform);
    }
}

/**
 * Font and The Visible Area of The SVG Canvas
 * @param svg Sunburst SVG
 * @param size The width and height of the view box
 * @param fontSize Size of font
 * @param fontWeight Weight of font
 * @param fontColor Color of text
 */
function setViewBox(
    svg,
    size       = SVG_WIDTH,
    fontSize   = FONT_SIZE,
    fontWeight = FONT_WEIGHT,
    fontColor  = FONT_COLOR
) {
    svg
        .attr("viewBox", [0, 0, size, size])
        .style("font-size", fontSize)
        .style("font-weight", fontWeight)
        .style("fill", fontColor);
}
