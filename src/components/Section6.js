/**
 * An interactive bubble chart that presents an analysis of the relationships between GDP, average learning outcomes,
 * and population growth in countries worldwide over an extended period, spanning from 1870 to 2010.
 * Data Source: https://ourworldindata.org/global-education
 */
import React              from "react";
import * as d3            from "d3";
import {sliderHorizontal} from "d3-simple-slider";
import dataset            from "../data/json/learning-outcomes-1970-2015.json";
import {FOOTNOTE_REF}     from "../App";

const SVG_WIDTH             = 700;
const SVG_HEIGHT            = 660;
const CANVAS_MARGIN         = {top: 40, right: 10, bottom: 40, left: 50};
const CANVAS_WIDTH          = SVG_WIDTH - CANVAS_MARGIN.left - CANVAS_MARGIN.right;
const CANVAS_HEIGHT         = SVG_HEIGHT - CANVAS_MARGIN.top - CANVAS_MARGIN.bottom;
const X_AXIS_RANGE          = [600, 157000];
const Y_AXIS_RANGE          = [140, 620];
const X_AXIS_TICKS          = 10;
const X_AXIS_LABEL_Y_OFFSET = 30;
const Y_AXIS_LABEL_X_OFFSET = -10;
const Y_AXIS_LABEL_Y_OFFSET = -10;
const SLIDER_WIDTH          = 400;
const SLIDER_HEIGHT         = 80;
const AREA_OPACITY          = 0.6;
const AREA_OPACITY_NORMAL   = 1;

const AREA_RADIUS = d3.scaleSqrt([0, 5e8], [0, CANVAS_WIDTH / 24]);

const COLOR_LABEL = "Entity";
const AREA_LABEL  = "Population";
const X_LABEL     = "GDP per capita";
const Y_LABEL     = "Average harmonised learning outcome score";

const DEFAULT_YEAR              = 2010;
const SLIDER_STEP               = 5;
const SLIDER_ANIMATION_TIMEOUT  = 500;
const SLIDER_ANIMATION_IN_TEXT  = "Visualize Historical Trends";
const SLIDER_ANIMATION_OUT_TEXT = "Stop";

const dataByYear = year => dataset[year];
const TOOLTIP    = data =>
    `${COLOR_LABEL}: ${data[COLOR_LABEL]}\n` +
    `${AREA_LABEL}: ${data[AREA_LABEL]}\n` +
    `${X_LABEL}: ${data[X_LABEL]}\n` +
    `${Y_LABEL}: ${data[Y_LABEL]}`;

export default function Section6() {
    return (
        <div className="Section6">
            <Gapminder/>
            <div className="Section6-title">
                <h4 style={{"marginBottom": "10px"}}>
                    The learning outcomes are calculated using average student test scores after homogenizing and
                    <br/>
                    pooling international and regional student assessments across education levels and subjects.
                </h4>
                <h3>This interactive chart presents an in-depth analysis of the intricate relationships between GDP,
                    <br/>average learning outcomes, and population growth in countries worldwide over an extended
                    period,
                    <br/>spanning from 1870 to 2010.
                </h3>
                <h1>Interlinking Global Dynamics</h1>
                <h2>GDP, Learning Outcomes, and Population Growth from 1870 to 2010
                    <a href="/" onClick={event => {
                        event.preventDefault();
                        FOOTNOTE_REF.current.scrollIntoView({behavior: 'smooth'});
                    }}>[3,8,9]</a>
                </h2>
                <h3>It is evident that learning outcomes generally exhibit a higher degree in more affluent nations.
                    <br/>However, substantial disparities persist across countries, even among those with comparable
                    <br/>per capita income levels.</h3>
                <div id="Section6-slider"></div>
                <button id="Section6-slider-button">{SLIDER_ANIMATION_IN_TEXT}</button>
                <h4>Hover over data points to view detailed information.
                    <br/>Slide the slider to change the time period.
                    <br/>Click the button to display the Historical Trends animation.</h4>
            </div>
        </div>
    );
}


