import Yinsh from "./yinsh.js";
import Yinsh_Engine from "./computer.js";
const AudioCtor = window.Audio;

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

const DISPLAY_SIZE = 600;
const PIXEL_RATIO = window.devicePixelRatio || 1;

canvas.width = DISPLAY_SIZE * PIXEL_RATIO;
canvas.height = DISPLAY_SIZE * PIXEL_RATIO;

canvas.style.width = `${DISPLAY_SIZE}px`;
canvas.style.height = `${DISPLAY_SIZE}px`;

ctx.scale(PIXEL_RATIO, PIXEL_RATIO);


// hex grid dot spacing
const SIZE = 35;

// hex grid centre
const CX = 300;
const CY = 300;

// converting hex grid co-ordinates to pixel co-ordinates

const hex_to_pixel = function (r, q) {
    const x = CX + SIZE * (3 / 2 * q);
    const y = CY + SIZE * (Math.sqrt(3) * (r + q / 2));

    return {x, y};
};

const pixel_to_hex = Object.freeze(function (x, y) {
    const q = Math.round((x - CX) / (SIZE * 3 / 2));
    const r = Math.round(
        (y - CY) / (SIZE * Math.sqrt(3)) - q / 2
    );

    return {r, q};
});

function draw_board(
    state,
    selected_position = undefined,
    highlight_position = undefined,
    potential_positions = undefined,
    hovered_position = undefined
) {
    ctx.clearRect(0, 0, DISPLAY_SIZE, DISPLAY_SIZE);

    // filling the grid

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
        {r: 0, q: -4},
        {r: -1, q: -4}
    ];

    ctx.beginPath();
    const start_pixel = hex_to_pixel(-1, 4);
    ctx.moveTo(start_pixel.x, start_pixel.y);

    corners.forEach(function (coord) {
        const corner_pixel = hex_to_pixel(coord.r, coord.q);
        ctx.lineTo(corner_pixel.x, corner_pixel.y);
    });

    ctx.closePath();
    ctx.fillStyle = "#D1DAE1";
    ctx.fill();

    // drawing the grid lines

    Yinsh.valid_co_ordinates.forEach(function (coord) {

        // calculate its neighbours (3 as only going in 1 direction)

        const neighbour_directions = [
            {r: coord.r + 1, q: coord.q},
            {r: coord.r, q: coord.q + 1},
            {r: coord.r + 1, q: coord.q - 1}
        ];

        // for each neighbouring direction check if a valid space
        // if so draw a line between dot and neighbour

        neighbour_directions.forEach(function (n) {
            if (Yinsh.valid_co_ordinates.some(function (val_coord) {
                return (
                    val_coord.r === n.r &&
                    val_coord.q === n.q
                );
            })) {

                ctx.beginPath();
                ctx.strokeStyle = "black";
                ctx.lineWidth = 0.3;

                const start = hex_to_pixel(coord.r, coord.q);
                ctx.moveTo(start.x, start.y);

                const end = hex_to_pixel(n.r, n.q);
                ctx.lineTo(end.x, end.y);

                ctx.stroke(); // Render the path
            }
        });
    });

    // drawing the grid dots

    Yinsh.valid_co_ordinates.forEach(function (coord) {
        const {x, y} = hex_to_pixel(coord.r, coord.q);

        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "black";
        ctx.fill();
    });

    // drawing hovered empty spaces

    if (hovered_position !== undefined) {
        const hovered_pixel = hex_to_pixel(
            hovered_position.r,
            hovered_position.q
        );

        ctx.beginPath();
        ctx.arc(
            hovered_pixel.x,
            hovered_pixel.y,
            4,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = "black";
        ctx.fill();
    }

    // drawing rings

    Object.entries(state.board.rings).forEach(function ([key, colour]) {
        const parts = key.split(",");
        const r = Number(parts[0]);
        const q = Number(parts[1]);

        const {x, y} = hex_to_pixel(r, q);

        ctx.beginPath();
        ctx.arc(x, y, SIZE * 0.5, 0, Math.PI * 2);
        ctx.strokeStyle = (
            colour === "white"
            ? "white"
            : "black"
        );
        ctx.lineWidth = 3;
        ctx.stroke();
    });

    // highlighting selected ring

    if (selected_position !== undefined) {
        const selected_pixel = hex_to_pixel(
            selected_position.r,
            selected_position.q
        );

        ctx.beginPath();
        ctx.arc(
            selected_pixel.x,
            selected_pixel.y,
            SIZE * 0.5,
            0,
            Math.PI * 2
        );

        ctx.strokeStyle = (
            state.current_player === "white"
            ? "white"
            : "black"
        );

        ctx.lineWidth = 5;
        ctx.stroke();
    }

    // highlighting hovered ring

    if (
        highlight_position !== undefined &&
        state.phase === "active"
    ) {
        const {x, y} = hex_to_pixel(
            highlight_position.r,
            highlight_position.q
        );

        ctx.beginPath();
        ctx.arc(x, y, SIZE * 0.5, 0, Math.PI * 2);

        ctx.strokeStyle = (
            state.current_player === "white"
            ? "white"
            : "black"
        );

        ctx.lineWidth = 5;
        ctx.stroke();
    }

    // drawing markers

    Object.entries(state.board.markers).forEach(function ([key, colour]) {
        const parts = key.split(",");
        const r = Number(parts[0]);
        const q = Number(parts[1]);


        const marker_x = hex_to_pixel(r, q).x;
        const marker_y = hex_to_pixel(r, q).y;

        ctx.beginPath();

        ctx.arc(
            marker_x,
            marker_y,
            SIZE * 0.3,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = (
            colour === "white"
            ? "white"
            : "black"
        );

        ctx.fill();

        ctx.strokeStyle = "#083156";

        // colour === "white" ? "white" : "black"

        ctx.lineWidth = 2;
        ctx.stroke();
    });

    // drawing potential positions

    if (potential_positions !== undefined) {
        potential_positions.forEach(function (position) {
            const r = position.r;
            const q = position.q;

            const potential_pixel = hex_to_pixel(r, q);

            ctx.beginPath();

            ctx.arc(
                potential_pixel.x,
                potential_pixel.y,
                6,
                0,
                Math.PI * 2
            );

            ctx.fillStyle = "#676767ff";
            ctx.fill();

            // ctx.strokeStyle = "gray";
            // ctx.lineWidth = 3;
            // ctx.stroke();
        });
    }
}
let state = Yinsh.initial_state();

const hover_coordinate = document.getElementById("hover-coordinate");
const restart_button = document.getElementById("restart");
const play_again_button = document.getElementById("play-again");
const winner_popup = document.getElementById("winner-popup");


let selected_position = undefined;
let highlight_position = undefined;
let potential_positions = undefined;
let hovered_position = undefined;
let latest_white_ring_removed = 0;
let latest_black_ring_removed = 0;
let black_is_placing = false; // flag to stop user moving
//  for black while black is "thinking"

const place_sound = new AudioCtor("./assets/capture.wav");
const end_sound = new AudioCtor("./assets/game-end.wav");



// update rings
function update_rings(state) {
    [1, 2, 3].forEach(function (i) {
        document.getElementById(`white-ring-${i}`).classList.toggle(
            "filled",
            i <= state.rings_removed.white
        );
        document.getElementById(`black-ring-${i}`).classList.toggle(
            "filled",
            i <= state.rings_removed.black
        );
    });
}
// shows the winner
function show_winner(winner) {
    const winner_text = String(winner).toUpperCase() + " Wins!";
    document.getElementById("winner-text").textContent = winner_text;
    winner_popup.style.display = "flex";
    end_sound.play();
}

play_again_button.onclick = function () {
    winner_popup.style.display = "none";
    state = Yinsh.initial_state();
    draw_board(state);
    update_rings(state);
};


// hover to get position co-ords and also make rgs highlighted when hovering
canvas.onmousemove = function (event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const position = pixel_to_hex(x, y);

    if (Yinsh.valid_co_ordinates.some(function (coord) {
        return position.r === coord.r && position.q === coord.q;
    })) {
        hovered_position = position;
        hover_coordinate.textContent = (
            `Hex Co-ordinate: r ${position.r}, q ${position.q}`
        );
    }
    if (Object.keys(state.board.rings).some(function (coord) {
        const split_coord = coord.split(",");
        const r = Number(split_coord[0]);
        const q = Number(split_coord[1]);
        const co_ord_is_ring = (
            (r === position.r)
            && (q === position.q)
        );

        const position_key = (
            JSON.stringify(position.r) + "," + JSON.stringify(position.q)
        );

        const is_current_player_ring = (
            state.board.rings[position_key]
            === state.current_player
        );

        return (co_ord_is_ring && is_current_player_ring);
    })) {
        highlight_position = position;
        draw_board(
            state,
            selected_position,
            highlight_position,
            potential_positions
        );
    } else {
        highlight_position = undefined;
        draw_board(
            state,
            selected_position,
            highlight_position,
            potential_positions,
            hovered_position
        );
    }
};




// clicks to move rings/place rings
if (state.current_player === "white") {

    canvas.onclick = function (event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const position = pixel_to_hex(x, y);

        if (black_is_placing) {
            return;
        }

        if (state.phase === "setup") {
            const new_state = Yinsh.place_ring(state, position);
            if (new_state !== undefined) {
                state = new_state;

                const setup_place = new AudioCtor("./assets/capture.wav");
                setup_place.play(); // fixes an audio bug by defining a new
                // audio as it ensures they play even if overlap

                draw_board(
                    state,
                    selected_position,
                    highlight_position,
                    potential_positions
                );
            }

            if (state.current_player === "black") {
                black_is_placing = true;
                setTimeout(function () {
                    state = Yinsh_Engine.distribute_rings(state);
                    draw_board(state, undefined, undefined, undefined);
                    update_rings(state);
                    place_sound.play();
                    black_is_placing = false;
                }, 1000);
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
                    potential_positions = Yinsh.valid_co_ordinates.filter(
                        function (coord) {
                            return Yinsh.valid_move(
                                state,
                                selected_position,
                                coord
                            ) === true;
                        }
                    );
                }
                return;
            }

            // second click — move the ring
            const move_state = Yinsh.move_ring(
                state,
                selected_position,
                position
            );
            if (move_state !== undefined) {
                state = move_state;
                place_sound.play();
                draw_board(
                    state,
                    selected_position,
                    highlight_position,
                    potential_positions
                );
                update_rings(state);

                if (state.rings_removed.white !== latest_white_ring_removed) {
                    document.getElementById(
                        `white-ring-${state.rings_removed.white}`
                    ).classList.add("filled");
                }

                if (state.rings_removed.black !== latest_black_ring_removed) {
                    document.getElementById(
                        `black-ring-${state.rings_removed.black}`
                    ).classList.add("filled");
                }

                selected_position = undefined;
                potential_positions = undefined;
                draw_board(state, undefined, undefined, undefined);

                if (state.winner !== undefined) {
                    show_winner(state.winner);
                    return;
                }

                if (
                    state.current_player === "black"
                    && state.phase === "active"
                ) {
                    setTimeout(function () {
                        state = Yinsh_Engine.make_best_move(state, 1).state;
                        draw_board(state, undefined, undefined, undefined);
                        update_rings(state);
                        if (state.winner !== undefined) {
                            show_winner(state.winner);
                        }
                        const quick_audio = new AudioCtor(
                            "./assets/capture.wav"
                        );
                        quick_audio.play();
                        return;
                    }, 100);
                }

                place_sound.play();
            }

            selected_position = undefined;
            potential_positions = undefined;
        }
    };
}




restart_button.onclick = function () {
    state = Yinsh.initial_state();
    draw_board(state);
    update_rings(state);
};