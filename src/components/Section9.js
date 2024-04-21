import React              from "react";
import * as d3            from "d3";
import dataset            from "../data/json/linechart.json";
import {sliderHorizontal} from "d3-simple-slider";
import {FOOTNOTE_REF}     from "../App";

const SVG_WIDTH                 = 700;
const SVG_HEIGHT                = 650;
const CANVAS_MARGIN             = {top: 50, right: 30, bottom: 50, left: 30};
const CANVAS_WIDTH              = SVG_WIDTH - CANVAS_MARGIN.left - CANVAS_MARGIN.right;
const CANVAS_HEIGHT             = SVG_HEIGHT - CANVAS_MARGIN.top - CANVAS_MARGIN.bottom;
const X_AXIS_TICKS              = 10;
const X_AXIS_LABEL_Y_OFFSET     = 30;
const Y_AXIS_LABEL_X_OFFSET     = -10;
const Y_AXIS_LABEL_Y_OFFSET     = -10;
const X_LABEL                   = "Year";
const Y_LABEL                   = "Female-to-male ratio";
const SLIDER_ANIMATION_IN_TEXT  = "Visualize Historical Trends";
const SLIDER_ANIMATION_OUT_TEXT = "Stop";
const SLIDER_ANIMATION_TIMEOUT  = 500;


const REGIONS                   = ["Advanced Economies", "Asia and the Pacific", "Eastern Europe",
                                   "Latin America and the Caribbean", "Middle East and North Africa", "Sub-Saharan Africa"];
const TICK_VALUES               = [1870, 1890, 1910, 1930, 1950, 1970, 1990, 2010];
const MIN_YEAR                  = 1870;
const MAX_YEAR                  = 2010;
const DEFAULT_YEAR              = 1870;
const SLIDER_STEP               = 5;
const SLIDER_WIDTH              = 400;
const SLIDER_HEIGHT             = 80;
const CUBE_WIDTH                = 250;
const CUBE_HEIGHT               = 30;
const ROUNDED_CORNER_RADIUS     = 10;
const CUBE_OPACITY              = 0.7;
const LINES_STROKE_WIDTH_HOVER  = 3;
const LINES_STROKE_WIDTH_NORMAL = 2;
const DOTS_RADIUS_HOVER         = 8;
const DOTS_RADIUS_NORMAL        = 4;

const color = d3.scaleOrdinal().domain(REGIONS).range(d3.schemeSet2);

export default function Section9() {
    return (
        <div className="Section9">
            <LineChart/>
            <div className="Section9-title">
                <h3>There has been a strong upward trend in the gender ratios across all world regions, indicating
                    <br/>a decline in the inequality between men and women in access to education.
                </h3>
                <h1>Closing the Gender Gap</h1>
                <h2>Gender ratios for average years of schooling, 1870 to 2010
                    <a href="/" onClick={event => {
                        event.preventDefault();
                        FOOTNOTE_REF.current.scrollIntoView({behavior: 'smooth'});
                    }}>[9]</a>
                </h2>
                <h3>Female-to-male ratio of the average number of years people aged 15-64 participated in formal
                    <br/>education, expressed in percents.</h3>
                <div id="Section9-slider"></div>
                <button id="Section9-slider-button">{SLIDER_ANIMATION_IN_TEXT}</button>
                <h4>Hover over data points to view detailed information.
                    <br/>Slide the slider to change the time period.
                    <br/>Click the button to display the Historical Trends animation.
                </h4>
                <br/>
                <Legend data={REGIONS} range={[0, 2]}/>
                <br/>
                <Legend data={REGIONS} range={[2, 4]}/>
                <br/>
                <Legend data={REGIONS} range={[4, 6]}/>
            </div>
        </div>
    );
}

/**
 * Add legend below text
 * @param {*} props 
 * @returns 
 */
