import React from 'react'
import {render} from 'react-dom'

import {GridWidget} from "../src/GridWidget"
import {testProps} from "./data"

const elem = document.createElement('div');
elem.setAttribute("id", "root");
document.body.append(elem)

const {geometry, devices} = testProps

render(
    <div style={{height: "100vh"}}>
        <GridWidget geometry={geometry} devices={devices}></GridWidget>
    </div>, 
document.getElementById("root"))

