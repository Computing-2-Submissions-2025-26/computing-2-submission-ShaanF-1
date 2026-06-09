import Yinsh from "./yinsh.js";

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");


// CHAT GPTS FIX FOR THE BLUR - FIGURE OUT WHAT THIS DOES?
const DISPLAY_SIZE = 600;
const PIXEL_RATIO = window.devicePixelRatio || 1;

canvas.width = DISPLAY_SIZE * PIXEL_RATIO;
canvas.height = DISPLAY_SIZE * PIXEL_RATIO;``

canvas.style.width = `${DISPLAY_SIZE}px`;
canvas.style.height = `${DISPLAY_SIZE}px`;

ctx.scale(PIXEL_RATIO, PIXEL_RATIO);


 // hex grid dot spacing
const SIZE = 35;

// hex grid centre
const CX = 300;
const CY = 300;

// converting hex grid co-ordinates to pixel co-ordinates


const hex_to_pixel = function(r, q) {
    const x = CX + SIZE * (3 / 2 * q);
    const y = CY + SIZE * (Math.sqrt(3) * (r + q / 2));

    return {x, y};
};

export const pixel_to_hex = function(x, y) {
    const q = Math.round((x - CX) / (SIZE * 3 / 2));
    const r = Math.round((y - CY) / (SIZE * Math.sqrt(3)) - q / 2);

    return {r, q};
};


export const draw_board = function(state,
    selected_position= undefined,
    highlight_position=undefined,
    potential_positions = undefined,
    hovered_position=undefined) {
    ctx.clearRect(0, 0, DISPLAY_SIZE, DISPLAY_SIZE);    // filling the grid

    const corners = [
    {r: -1, q: -4},
    {r: -4, q: -1},
    {r: -4, q: 0},
    {r: -5, q: 1},
    {r: -5, q: 4},
    {r: -4, q: 4},
    {r: -4, q: 5},
    {r: -1, q: 5},
    {r: 0, q: 4},
    {r: 1, q: 4},
    {r: 4, q: 1},
    {r: 4, q: 0},
    {r: 5, q: -1},
    {r: 5, q: -4},
    {r: 4, q: -4},
    {r: 4, q: -5},
    {r: 1, q: -5},
    {r:0, q:-4},
    {r: -1, q: -4},
];
    ctx.beginPath();
    const start_pixel = hex_to_pixel(-1,4)
    ctx.moveTo(start_pixel.x, start_pixel.y);

    corners.forEach(function(coord){
        const corner_pixel = hex_to_pixel(coord.r,coord.q);
        ctx.lineTo(corner_pixel.x, corner_pixel.y)});
    ctx.closePath();
    ctx.fillStyle ="#D1DAE1";
    ctx.fill();


    // drawing the grid lines

    Yinsh.valid_co_ordinates.forEach(function(coord) {
        // calculate its neighbours (3 as only going in 1 direction)
        const neighbour_directions =[{r:coord.r +1, q:coord.q},
            {r:coord.r, q:coord.q +1},
            {r:coord.r +1, q:coord.q -1}];
        // for each neighbouring direction check if a valid space 
        // if so draw a line between dot and neighbour
        neighbour_directions.forEach(function(n){
            if (Yinsh.valid_co_ordinates.some(function(val_coord){
                return val_coord.r === n.r && val_coord.q === n.q;})){
                    ctx.beginPath();
                    ctx.strokeStyle = "black";
                    ctx.lineWidth = 0.3;

                    const start = hex_to_pixel(coord.r, coord.q);
                    ctx.moveTo(start.x,start.y);

                    const end = hex_to_pixel(n.r, n.q);
                    ctx.lineTo(end.x,end.y);

                    ctx.stroke(); // Render the path
        }

    }
);
});


    // drawing the grid dots
    Yinsh.valid_co_ordinates.forEach(function(coord) {
        const {x, y} = hex_to_pixel(coord.r, coord.q);
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "black";
        ctx.fill();
    });


    

        // drawing hovered empty spaces
     if (hovered_position !== undefined){
        const hovered_pixel = hex_to_pixel(hovered_position.r, hovered_position.q);
        ctx.beginPath();
        ctx.arc(hovered_pixel.x, hovered_pixel.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "black";
        ctx.fill();}

    // drawing rings
    Object.entries(state.board.rings).forEach(function([key, colour]) {
        const parts = key.split(",");
        const r = Number(parts[0]);
        const q = Number(parts[1]);
        const {x, y} = hex_to_pixel(r, q);
        ctx.beginPath();
        ctx.arc(x, y, SIZE * 0.5, 0, Math.PI * 2);
        ctx.strokeStyle = colour === "white" ? "white" : "black";
        ctx.lineWidth = 3;
        ctx.stroke();
    });


    // highlighting selected ring
      if (selected_position !== undefined){
        const selected_pixel = hex_to_pixel(selected_position.r, selected_position.q);
        ctx.beginPath();
        ctx.arc(selected_pixel.x, selected_pixel.y, SIZE * 0.5, 0, Math.PI * 2);
        ctx.strokeStyle = state.current_player === "white"? "white" : "black";
        ctx.lineWidth = 5;
        ctx.stroke();}


    // highlighting hovered ring
    if (highlight_position !== undefined && state.phase === "active"){
        const {x, y} = hex_to_pixel(highlight_position.r, highlight_position.q);
        ctx.beginPath();
        ctx.arc(x, y, SIZE * 0.5, 0, Math.PI * 2);
        ctx.strokeStyle = state.current_player === "white"? "white" : "black";
        ctx.lineWidth = 5;
        ctx.stroke();}



    // drawing markers
    Object.entries(state.board.markers).forEach(function([key, colour]) {
        const parts = key.split(",");
        const r = Number(parts[0]);
        const q = Number(parts[1]);
        const {x, y} = hex_to_pixel(r, q);
        ctx.beginPath();
        ctx.arc(x, y, SIZE * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = colour === "white" ? "white" : "black";
        ctx.fill();
        ctx.strokeStyle = "#083156" ;
        // colour === "white" ? "white" : "black"
        ctx.lineWidth = 2;
        ctx.stroke();
    });


    // drawing potential positions
    if (potential_positions !== undefined){
    potential_positions.forEach(function(position) {
        const r = position.r;
        const q = position.q;
        const potential_pixel = hex_to_pixel(r, q);
        ctx.beginPath();
        ctx.arc(potential_pixel.x, potential_pixel.y, 6, 0, Math.PI * 2);
         ctx.fillStyle ="#676767ff";
        ctx.fill();
        // ctx.strokeStyle = "gray";
        // ctx.lineWidth = 3;
        // ctx.stroke();
    });
}


};



