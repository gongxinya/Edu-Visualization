/**
 * A combination of bar charts and an interactive 3D representation of Earth to visualise the geographic distribution of
 * renowned universities worldwide and facilitate comparison across various metrics introduced in the 2023 QS World
 * University Rankings.
 * Data source: QS World University Rankings 2023: Top Global Universities. (2023). Top Universities.
 * https://www.topuniversities.com/university-rankings/world-university-rankings/2023
 */
import React                                from "react";
import {Canvas, useFrame, useLoader}        from "@react-three/fiber";
import {TextureLoader, DoubleSide, Vector3} from "three";
import {OrbitControls}                      from "@react-three/drei";
import SpecularTexture                      from "../media/8k_earth_specular_map.jpg";
import CloudTexture                         from "../media/8k_clouds.jpg";
import dataset                              from "../data/json/2023-QS-GEO.json";
import * as d3                              from "d3";

// CANVAS CONFIG
const EARTH_RADIUS          = 2;
const EARTH_WIDTH_SEGMENTS  = 50;
const EARTH_HEIGHT_SEGMENTS = 50;
const EARTH_METALNESS       = 0.4;
const EARTH_ROUGHNESS       = 0.7;
const CLOUD_HEIGHT          = 0.02;
const CLOUD_OPACITY         = 0.5;
const CUBE_SIDE_LENGTH      = 0.02;
const CUBE_COLOR_MAX_V      = [255, 120, 120];
const CUBE_OPACITY          = 0.7;
const CENTER_POSITION       = new Vector3(0, 0, 0);

// ROTATION CONFIG
const ROTATION_X_OFFSET    = 0.4;
const ROTATION_Y_OFFSET    = -3;
const EARTH_ROTATION_SPEED = 20;
const CLOUD_ROTATION_SPEED = 25;

// LIGHT CONFIG
const AMBIENT_LIGHT_INTENSITY = 0.2;
const POINT_LIGHT_COLOR       = "white";
const POINT_LIGHT_POSITION    = [EARTH_RADIUS + 1, 0, EARTH_RADIUS + 1];
const POINT_LIGHT_INTENSITY   = 2;

// COLOR BAR
const BAR_HEIGHT     = 100;
const BAR_CIRCLE_R   = 5;
const BAR_RECT_W     = 10;
const BAR_MAX_COLOR  = "rgb(255,120,120)";
const BAR_MIN_COLOR  = "black";
const BAR_CIRCLE_NUM = 15;

// OPTIONS
export const OPTIONS = {
    "Overall Score": Object.values(dataset.Overall),
    "Academic Reputation": Object.values(dataset["Academic Reputation"]),
    "Employer Reputation": Object.values(dataset["Employer Reputation"]),
    "International Research Network": Object.values(dataset["International Research Network"]),
    "Citations per Faculty": Object.values(dataset["Citations per Faculty"])
};

export function Earth({optionState}) {
    const [option] = optionState;
    return (
        <Canvas>
            <EarthComponent cubes={{
                lat: Object.values(dataset.lat),
                lon: Object.values(dataset.lon),
                val: OPTIONS[option]
            }}/>
        </Canvas>
    );
}

/**
 * Legend of the 3D globe.
 * @returns {JSX.Element}
 */
export function ColorBar() {
    const ref   = React.useRef();
    const dots  = Array.from(Array(BAR_CIRCLE_NUM).keys());
    const color = d3.scaleLinear().domain([1, BAR_CIRCLE_NUM]).range([BAR_MIN_COLOR, BAR_MAX_COLOR]);

    React.useEffect(() => {
        const svg = d3.select(ref.current);
        /* dots */
        svg
            .selectAll(".firstrow")
            .data(dots)
            .enter()
            .append("circle")
            .attr("cx", (d, i) => 5 + i * 20)
            .attr("cy", 10)
            .attr("r", BAR_CIRCLE_R)
            .attr("fill", d => color(d));
        /* cubes */
        svg
            .selectAll(".secondrow")
            .data(dots)
            .enter()
            .append("rect")
            .attr("x", (d, i) => i * 20)
            .attr("y", 25)
            .attr("width", BAR_RECT_W)
            .attr("height", (d) => 5 * d + 3)
            .attr("fill", d => color(d));
    });

    return (<svg ref={ref} className="ColorBar" height={BAR_HEIGHT}/>);
}

/**
 * A checkbox where users can select attributes to render.
 * @param optionState Available options.
 * @returns {JSX.Element}
 */
export function InteractiveWidget({optionState}) {
    const [option, setOption] = optionState;
    const onChange            = event => setOption(event.target.value);

    return (
        <div className="Section1-title-interactive">
            <div className="Section1-title-interactive-checkbox">
                {Object.keys(OPTIONS).map((opt) => (
                    <div key={opt}>
                        <label>
                            <input
                                type="checkbox"
                                value={opt}
                                checked={option === opt}
                                onChange={onChange}
                            /> {opt}
                        </label>
                    </div>
                ))}
            </div>
            <h4>2023 QS World University - {option}</h4>
            <div className="Section1-title-colorbar">
                <p>{Math.max(...OPTIONS[option])}</p>
                <ColorBar/>
                <p>{Math.min(...OPTIONS[option])}</p>
            </div>
        </div>
    );
}

