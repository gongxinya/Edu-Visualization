import React    from "react";
import Section0 from "./components/Section0";
import Section1 from "./components/Section1";
import Section3 from "./components/Section3";
import Section4 from "./components/Section4";
import Section5 from "./components/Section5";
import Section6 from "./components/Section6";
import Section7 from "./components/Section7";
import Section8 from "./components/Section8";
import Section9 from "./components/Section9";
import Footnote from "./components/Footnote";
import './css/App.css';
import './css/Section0.css';
import './css/Section1.css';
import './css/Section3.css';
import './css/Section4.css';
import './css/Section5.css';
import './css/Section6.css';
import './css/Section7.css';
import './css/Section8.css';
import './css/Section9.css';
import './css/Footnote.css';

import {
    Question1, Question2,
    Question3, Question4,
    Question5, Question7
} from "./components/Questions";

export let FOOTNOTE_REF;
export const SET_FOOTNOTE_REF = v => FOOTNOTE_REF = v;

export default function App() {
    return (
        <div className="App">
            <Section0/>
            <Question1/> <Section1/>
            <Question2/> <Section3/>
            <Section7/>
            <Question3/> <Section4/>
            <Question4/> <Section5/>
            <Question5/> <Section6/>
            <Section8/>
            <Question7/> <Section9/>
            <Footnote/>
        </div>
    );
}