import { lists, saveLists, loadLists } from "./Modules/lists.js";
import { popup, overlay, buffers, isPopup, togglePopup } from "./Modules/popup.js";
import { c, textToCanvas, resetCanvas, drawStart, draw } from "./Modules/draw.js";
import { weights, setWeights, changeWeights, removeWeights, toggleWBtns } from "./Modules/weights.js";

const VERSION = "1.0.4";

const body = document.getElementById("body");
const QA = document.getElementById("QA");

export const select = {
    textbox: document.getElementById("toolSelect"),
    list: document.getElementById("listSelect"),
    q: document.getElementById("questionSelect"),
    a: document.getElementById("answerSelect")
};

export const btn = {
    addList: document.getElementById("addList"),
    continue: document.getElementById("continue"),
    load: document.getElementById("loadList"),
    next: document.getElementById("next"),
    arrow: document.getElementById("arrow"),
    setList: document.getElementById("setList"),
    info: document.getElementById("info"),
    reset: document.getElementById("reset"),
    settings: document.getElementById("settings"),
    w0: document.getElementById("w0"),
    w1: document.getElementById("w1"),
    w2: document.getElementById("w2"),
    w3: document.getElementById("w3")
};

const textBox = {
    textTool: document.getElementById("textTool"),
    name: document.getElementById("nameOfList"),
    categories: document.getElementById("numCategories"),
    terms: document.getElementById("numTerms"),
    rangeLow: document.getElementById("rangeLow"),
    rangeHigh: document.getElementById("rangeHigh")
};

export const option = {
    range: document.getElementById("rangeOption")
};

const slider = {
    darkmode: document.getElementById("darkmodeSlider")
};

const check = {
    darkmode: document.getElementById("darkmodeCheck")
}

export var currentList = {
    a: null,
    q: null
};

export var currentStr = {
    list: null,
    a: null,
    q: null
};

var maxIndex = 0;
export var listIndex;
export var currentElem = '';

export var isDarkmode = false;
var isMouse = false;

/**
 * Gets the position of the mouse event on the canvas.
 * @param   {Event} e A mouse event
 * @returns {Object}  The position of the mouse evemt
 */
function getMousePosition(e) {
    e.preventDefault();
    return {
        x: (e.clientX - c.offsetLeft) * (c.width / c.offsetWidth),
        y: (e.clientY - c.offsetTop) * (c.height / c.offsetHeight)
    };
}

/**
 * Gets the position of the touch event on the canvas.
 * @param   {Event} e A touch event
 * @returns {Object}  The position of the touch event
 */
function getTouchPosition(e) {
    e.preventDefault();
    return {
        x: (e.targetTouches[0].clientX - c.offsetLeft) * (c.width / c.offsetWidth),
        y: (e.targetTouches[0].clientY - c.offsetTop) * (c.height / c.offsetHeight)
    }
}

/**
 * Gets a random index of the selected list of terms based on their weights.
 * @returns {Number} An index of a list
 */
function getRandomIndex(maxIndex) {
    let pool = 0;
    for (let i = 0; i < maxIndex; i++) {
        pool += weights[currentStr.list][i];
    }
    let chosenIndex = Math.floor(Math.random()*pool);
    for (let wi = 0; wi < weights[currentStr.list].length; wi++) {
        for (let i = 0; i < weights[currentStr.list][wi]; i++) {
            if (chosenIndex == i) return wi;
        }
        chosenIndex -= weights[currentStr.list][wi];
    }
    return 0;
}

/**
 * Adds the properties of a given list as the options for a given select element.
 * @param {HTMLSelectElement} s    A select element
 * @param {Object}            list Either an object of objects or an object of lists
 */
export function setSelector(s, list) {
    s.classList.remove("hide");
    while (s.childElementCount > 1) {
        s.removeChild(s.lastChild);
    }

    for (var obj in list) {
        let option = document.createElement("option");
        let node = document.createTextNode(obj);
        option.value = obj;
        option.appendChild(node);
        s.appendChild(option);
    }
}

/**
 * Runs the relevant sequence of code depending on the value of currentElem.
 */
export function next() {
    if (currentElem == 'q') {
        currentElem = 'a';
        revealAnswer();
        btn.next.setAttribute("disabled", "");
        toggleWBtns();
    } else {
        if (currentElem == '') btn.next.innerHTML = "Reveal Answer";
        else {
            btn.next.removeAttribute("disabled");
            toggleWBtns();
        }
        currentElem = 'q';
        nextQuestion();
    }
}