/**
 * 3D Globe that based on Three.js and D3.js.
 * @param props
 * @returns {JSX.Element}
 */
function EarthComponent(props) {
    const earthRef                = React.useRef();
    const cloudRef                = React.useRef();
    const cubesRef                = React.useRef();
    const [specularMap, cloudMap] = useLoader(TextureLoader, [SpecularTexture, CloudTexture]);

    useFrame(({clock}) => {
        earthRef.current.rotation.y = clock.getElapsedTime() / EARTH_ROTATION_SPEED + ROTATION_Y_OFFSET;
        cloudRef.current.rotation.y = clock.getElapsedTime() / CLOUD_ROTATION_SPEED + ROTATION_Y_OFFSET;
        cubesRef.current.rotation.y = clock.getElapsedTime() / EARTH_ROTATION_SPEED + ROTATION_Y_OFFSET;
        earthRef.current.rotation.x = ROTATION_X_OFFSET;
        cloudRef.current.rotation.x = ROTATION_X_OFFSET;
        cubesRef.current.rotation.x = ROTATION_X_OFFSET;
    });

    return (<>
            <ambientLight intensity={AMBIENT_LIGHT_INTENSITY}/>
            <React.Suspense fallback={null}>
                <pointLight
                    color={POINT_LIGHT_COLOR}
                    position={POINT_LIGHT_POSITION}
                    intensity={POINT_LIGHT_INTENSITY}
                />
                {/* Cloud Layer */}
                <mesh ref={cloudRef}>
                    <sphereGeometry
                        args={[EARTH_RADIUS + CLOUD_HEIGHT,
                               EARTH_WIDTH_SEGMENTS,
                               EARTH_HEIGHT_SEGMENTS]}
                    />
                    <meshPhongMaterial
                        map={cloudMap}
                        opacity={CLOUD_OPACITY}
                        transparent={true}
                        side={DoubleSide}
                    />
                </mesh>
                {/* Earth Layer */}
                <mesh ref={earthRef}>
                    <sphereGeometry
                        args={[EARTH_RADIUS,
                               EARTH_WIDTH_SEGMENTS,
                               EARTH_HEIGHT_SEGMENTS]}
                    />
                    <meshStandardMaterial
                        map={specularMap}
                        metalness={EARTH_METALNESS}
                        roughness={EARTH_ROUGHNESS}
                    />
                    <OrbitControls
                        enablePan={false}
                        enableZoom={false}
                    />
                </mesh>
                {/* Cubes */}
                <mesh ref={cubesRef}>
                    {cubes(props.cubes.lat, props.cubes.lon, props.cubes.val)}
                </mesh>
            </React.Suspense>
        </>
    );
}

/**
 * Cubes on the 3D globe.
 * @param lat Latitude of the institute's position
 * @param lon Longitude of the institute's position
 * @param val score of the indicator
 * @returns {*[]}
 */
function cubes(lat = [], lon = [], val = []) {
    const min = Math.min(...val);
    const max = Math.max(...val);
    if (min < max) {
        val = val.map(v => (v - min) / (max - min));   // min-max scaling
    }
    const cubes = [];
    for (let i = 0, l = val.length; i < l; i++) {
        cubes.push(<Cube lat={lat[i]}
                         lon={lon[i]}
                         val={val[i]}
                         key={`cube#${i}`}
        />);
    }
    return cubes;
}

/**
 * A cube (bar) that indicating the score of a certain institute.
 * @param props
 * @returns {JSX.Element}
 */
function Cube(props) {
    const ref = React.useRef();
    React.useEffect(() => ref.current.lookAt(CENTER_POSITION));
    return (
        <mesh ref={ref}
              position={latLon2xyz(props.lat, props.lon, props.val)}>
            <boxGeometry
                args={[CUBE_SIDE_LENGTH,
                       CUBE_SIDE_LENGTH,
                       props.val]}
            />
            <meshPhongMaterial
                color={cubeColor(props.val)}
                opacity={CUBE_OPACITY}
                transparent={true}
            />
        </mesh>
    );
}

function cubeColor(val) {
    const [r1, g1, b1] = CUBE_COLOR_MAX_V;
    return `rgb(${Math.round(r1 * val)},${Math.round(g1 * val)},${Math.round(b1 * val)})`;
}

/**
 * Convert latitude and longitude to X-Y-Z coordinates in 3D space.
 * @param lat latitude
 * @param lon longitude
 * @param val value
 * @returns {Vector3} (X, Y, Z)
 */
function latLon2xyz(lat, lon, val) {
    const phi    = (lat) * Math.PI / 180;
    const theta  = (lon - 180) * Math.PI / 180;
    const offset = EARTH_RADIUS + val / 2;

    const x = -offset * Math.cos(phi) * Math.cos(theta);
    const y = offset * Math.sin(phi);
    const z = offset * Math.cos(phi) * Math.sin(theta);

    return new Vector3(x, y, z);
}
