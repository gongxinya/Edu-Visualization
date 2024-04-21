import React                            from "react";
import {FOOTNOTE_REF, SET_FOOTNOTE_REF} from "../App";

/**
 * Reference.
 * @returns {JSX.Element}
 */
export default function Footnote() {
    SET_FOOTNOTE_REF(React.useRef());
    return (
        <div className="Footnote" ref={FOOTNOTE_REF}>
            <h2>Data Source</h2>
            <p>[1] QS World University Rankings 2023: Top Global Universities. (2023). Top Universities. &nbsp;
                <a href="https://www.topuniversities.com/university-rankings/world-university-rankings/2023">
                    https://www.topuniversities.com/university-rankings/world-university-rankings/2023
                </a>
            </p>
            <p>[2] QS World University Rankings by Subject 2022 Excel Result Table. (2022). QS. &nbsp;
                <a href="https://www.qs.com/portfolio-items/qs-world-university-rankings-by-subject-2022">
                    https://www.qs.com/portfolio-items/qs-world-university-rankings-by-subject-2022
                </a>
            </p>
            <p>
                [3] Roser M. and Ortiz-Ospina E. (2016) Global Education. Our World in Data. &nbsp;
                <a href="https://ourworldindata.org/global-education">
                    https://ourworldindata.org/global-education
                </a>
            </p>
            <p>
                [4] Lee, J. W., & Lee, H. (2016). Human capital in the long run. Journal of Development Economics.
            </p>
            <p>
                [5] Barro, Robert and Jong-Wha Lee, April 2010, “A New Data Set of Educational Attainment in the World,
                1950-2010.” Journal of Development Economics, vol 104, pp.184-198.
            </p>
            <p>
                [6] Human Development Reports. (2018). &nbsp;
                <a href="https://hdr.undp.org/">
                    https://hdr.undp.org/
                </a>
            </p>
            <p>
                [7] Earth texture for 3D globe. &nbsp;
                <a href="https://www.solarsystemscope.com/textures/">
                    https://www.solarsystemscope.com/textures/
                </a>
            </p>
            <p>
                [8] Maddison Project Database, version 2020. Bolt, Jutta and Jan Luiten van Zanden (2020), "Maddison
                style estimates of the evolution of the world economy. A new 2020 update".
            </p>
            <p>
                [9] Altinok, N., N. Angrist and H.A. Patrinos. 2018. "Global data set on education quality (1965-2015)."
                World Bank Policy Research Working Paper No. 8314. Washington, DC.
            </p>
        </div>
    );
}