/**
 * Loads the next random term.
 */
function nextQuestion() {
    listIndex = getRandomIndex(maxIndex);
    QA.innerHTML = currentList.q[listIndex] + ": ?";
    textBox.value = "";
    resetCanvas();
}

/**
 * Reveals the corresponding answer to the current term.
 */
function revealAnswer() {
    QA.innerHTML = currentList.q[listIndex] + ": " + currentList.a[listIndex];
    textToCanvas(currentList.a[listIndex]);
}

/**
 * Sets up the program to start studying after a list has been selected.
 */
function loadList() {
    for (let s in select) {
        currentStr[s] = select[s].value;
    }

    currentList.q = lists[currentStr.list][currentStr.q];
    currentList.a = lists[currentStr.list][currentStr.a];

    let rangeLow = textBox.rangeLow.value;
    let rangeHigh = textBox.rangeHigh.value;
    maxIndex = currentList.q.length;
    if (rangeLow != "" && rangeHigh != "") {
        maxIndex = rangeHigh - rangeLow;
        currentList.q = currentList.q.slice(rangeLow-1, rangeHigh);
        currentList.a = currentList.a.slice(rangeLow-1, rangeHigh);
    }

    btn.next.removeAttribute("disabled");
    btn.next.innerHTML = "Start";

    QA.innerHTML = "New List: " + currentStr.list + " - " + currentStr.q + " to " + currentStr.a;
    togglePopup();
}

/**
 * Toggles darkmode for each relevant element.
 */
function toggleDarkMode() {
    var elems = [body, popup, c];

    for (let b in btn) {
        elems.push(btn[b]);
    }

    for (let s in select) {
        elems.push(select[s]);
    }

    for (let t in textBox) {
        elems.push(textBox[t]);
    }

    elems.forEach(elem => {
        elem.classList.toggle("darkmode");
    });
    if (isDarkmode) isDarkmode = false;
    else isDarkmode = true;
    localStorage.setItem("Darkmode", isDarkmode);
    resetCanvas()
}

/**
 * Checks if the question and answer select elements have an option selected, and if so, shows the load button.
 */
function everythingSelected() {
    if (select.a.value != "" && select.q.value != "") btn.load.classList.remove("hide");
    else btn.load.classList.add("hide");
}

/**
 * Creates an html paragraph element with class "pInput".
 * @param {String} text            The text to add to the paragraph element
 * @returns {HTMLParagraphElement} The paragraph element
 */
function createPara(text) {
    var para = document.createElement("p");
    para.classList.add("pInput");
    para.appendChild(document.createTextNode(text));
    return para;
}

/**
 * Creates an html input element with type "text" and class "textInput".
 * @param {Array} classes      Extra classes to be given to the textbox
 * @returns {HTMLInputElement} The textbox element
 */
function createTextbox(classes = []) {
    var node = document.createElement("input");
    node.setAttribute("type", "text");
    node.classList.add("textInput");
    if (isDarkmode) node.classList.add("darkmode");
    classes.forEach(c => { node.classList.add(c) });
    return node;
}

/**
 * Sets up the popup element with relevant info after user clicks "continue" in the "addList" popup.
 * @param {Number} cats  Number of categories
 * @param {Number} terms Number of terms
 * @param {String} name  The name of the new list
 */
function continueList(cats, terms, name) {
    if (cats < 1 || terms < 1) alert("Please enter valid numbers") 
    else {
        buffers.add.classList.add("hide");
        buffers.addContinue.classList.remove("hide");

        for (let i = 1; i < cats+1; i++) {
            var op = document.createElement("div");
            op.classList.add("option")
            op.classList.add("cat")
            op.appendChild(createPara("Category " + i + ":"));
            op.appendChild(createTextbox());
            buffers.addContinue.appendChild(op);
            
            for (let j = 1; j < terms+1; j++) {
                var op = document.createElement("div");
                op.classList.add("option")
                op.appendChild(createPara("Term " + j + ":"));
                op.appendChild(createTextbox(["medium"]));
                buffers.addContinue.appendChild(op);
            }
        }
        var b = document.createElement("button");
        b.classList.add("btn");
        if (isDarkmode) b.classList.add("darkmode");
        b.appendChild(document.createTextNode("Create List"));
        b.onclick = function(){ addList(name); }
        buffers.addContinue.appendChild(b);
    }
}