function Legend(props) {
    const ref  = React.useRef();
    const list = props.data.slice(props.range[0], props.range[1]);
    const dots = Array.from(Array(list.length).keys());
    React.useEffect(() => {
        const svg   = d3.select(ref.current);
        const cubes = svg
            .selectAll(".firstrow")
            .data(dots)
            .enter();
        cubes
            .append("rect")
            .attr("x", (d, i) => 5 + i * (CUBE_WIDTH + 10))
            .attr("opacity", CUBE_OPACITY)
            .attr("rx", ROUNDED_CORNER_RADIUS)
            .attr("ry", ROUNDED_CORNER_RADIUS)
            .attr("width", CUBE_WIDTH)
            .attr("height", CUBE_HEIGHT)
            .attr("fill", (d, i) => color(i + props.range[0]));
        cubes
            .append("text")
            .attr("x", (d, i) => 5 + i * (CUBE_WIDTH + 10) + CUBE_WIDTH / 2)
            .attr("y", CUBE_HEIGHT / 2 - 2)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .text((d, i) => list[i])
            .style("fill", "#F2F2EE");
    });

    return (<svg ref={ref} className="Legend" height={CUBE_HEIGHT}
                 width={5 + list.length * (CUBE_WIDTH + 10)}/>);
}

/**
 * set up LineChart
 * @returns 
 */
function LineChart() {
    const ref            = React.useRef();
    const data           = prepareData();
    const Xs             = d3.scaleLinear([MIN_YEAR, MAX_YEAR], [0, CANVAS_WIDTH]);
    const Ys             = d3.scaleLinear([0, 110], [CANVAS_HEIGHT, 0]);
    const [axisX, axisY] = axes(Xs, Ys);
    const grids          = grid(Xs, Ys);
    const lines          = d3.line().x(d => Xs(+d.time)).y(d => Ys(+d.value));


    React.useEffect(() => {
        const svg = d3.select(ref.current);
        svg.append("g").call(axisX);
        svg.append("g").call(axisY);
        svg.append("g").call(grids);
        const canvas = clip(svg);
        addLines(canvas, data, color, lines);
        addDots(canvas, data, color, Xs, Ys);

        const sliderEvent = ([min, max]) => {
            const filteredData = data.map(d => {
                const filteredValues = d.values.filter(v => v.time >= MIN_YEAR && v.time <= MAX_YEAR);
                return {...d, values: filteredValues};
            });
            Xs.domain([min, max]);
            svg.select(".section9-x-axis").call(d3.axisBottom(Xs).ticks(X_AXIS_TICKS));
            canvas.selectAll(".section9-dots").attr("cx", d => Xs(d.time));
            canvas.selectAll(".section9-lines")
                .data(filteredData)
                .join("path")
                .attr("d", d => lines(d.values));
        };

        const slider = sliderHorizontal()
            .default(DEFAULT_YEAR)
            .tickValues(TICK_VALUES)
            .min(MIN_YEAR)
            .max(MAX_YEAR)
            .value([MIN_YEAR, MAX_YEAR])
            .step(SLIDER_STEP)
            .width(SLIDER_WIDTH)
            .displayValue(false)
            .on('onchange', sliderEvent);

        d3.select("#Section9-slider")
            .append('svg')
            .attr('width', SLIDER_WIDTH + 80)
            .attr('height', SLIDER_HEIGHT)
            .append('g')
            .attr('transform', 'translate(30,30)')
            .call(slider);

        buttonEvent(slider);
    });
    return (<svg ref={ref} width={SVG_WIDTH} height={SVG_HEIGHT}/>);
}

/**
 * add x-axis and y-axis
 * @param {*} Xs 
 * @param {*} Ys 
 * @returns 
 */
function axes(Xs, Ys) {
    const axisX = g => g
        .attr("class", "section9-x-axis")
        .attr("transform", `translate(${CANVAS_MARGIN.left},${CANVAS_HEIGHT + CANVAS_MARGIN.top})`)
        .call(d3.axisBottom(Xs).ticks(X_AXIS_TICKS))
        .call(g => g.append("text")
            .attr("x", CANVAS_WIDTH)
            .attr("y", X_AXIS_LABEL_Y_OFFSET)
            .attr("fill", "currentColor")
            .attr("text-anchor", "end")
            .text(`${X_LABEL}`));
    const axisY = g => g
        .attr("class", "section9-y-axis")
        .attr("transform", `translate(${CANVAS_MARGIN.left},${CANVAS_MARGIN.top})`)
        .call(d3.axisLeft(Ys))
        .call(g => g.append("text")
            .attr("x", Y_AXIS_LABEL_X_OFFSET)
            .attr("y", Y_AXIS_LABEL_Y_OFFSET)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text(`${Y_LABEL}`));

    return [axisX, axisY];
}

