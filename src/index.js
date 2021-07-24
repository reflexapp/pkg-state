import {
    getNode,
    GenericPackage,
    customElementDefine,
    StateNode,
    UIStateBridgeIO
} from "@reflexiv/reflexiv"
import pkg from '../package.json';
import {
    v4 as uuidv4
} from "uuid"

const version = pkg.version
var n = pkg.name.split("/")
const name = n[n.length - 1]

// TODO 
const renderTable = (el, d) => {
    el.innerHTML = ""
    Object.keys(d).forEach((k) => {
        var tr = document.createElement("tr")
        var tdk = document.createElement("td")
        var tdv = document.createElement("td")
        tdk.innerText = k
        if (typeof d[k] == "string") {
            tdv.innerText = d[k]
        } else {
            tdv.innerText = JSON.stringify(d[k])
        }
        tr.appendChild(tdk)
        tr.appendChild(tdv)
        el.appendChild(tr)
    })
}
const renderState = (el, node) => {
    if ("data" in node) {
        renderTable(el, node.data)
    } else {
        renderTable(el, {})
    }

}
const initState = (s) => {
    const keys = ["text","click","hover"]
    keys.forEach((k) => {
        s.define(k, (newValue, oldValue) => {})
    })
    s.state.text = ""
    s.state.click = false
    s.state.hover = false
}

const render = (core, proc) => (container, state) => {
    container.setState(state)
    var idiv = getNode(container)
    idiv.innerHTML = ""
    var div = document.createElement("div")
    var tab = document.createElement("table")
    div.style.padding = "10px"
    idiv.appendChild(div)
    var _proc = proc || {}
    _proc.args = state 
    var s = new StateNode()
    var ui = new UIStateBridgeIO(core.bridge, s, state, (io) => {
        renderState(tab, s)
    })
    div.appendChild(ui)
    var hr = document.createElement("hr")
    div.appendChild(hr)

    var content = document.createElement("div")
    var keyInput = document.createElement("input")
    var valueInput = document.createElement("input")
    var submit = document.createElement("input")
    submit.setAttribute("type", "button")
    submit.setAttribute("value", "submit")
    var del = document.createElement("input")
    del.setAttribute("type", "button")
    del.setAttribute("value", "delete")

    content.appendChild(keyInput)
    content.appendChild(valueInput)
    content.appendChild(submit)
    content.appendChild(del)

    var kv = document.createElement("div")
    content.appendChild(kv)
    kv.appendChild(tab)
    div.appendChild(content)

    submit.onclick = (e) => {
        var k = keyInput.value
        var v = valueInput.value
        if (!(k in s.state)) {
            s.define(k, (newValue, oldValue) => {
                //renderState(tab, s)
            })
        }
        s.state[k] = v
        //renderState(tab,s)
        //TODO add render state
    }
    del.onclick = (e) => {
        var k = keyInput.value
        s.delete(k)
        //renderState(tab, s)
    }
    // set new attr
    s.onMessage = (d) => {
        /* compatible with demo bridge */
        if ("text" in d) {
            if (!("text" in s.state)) initState(s)
            s.state.text = d.text
        }
        /* compatible with dispatch */
        if ("code" in d) {
            if (d.code == "hover") {
                if (!("hover" in s)) initState(s)
                s.state.hover = true
            }
            if (d.code == "click") {
                if (!("click" in s)) initState(s)
                s.state.click = true
            }
            if (d.code == "clear") {
                s.hover = false
                s.state.click = false
            }
        }
        // ... set render state to s.on("change")
        //renderState(tab, s)
    }
    s.on("change", (e) => {
        console.log("on change")
        renderState(tab, s)
    })
    var close = (d) => {
        if (state.io && state.io !== "") {
            core.bridge.unlink(s, state.io)
            core.bridge.unlink(state.io, s)
        }
        if (s && "close" in s) {
            s.close()
            renderTable(tab, {})
        }
        s = null
    }
    container.on("resize", (d) => {})
    return close
}
const demo = new GenericPackage(name, version, render, {
    io: "",
    states: {}
}, ["service-bridge"])

export default demo
