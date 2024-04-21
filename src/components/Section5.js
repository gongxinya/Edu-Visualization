/**
 * Three sub charts are integrated to present an overview of the historical trends and developments in global education.
 * Specifically, (1) a line chart that visualises the average estimated enrolment rates for primary education in 111
 * countries from 1870 to 2010, (2) a stacked area chart that illustrates the global literacy estimates spanning from
 * 1800 to 2014, and (3) a line chart that displays trends in the average number of years spent in school for 111
 * countries during the period of 1870-2017.
 * Data Source: https://ourworldindata.org/global-education
 */

import React          from "react";
import * as d3        from "d3";
import dataset1       from "../data/json/primary-enrollment-1820-2010.json";
import dataset2       from "../data/json/literate-illiterate-1800-2015.json";
import dataset3       from "../data/json/schooling-1870-2017.json";
import {FOOTNOTE_REF} from "../App";

/* STACKED BARCHART CONFIG */
const SVG_WIDTH     = 700;
const SVG_HEIGHT    = 200;
const CANVAS_MARGIN = {top: 10, right: 10, bottom: 20, left: 50};
const CANVAS_WIDTH  = SVG_WIDTH - CANVAS_MARGIN.left - CANVAS_MARGIN.right;
const CANVAS_HEIGHT = SVG_HEIGHT - CANVAS_MARGIN.top - CANVAS_MARGIN.bottom;

/* SUB CHARTS CONFIG */
const BARCHART_1_COLOR      = ["blue", "red"];
const BARCHART_2_COLOR      = ["#BC3754", "rgba(236,236,233,0.18)"];
const BARCHART_3_COLOR      = ["red", "blue"];
const STACKED_AREA_OPACITY  = 0.8;
const STACKED_STROKE_WIDTH  = 0.8;
const LINE_STROKE_WIDTH     = 2;
const Y_TICKS_NUM           = 5;
const X_TICKS_NUM           = 10;
const X_AXIS_LABEL_Y_OFFSET = 20;
const Y_AXIS_LABEL_X_OFFSET = 10;
const Y_AXIS_LABEL_Y_OFFSET = 0;

const dateFromYear = (year) => new Date(`${year}-1-1`);

export default function Section5() {
    return (
        <div className="Section5">
            <Subsection1/>
            <Subsection2/>
            <Subsection3/>
        </div>
    );
}

/**
 * Chart description
 * @returns 
 */
function Subsection1() {
    return (<div className="Section5-subsection" id="Section5-subsection1">
        <div className="Section5-subsection-title">
            <h1>Global Growth in Primary Education Enrollment</h1>
            <p>The visualization displays the average estimated enrollment rates for primary education
                <br/>in 111 countries between 1870 and 2010.
                <a href="/" onClick={event => {
                    event.preventDefault();
                    FOOTNOTE_REF.current.scrollIntoView({behavior: 'smooth'});
                }}>[4]</a>
            </p>
            <h3 style={{
                color: "#F2F2EE",
                background: `linear-gradient(to right, ${BARCHART_1_COLOR[0]}, ${BARCHART_1_COLOR[1]})`
            }}> LOW
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                primary education enrollment rate
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                HIGH
            </h3>
        </div>
        <GradientLineChart
            id="Section5-Chart1"
            data={dataset1}
            yRange={[0, 1]}
            yPostfix={"%"}
            colorRange={BARCHART_1_COLOR}
            yFormat={d => `${d * 100}%`}
            yLabel={"average estimated enrollment rates"}
        />
    </div>);
}

/**
 * Chart description
 * @returns 
 */
function Subsection2() {
    return (<div className="Section5-subsection" id="Section5-subsection2">
        <StackedAreaChart
            id="Section5-Chart2"
            data={dataset2}
            yRange={[0, 1]}
            yPostfix={"%"}
            colorRange={BARCHART_2_COLOR}
            yLabel={"proportion of literacy"}
        />
        <div className="Section5-subsection-title">
            <h1>Two Centuries of Progress</h1>
            <h2>The Evolution and Expansion of Global Literacy
                <a href="/" onClick={event => {
                    event.preventDefault();
                    FOOTNOTE_REF.current.scrollIntoView({behavior: 'smooth'});
                }}>[3]</a>
            </h2>
            <p>The provided visualization depicts global literacy estimates from 1800 to 2014, illustrating a steady yet
                modest increase in
                <br/>literacy rates until the early 20th century. The growth rate accelerated substantially after the
                mid-20th century when
                <br/>the expansion of basic education became an international priority.</p>
            <h3 style={{background: BARCHART_2_COLOR[0]}}>Literate</h3>
            <h3 style={{background: BARCHART_2_COLOR[1]}}>Illiterate</h3>
        </div>
    </div>);
}

/**
 * Chart description
 * @returns 
 */
