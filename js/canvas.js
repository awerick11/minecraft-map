let canvas = document.getElementById("map-canvas");
let ctx = canvas.getContext("2d");
const image = new Image();
image.src = "img/test1.png";
let mouse_down = false;
let tooltip_up = false;
let do_render = true;
let min_scale = Math.min(ctx.canvas.width/image.naturalWidth, ctx.canvas.height/image.naturalHeight);
let scale = Math.max(1, min_scale);
let offset = [0, 0];
let start_coords;

function initCanvas() {
    resizeCanvas();
    setInterval(renderCanvas, 50);
}

function renderCanvas() {
    if (do_render) {
        do_render = false;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let coords = convertCoords([100, 100], "m_c");
        let size = convertCoords([200, 150], "m_c");
        ctx.drawImage(image, -offset[0]*scale, -offset[1]*scale, image.naturalWidth*scale, image.naturalHeight*scale);
    }
}

function resizeCanvas() {
    // Store old size
    const old_csize = [ctx.canvas.width, ctx.canvas.height];
    
    // Get new size
    const c_size = document.getElementById("c-resize").getBoundingClientRect();
    const new_csize = [Math.max(300, c_size.width),
                        Math.max(Math.min(c_size.height, 1*window.innerHeight), 300)];

    // Update size
    ctx.canvas.width = new_csize[0];
    ctx.canvas.height = new_csize[1];

    // Update offset so that center stays in center
    offset[0] += (old_csize[0] - new_csize[0]) / (2 * scale);
    offset[1] += (old_csize[1] - new_csize[1]) / (2 * scale);
    limitOffset();

    min_scale = Math.min(ctx.canvas.width/image.naturalWidth, ctx.canvas.height/image.naturalHeight);

    do_render = true;
}

function zoomCanvas(event) {
    if (isInCanvas(event.x, event.y)) {
        // Get old properties
        var event_ocoords = convertCoords([event.x, event.y]);
        const old_scale = scale;

        // Change scale
        //scale += -event.deltaY * 0.05;
        scale *= (1 - 0.0005*event.deltaY);
        scale = Math.max(Math.min(scale, 100), min_scale);

        // Update offset so that mouse is at same pos
        offset[0] = event_ocoords[0] - (old_scale / scale) * (event_ocoords[0] - offset[0]);
        offset[1] = event_ocoords[1] - (old_scale / scale) * (event_ocoords[1] - offset[1]);
        limitOffset();
        
        do_render = true;
    }
}

function panCanvas(event) {
    offset[0] -= (event.x - start_coords[0])/scale;
    offset[1] -= (event.y - start_coords[1])/scale;
    limitOffset();

    start_coords = [event.x, event.y];
    do_render = true;
}

function mousedownCanvas(event) {
    if (isInCanvas(event.x, event.y)) {
        mouse_down = true;
        start_coords = [event.x, event.y];
    }
}

function mousemoveCanvas(event) {
    if (mouse_down) { panCanvas(event); }
}

function mouseupCanvas(event) {
    mouse_down = false;
}

function isInCanvas(x, y) {         // Takes document coords
    const c_size = canvas.getBoundingClientRect();
    if (x < c_size.left || x > c_size.right) {
        return false;
    }
    if (y < c_size.top || y > c_size.bottom) {
        return false;
    }
    return true;
}

function convertCoords(coords, mode="d_m") {
    // d - document, c - canvas, m - map    
    const c_size = canvas.getBoundingClientRect();

    if (mode == "d_m") {
        // Convert to canvas coords
        coords[0] -= c_size.left;
        coords[1] -= c_size.top;
        
        // Convert to map coords
        coords[0] = coords[0]/scale + offset[0];
        coords[1] = coords[1]/scale + offset[1];
    } else if (mode == "m_c") {
        coords[0] = scale * (coords[0] - offset[0]);
        coords[1] = scale * (coords[1] - offset[1]);
    } else if (mode == "c_m") {
        // Convert to map coords
        coords[0] = coords[0]/scale + offset[0];
        coords[1] = coords[1]/scale + offset[1];
    }

    return coords;
}

function limitOffset() {
    offset[0] = Math.max(0, Math.min(offset[0], image.naturalWidth - ctx.canvas.width/scale));
    offset[1] = Math.max(0, Math.min(offset[1], image.naturalHeight - ctx.canvas.height/scale));
}

// EVENT LISTENERS
window.addEventListener("resize", resizeCanvas);
document.onwheel = zoomCanvas;
document.onmousedown = mousedownCanvas;
document.onmousemove = mousemoveCanvas;
document.onmouseup = mouseupCanvas;

initCanvas();