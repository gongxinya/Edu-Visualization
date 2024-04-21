/**
 * A combination of bar charts and an interactive 3D representation of Earth to visualise the geographic distribution of
 * renowned universities worldwide and facilitate comparison across various metrics introduced in the 2023 QS World
 * University Rankings.
 * Data source: QS World University Rankings 2023: Top Global Universities. (2023). Top Universities.
 * https://www.topuniversities.com/university-rankings/world-university-rankings/2023
 */

import React          from "react";
import * as Earth     from "./Earth";
import {FOOTNOTE_REF} from "../App";

export default function Section1() {
    const optState = React.useState(Object.keys(Earth.OPTIONS)[0]);
    return (
        <div className="Section1">
            <div className="Section1-title">
                <h3>when you explore the splendor of these academic institutions
                    <br/> you will surely be filled with awe and wonder at the boundless possibilities of our world
                </h3>
                <h1>
                    <a href="/" onClick={event => {
                        event.preventDefault();
                        FOOTNOTE_REF.current.scrollIntoView({behavior: 'smooth'});
                    }}>[1]</a>
                    SCHOLAR</h1>
                <h1>SPECTRUM</h1>
                <h2>Exploring the Depths of Global University Data</h2>
                <h3>This dynamic 3D globe visualization presents various indicators for universities featured
                    <br/>in the 2023 QS World University Rankings
                </h3>
                <br/>
                <Earth.InteractiveWidget optionState={optState}/>
            </div>
            <div id="Section1-Earth">
                <Earth.Earth optionState={optState}/>
            </div>
        </div>
    );
}