import Yinsh from "./yinsh.js";
import { draw_board, pixel_to_hex } from "./display.js";

let state = Yinsh.initial_state();

const canvas = document.getElementById("board");
const hover_coordinate = document.getElementById("hover-coordinate");
const restart_button = document.getElementById("restart");
const play_again_button = document.getElementById("play-again")
const winner_popup = document.getElementById("winner-popup")


let selected_position = undefined;
let highlight_position = undefined;
let potential_positions = undefined;
let hovered_position = undefined;
let latest_white_ring_removed = 0;
let latest_black_ring_removed = 0;

const place_sound = new Audio("./assets/capture.wav");
const end_sound = new Audio("./assets/game-end.wav");


// update rings
function update_rings(state) {
    [1, 2, 3].forEach(function(i) {
        document.getElementById(`white-ring-${i}`).classList.toggle("filled", i <= state.rings_removed.white);
        document.getElementById(`black-ring-${i}`).classList.toggle("filled", i <= state.rings_removed.black);
    });
}
// shows the winner
function show_winner(winner) {
    document.getElementById("winner-text").textContent = `${winner} wins!`;
    winner_popup.style.display = "flex";
    end_sound.play();
}

play_again_button.onclick = function() {
    winner_popup.style.display = "none";
    state = Yinsh.initial_state();
    draw_board(state);
    update_rings(state)
}


      
// hover to get position co-ords and also make rgs highlighted when hovering
canvas.onmousemove = function(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const position = pixel_to_hex(x, y);

    if (Yinsh.valid_co_ordinates.some(function(coord){
        return position.r === coord.r && position.q ===coord.q
    })) {    hovered_position = position
        hover_coordinate.textContent =
    `Hex Co-ordinate: r ${position.r}, q ${position.q}`

}
    if (Object.keys(state.board.rings).some(function(coord){
        const split_coord = coord.split(",");
        const r = Number(split_coord[0]);
        const q = Number(split_coord[1]);
        const co_ord_is_ring = (r === position.r)
        && (q === position.q);

        const position_key = JSON.stringify(position.r) + "," +
         JSON.stringify(position.q);

        const is_current_player_ring = state.board.rings[position_key] ===
        state.current_player;

        return (co_ord_is_ring && is_current_player_ring);
    })) {
        highlight_position = position;
        draw_board(state, selected_position, highlight_position, potential_positions)    }

    else{
        highlight_position = undefined;
        draw_board(state, selected_position, highlight_position, potential_positions, hovered_position);
};

}




// clicks to move rings/place rings
if (state.current_player === "white"){
canvas.onclick = function(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const position = pixel_to_hex(x, y);


    if (state.phase === "setup") {
        const new_state = Yinsh.place_ring(state, position);
        if (new_state !== undefined) {
            state = new_state;
            place_sound.play();
       
            draw_board(state, selected_position, highlight_position, potential_positions);
        }
        return;
    }

    if (state.phase === "active") {
        // first click — select a ring
        if (selected_position === undefined) {
            const key = Yinsh.position_to_key(position);
            if (state.board.rings[key] === state.current_player) {
                selected_position = position;
                // highlight selected ring
                potential_positions = Yinsh.valid_co_ordinates.filter(function(coord){
                    return Yinsh.valid_move(state, selected_position, coord)===true;});

                
            }
            return;
        }

        // second click — move the ring
        const new_state = Yinsh.move_ring(state, selected_position, position);
        if (new_state !== undefined) {
            state = new_state;
            place_sound.play();
            draw_board(state, selected_position, highlight_position, potential_positions);
            update_rings(state)



            if (state.rings_removed.white !== latest_white_ring_removed){
                document.getElementById(`white-ring-${state.rings_removed.white}`).classList.add("filled");
            }


            if (state.rings_removed.black !== latest_black_ring_removed){
                document.getElementById(`black-ring-${state.rings_removed.black}`).classList.add("filled");
            }

     
            selected_position = undefined;
            potential_positions = undefined;
            draw_board(state, undefined, undefined, undefined);

            if (state.winner !== undefined) {
                show_winner(state.winner);
                    return};


        
           
        }
    
        selected_position = undefined;
        potential_positions = undefined;
       

    }
};
}



restart_button.onclick = function(event) {
    state = Yinsh.initial_state()
draw_board(state)
 update_rings(state)
}



