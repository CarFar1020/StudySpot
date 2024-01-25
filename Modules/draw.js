import { isDarkmode, currentElem, currentList, listIndex } from "../main.js";

export const c = document.getElementById("canvas");
const ctx = c.getContext('2d');

const dash = {
    r: 5,
    l: 50
};

/**
 * Clears any user drawn content from the canvas.
 */
export function resetCanvas() {
    ctx.clearRect(0, 0, c.width, c.height);
    
    for (let x = 0; x < c.width; x += 75) {
        horizontalDash(x, c.height/2);
    }

    for (let y = 0; y < c.height; y += 75) {
        verticalDash(c.width/2, y);
    }

    if (currentElem == "a") textToCanvas(currentList.a[listIndex])
}

/**
 * Adds the answer to the background of the canvas.
 * @param {String} text The answer to the current question 
 */
export function textToCanvas(text) {
    if (text.length == 1) {
        ctx.beginPath();
        ctx.globalCompositeOperation = 'destination-over';
        ctx.textAlign = "center";
        ctx.font = "50vmin Arial";
        ctx.strokeSytle = "#EEEEEE";
        ctx.fillText(text, c.width/2, c.height*5/6);
    }
}

export function drawStart(pos) {
    ctx.beginPath();
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    if (!isDarkmode) ctx.strokeStyle = "black";
    else ctx.strokeStyle = "white";
    ctx.moveTo(pos.x, pos.y);
}

export function draw(pos) {
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
}

/**
 * Draws a horizontal dash onto the canvas at position (x, y).
 * @param {Number} x The x position of the dash on the canvas
 * @param {Number} y The y position of the dash on the canvas
 */
function horizontalDash(x, y) {
    ctx.beginPath();
    ctx.globalCompositeOperation = 'destination-over';
    if (!isDarkmode) ctx.fillStyle = "lightgrey";
    else ctx.fillStyle = "#444";
    ctx.arc(x, y, dash.r, 0, Math.PI*2);
    ctx.fillRect(x, y-dash.r, dash.l, dash.r*2);
    ctx.arc(x+dash.l, y, dash.r, 0, Math.PI*2);
    ctx.fill();
}

/**
 * Draws a vertical dash onto the canvas at position (x, y).
 * @param {Number} x The x position of the dash on the canvas
 * @param {Number} y The y position of the dash on the canvas
 */
function verticalDash(x, y) {
    ctx.beginPath();
    ctx.globalCompositeOperation = 'destination-over';
    if (!isDarkmode) ctx.fillStyle = "lightgrey";
    else ctx.fillStyle = "#444";
    ctx.arc(x, y, dash.r, 0, Math.PI*2);
    ctx.fillRect(x-dash.r, y, dash.r*2, dash.l);
    ctx.arc(x, y+dash.l, dash.r, 0, Math.PI*2);
    ctx.fill();
}