function Gapminder() {
    const ref      = React.useRef();
    const years    = Object.keys(dataset).map(x => parseInt(x));
    const entities = Array.from(
        new Set(Object.values(dataset)
            .flatMap(year => year.filter(obj => COLOR_LABEL in obj)
                .map(obj => obj[COLOR_LABEL])))
    );
    const color    = d3.scaleOrdinal(entities, d3.schemeCategory10).unknown("#F2F2EE");

    const Xs             = d3.scaleLog(X_AXIS_RANGE, [CANVAS_MARGIN.left, CANVAS_WIDTH]);
    const Ys             = d3.scaleLinear(Y_AXIS_RANGE, [CANVAS_HEIGHT + CANVAS_MARGIN.top, CANVAS_MARGIN.top]);
    const [axisX, axisY] = axes(Xs, Ys);
    const grids          = grid(Xs, Ys);

    const mouseenter = function () {
        d3.select(this).attr("opacity", AREA_OPACITY_NORMAL);
    };
    const mouseleave = function () {
        d3.select(this).attr("opacity", AREA_OPACITY);
    };

    /**
     * Update the svg using data in specified year.
     */
    const update = (svg, year) => {
        const updatedData = dataByYear(year);
        const areas       = svg.selectAll("circle").data(updatedData, d => d[AREA_LABEL]);
        areas
            .join("circle")
            .sort((a, b) => d3.descending(a[AREA_LABEL], b[AREA_LABEL]))
            .attr("cx", d => Xs(d[X_LABEL]))
            .attr("cy", d => Ys(d[Y_LABEL]))
            .attr("r", d => AREA_RADIUS(d[AREA_LABEL]))
            .attr("fill", d => color(d[COLOR_LABEL]))
            .attr("opacity", AREA_OPACITY)
            .call(circle => circle.append("title").text(TOOLTIP))
            .on("mouseenter", mouseenter)
            .on("mouseleave", mouseleave);
    };

    React.useEffect(() => {
        const svg = d3.select(ref.current);
        svg.append("g").call(axisX);
        svg.append("g").call(axisY);
        svg.append("g").call(grids);

        update(svg, DEFAULT_YEAR);
        const slider = sliderHorizontal()
            .tickValues(years)
            .default(DEFAULT_YEAR)
            .min(Math.min(...years))
            .max(Math.max(...years))
            .step(SLIDER_STEP)
            .width(SLIDER_WIDTH)
            .displayValue(false)
            .on('onchange', val => update(svg, val));
        d3.select("#Section6-slider")
            .append('svg')
            .attr('width', SLIDER_WIDTH + 80)
            .attr('height', SLIDER_HEIGHT)
            .append('g')
            .attr('transform', 'translate(30,30)')
            .call(slider);
        sliderEvent(slider, years);
    });
    return (<svg ref={ref} width={SVG_WIDTH} height={SVG_HEIGHT}/>);
}

/**
 * X-Axis and Y-Axis
 * @param Xs Data for X-Axis
 * @param Ys Data for Y-Axis
 * @returns {*[]}
 */
function axes(Xs, Ys) {
    /* X axis */
    const axisX = g => g
        .attr("transform", `translate(0,${CANVAS_HEIGHT + CANVAS_MARGIN.top})`)
        .call(d3.axisBottom(Xs).ticks(X_AXIS_TICKS))
        .call(g => g.append("text")
            .attr("x", CANVAS_WIDTH)
            .attr("y", X_AXIS_LABEL_Y_OFFSET)
            .attr("fill", "currentColor")
            .attr("text-anchor", "end")
            .text(`${X_LABEL}`));

    /* Y axis */
    const axisY = g => g
        .attr("transform", `translate(${CANVAS_MARGIN.left},0)`)
        .call(d3.axisLeft(Ys))
        .call(g => g.append("text")
            .attr("x", Y_AXIS_LABEL_X_OFFSET)
            .attr("y", CANVAS_MARGIN.top + Y_AXIS_LABEL_Y_OFFSET)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text(`${Y_LABEL}`));

    return [axisX, axisY];
}

/**
 * Grids.
 * @param Xs Data for X-Axis
 * @param Ys Data for Y-Axis
 * @returns {function(*): *}
 */
function grid(Xs, Ys) {
    return g => g
        .attr("stroke", "currentColor")
        .attr("stroke-opacity", 0.1)
        .call(g => g.append("g")
            .selectAll("line")
            .data(Xs.ticks())
            .join("line")
            .attr("x1", d => 0.5 + Xs(d))
            .attr("x2", d => 0.5 + Xs(d))
            .attr("y1", CANVAS_MARGIN.top)
            .attr("y2", CANVAS_MARGIN.top + CANVAS_HEIGHT))
        .call(g => g.append("g")
            .selectAll("line")
            .data(Ys.ticks())
            .join("line")
            .attr("y1", d => 0.5 + Ys(d))
            .attr("y2", d => 0.5 + Ys(d))
            .attr("x1", CANVAS_MARGIN.left)
            .attr("x2", CANVAS_WIDTH));
}

/**
 * set up the time slider
 * @param {*} slider 
 * @param {*} options 
 */
function sliderEvent(slider, options) {
    const button = document.getElementById("Section6-slider-button");
    let intervalId;

    button.addEventListener("click", () => {
        let currentValue = Math.max(...options);
        if (intervalId) {
            clearInterval(intervalId);
            intervalId       = null;
            button.innerText = SLIDER_ANIMATION_IN_TEXT;
        } else {
            button.innerText = SLIDER_ANIMATION_OUT_TEXT;
            intervalId       = setInterval(() => {
                currentValue += SLIDER_STEP;
                if (currentValue > Math.max(...options)) currentValue = Math.min(...options);
                slider.value(currentValue);
                slider.on("onchange")(currentValue);
            }, SLIDER_ANIMATION_TIMEOUT);
        }
    });
}