/**
 * Adds all the user provided information to a new list.
 * @param {String} name The name of the list
 */
function addList(name) {
    lists[name] = {};
    let currentName = ""
    while (buffers.addContinue.firstChild && !(buffers.addContinue.firstChild.nodeName == "BUTTON")) {
        let child = buffers.addContinue.firstChild;
        if (child.classList.contains("cat")) {
            lists[name][child.lastChild.value] = [];
            currentName = child.lastChild.value;
        } else lists[name][currentName].push(child.lastChild.value);
        buffers.addContinue.removeChild(child);
    }
    saveLists();
    removeWeights();
    setWeights();
    togglePopup();
}

/**
 * Changes the center tool when user changes it in settings.
 * @param {String} value The value of the tool selector
 */
function changeTool(value) {
    if (value == "Canvas") {
        c.classList.remove("hide");
        textBox.textTool.classList.add("hide");
    } else if (value == "Textbox") {
        c.classList.add("hide");
        textBox.textTool.classList.remove("hide");
    }
}

/**
 * Changes the current version of the clients program if they do not have the most current release.
 * @param {String} v The version to change to
 */
function changeVersion(v) {
    if (localStorage.getItem("Version") != VERSION) {
        let response;
        if (localStorage.getItem("Version") == null) {
            response = confirm("Welcome to StudySpot! Please click OK to setup the website.");
        } else {
            response = confirm("You do not seem to have the most updated version. We recommend that you update by selecting OK.\n(Your current lists and weights will be reset)");
        }
        if (response) {
            if (localStorage.getItem("Version") != null) {
                let curVersion = VERSION.split();
                let userVersion = localStorage.getItem("Version").split();
                if (parseInt(userVersion[2]) < parseInt(curVersion[2])) {
                    localStorage.removeItem("Lists");
                    localStorage.removeItem("Weights");
                }
            }
            localStorage.setItem("Version", VERSION);
        }
    }
}

function loadSettings() {
    if (localStorage.getItem("Darkmode")) {
        toggleDarkMode();
        check.darkmode.checked = true;
    }
}

changeVersion(VERSION);
resetCanvas();
setWeights();
loadLists();
loadSettings();

document.addEventListener("keydown", e => {
    switch (e.key) {
        case "Escape":
            if (isPopup) togglePopup();
            break;
        case "Enter":
            if (currentList.a != null) next();
            break;
    }
});

overlay.addEventListener("click", e => {
    togglePopup();
});

document.addEventListener("touchstart", e => {
    let pos = getTouchPosition(e);
    drawStart(pos);
});

c.addEventListener("touchmove", e => {
    let pos = getTouchPosition(e);
    draw(pos);
}, { passive: false });

c.addEventListener("mousedown", e => {
    let pos = getMousePosition(e);
    drawStart(pos);
    isMouse = true;
});

c.addEventListener("mousemove", e => {
    if (isMouse) {
        let pos = getMousePosition(e);
        draw(pos);
    }
});

document.addEventListener("mouseup", e => {
    isMouse = false
});

select.textbox.onchange = function(){ changeTool(select.textbox.value); }
select.list.addEventListener("change", e => {
    btn.info.classList.remove("hide");
    setSelector(select.q, lists[select.list.value]);
    setSelector(select.a, lists[select.list.value]);
    option.range.classList.remove("hide");
    btn.load.classList.add("hide");
});

select.q.onchange = function(){ everythingSelected(); }
select.a.onchange = function(){ everythingSelected(); }

btn.addList.onclick = function() { togglePopup({add:true}); }
btn.continue.onclick = function() { continueList(parseInt(textBox.categories.value) || 0, parseInt(textBox.terms.value) || 0, textBox.name.value); }
btn.load.onclick = function(){ loadList(); }
btn.next.onclick = function(){ next(); }
btn.arrow.onclick = function(){ togglePopup({set:true}, true, true); }
btn.setList.onclick = function(){ togglePopup({set:true}); }
btn.info.onclick = function(){ togglePopup({info:true}, true, false, currentStr.list); }
btn.reset.onclick = function(){ resetCanvas(); }
btn.settings.onclick = function() { togglePopup({settings:true}); }
btn.w0.onclick = function(){ changeWeights(0.5); }
btn.w1.onclick = function(){ changeWeights(1); }
btn.w2.onclick = function(){ changeWeights(2); }
btn.w3.onclick = function(){ changeWeights(4); }

slider.darkmode.onchange = function(){ toggleDarkMode(); }