/**
 * data processing
 * @returns 
 */
function prepareData() {
    return REGIONS.map(function (grpName) { // .map allows to do something for each element of the list
        return {
            name: grpName,
            values: dataset.map(function (d) {
                return {time: d.time, value: +d[grpName]};
            })
        };
    });
}

/**
 * add clip to svg
 * @param {*} svg 
 * @returns 
 */
function clip(svg) {
    svg.append("defs")
        .append("clipPath")
        .attr("id", "chart-area")
        .append("rect")
        .attr("width", CANVAS_WIDTH)
        .attr("height", CANVAS_HEIGHT);
    return svg.append("g")
        .attr("transform", `translate(${CANVAS_MARGIN.left},${CANVAS_MARGIN.top})`)
        .attr("clip-path", "url(#chart-area)");
}

/**
 * add line to line graph
 * @param {*} svg 
 * @param {*} data 
 * @param {*} color 
 * @param {*} lines 
 */
function addLines(svg, data, color, lines) {
    const mousemove  = function () {
        d3.select(this).style("stroke-width", LINES_STROKE_WIDTH_HOVER);
    };
    const mouseleave = function () {
        d3.select(this).style("stroke-width", LINES_STROKE_WIDTH_NORMAL);
    };

    svg.selectAll()
        .data(data)
        .join("path")
        .attr("class", "section9-lines")
        .attr("d", d => lines(d.values))
        .attr("stroke", d => color(d.name))
        .style("stroke-width", 2)
        .style("fill", "none")
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
        .call(circle => circle.append("title").text(d => `Region: ${d.name}`));
}

/**
 * add dots to graph on line
 * @param {*} svg 
 * @param {*} data 
 * @param {*} color 
 * @param {*} Xs 
 * @param {*} Ys 
 */
function addDots(svg, data, color, Xs, Ys) {
    const mousemove  = function () {
        d3.select(this).attr("r", DOTS_RADIUS_HOVER);
    };
    const mouseleave = function () {
        d3.select(this).attr("r", DOTS_RADIUS_NORMAL);
    };

    svg
        .selectAll()
        .data(data)
        .join('g')
        .style("fill", d => color(d.name))
        .selectAll("myPoints")
        .data(d => d.values)
        .join("circle")
        .attr("class", "section9-dots")
        .attr("cx", d => Xs(d.time))
        .attr("cy", d => Ys(d.value))
        .attr("r", 4)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
        .call(circle => circle.append("title").text(d =>
            `Female-to-male Ratio: ${d.value}\n` +
            `Year: ${d.time}\n`
        ));
}

/**
 * add grid line to graph 
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
            .attr("y1", d => 0.5 + Ys(d) + CANVAS_MARGIN.top)
            .attr("y2", d => 0.5 + Ys(d) + CANVAS_MARGIN.top)
            .attr("x1", CANVAS_MARGIN.left)
            .attr("x2", CANVAS_WIDTH + CANVAS_MARGIN.left));
}

/**
 * setup time slider
 * @param {*} slider 
 */
function buttonEvent(slider) {
    const button = document.getElementById("Section9-slider-button");
    let intervalId;
    button.addEventListener("click", () => {
        let currentValue = MIN_YEAR;
        if (intervalId) {
            clearInterval(intervalId);
            intervalId       = null;
            button.innerText = SLIDER_ANIMATION_IN_TEXT;
        } else {
            button.innerText = SLIDER_ANIMATION_OUT_TEXT;
            intervalId       = setInterval(() => {
                currentValue += SLIDER_STEP;
                if (currentValue > MAX_YEAR) currentValue = MIN_YEAR;
                slider.value([MIN_YEAR, currentValue]);
                slider.on("onchange")([MIN_YEAR, currentValue]);
            }, SLIDER_ANIMATION_TIMEOUT);
        }
    });
}