function Subsection3() {
    return (<div className="Section5-subsection" id="Section5-subsection3">
        <div className="Section5-subsection-title">
            <h1>Years of schooling</h1>
            <h2>The average duration of educational attainment: a global increase</h2>
            <p>The average number of years spent in school are another common measure of a population’s education level.
                <br/>The visualization shows trends in years of schooling for 111 countries during the period 1870-2017.
                <a href="/" onClick={event => {
                    event.preventDefault();
                    FOOTNOTE_REF.current.scrollIntoView({behavior: 'smooth'});
                }}>[4,5,6]</a>
            </p>
            <h3 style={{
                color: "#F2F2EE",
                background: `linear-gradient(to right, ${BARCHART_1_COLOR[0]}, ${BARCHART_1_COLOR[1]})`
            }}> LESS
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                years of schooling
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                MORE
            </h3>
        </div>
        <GradientLineChart
            id="Section5-Chart3"
            data={dataset3}
            yRange={[0, 9]}
            yPostfix={""}
            colorRange={BARCHART_3_COLOR}
            yFormat={d => `${d} Years`}
            yLabel={"years of Schooling"}
        />
    </div>);
}

function StackedAreaChart(props) {
    const effect = (svg, stackedData, colorRange, Xs, Ys) => {
        const area = d3
            .area()
            .x(d => Xs(dateFromYear(d.data.Year)))
            .y0(d => Ys(d[0]))
            .y1(d => Ys(d[1]));

        /* Stacked Area for Group 1 */
        svg.append("g")
            .attr("fill-opacity", STACKED_AREA_OPACITY)
            .selectAll("path")
            .data(stackedData)
            .join("path")
            .attr("fill", ({key}) => colorRange(key))
            .attr("d", area)
            .append("title")
            .text(({key}) => key);

        /* Stacked Area for Group 2 */
        svg.append("g")
            .attr("fill", "none")
            .attr("stroke-width", STACKED_STROKE_WIDTH)
            .selectAll("path")
            .data(stackedData)
            .join("path")
            .attr("stroke", ({key}) => d3.lab(colorRange(key)).darker())
            .attr("d", area.lineY1());
    };
    return <Chart id={props.id}
                  data={props.data}
                  effect={effect}
                  yRange={props.yRange}
                  yPostfix={props.yPostfix}
                  colorRange={props.colorRange}
                  yLabel={props.yLabel}/>;
}

function GradientLineChart(props) {
    const effect = (svg, stackedData, colorRange, Xs, Ys, groups) => {
        svg.append("linearGradient")
            .attr("id", "line-gradient")
            .attr("gradientUnits", "userSpaceOnUse")
            .selectAll("stop")
            .data([{offset: "0%", color: props.colorRange[0]},
                {offset: "100%", color: props.colorRange[1]}])
            .enter()
            .append("stop")
            .attr("offset", d => d.offset)
            .attr("stop-color", d => d.color);

        svg.append("path")
            .datum(props.data)
            .attr("fill", "none")
            .attr("stroke", "url(#line-gradient)")
            .attr("stroke-width", LINE_STROKE_WIDTH)
            .attr("d", d3.line()
                .x(d => Xs(dateFromYear(d.Year)))
                .y(d => Ys(d[groups[0]]))
            );
    };
    return (<Chart id={props.id}
                   data={props.data}
                   effect={effect}
                   yRange={props.yRange}
                   yPostfix={props.yPostfix}
                   colorRange={props.colorRange}
                   yFormat={props.yFormat}
                   yLabel={props.yLabel}/>);
}

/**
 * Base Chart
 * @param props
 * @returns {JSX.Element}
 */
function Chart(props) {
    const ref         = React.useRef();
    const groups      = Object.keys(props.data[0]).slice(1);
    const stackedData = d3.stack().keys(groups).offset(d3.stackOffsetExpand)(props.data);
    const colorRange  = d3.scaleOrdinal().domain(groups).range(props.colorRange);
    const timeRange   = d3.extent(props.data, d => d.Year);

    const Xs     = d3
        .scaleUtc()
        .domain([dateFromYear(timeRange[0]), dateFromYear(timeRange[1])])
        .range([CANVAS_MARGIN.left, CANVAS_WIDTH + CANVAS_MARGIN.left - CANVAS_MARGIN.right]);
    const Ys     = d3
        .scaleLinear()
        .domain(props.yRange)
        .range([CANVAS_HEIGHT + CANVAS_MARGIN.top, CANVAS_MARGIN.top]);
    const axis_X = g => g
        .attr("transform", `translate(0,${CANVAS_HEIGHT + CANVAS_MARGIN.top})`)
        .call(d3.axisBottom(Xs).ticks(X_TICKS_NUM))
        .call(g => g.append("text")
            .attr("x", CANVAS_WIDTH + 30)
            .attr("y", X_AXIS_LABEL_Y_OFFSET)
            .attr("fill", "currentColor")
            .attr("text-anchor", "end")
            .text(`Year`));
    const axis_Y = g => g
        .attr("transform", `translate(${CANVAS_MARGIN.left},0)`)
        .call(d3.axisLeft(Ys).ticks(Y_TICKS_NUM, props.yPostfix).tickFormat(props.yFormat))
        .call(g => g.append("text")
            .attr("x", Y_AXIS_LABEL_X_OFFSET)
            .attr("y", CANVAS_MARGIN.top + Y_AXIS_LABEL_Y_OFFSET)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text(`${props.yLabel}`));

    React.useEffect(() => {
        const svg = d3.select(ref.current);
        svg.append("g").call(axis_X);
        svg.append("g").call(axis_Y);
        props.effect(svg, stackedData, colorRange, Xs, Ys, groups);
    });
    return (<div className="Section5-subsection-chart" id={props.id}>
        <svg ref={ref} width={SVG_WIDTH} height={SVG_HEIGHT}/>
    </div>);
}