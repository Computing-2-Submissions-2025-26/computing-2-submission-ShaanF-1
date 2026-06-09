import R from "./ramda.js";

/**
 * Yinsh.js is a module to model and play "Yinsh".
 * @namespace Yinsh
 * @author Shaan Fisher
 * @version 2026/1
 */
const Yinsh = Object.create(null);



// // EXAMPLE DEFINITIONS:
// /**
//  * A Board is an rectangular grid that tokens can be placed into one at a time.
//  * Tokens fill up empty positions from the bottom of a column upwards.
//  * It is implemented as an array of columns (rather than rows) of tokens
//  * (or empty positons)
//  * @memberof Connect4
//  * @typedef {Connect4.Token_or_empty[][]} Board
//  */

// /**
//  * A token is a coloured disk that players place in the grid.
//  * @memberof Connect4
//  * @typedef {(1 | 2)} Token
//  */

// /**
//  * Either a token or an empty position.
//  * @memberof Connect4
//  * @typedef {(Connect4.Token | 0)} Token_or_empty
//  */

// /**
//  * A set of template token strings for {@link Connect4.to_string_with_tokens}.
//  * @memberof Connect4
//  * @enum {string[]}
//  * @property {string[]} default ["0", "1", "2"] Displays tokens by their index.
//  * @property {string[]} disks ["⚫", "🔴", "🟡"]
//  * Displays tokens as coloured disks.
//  * @property {string[]} zombies ["🟫", "🚧", "🧟"]
//  * Displays tokens as zombies and barricades.
//  */


// Connect4.token_strings = Object.freeze({
//     "default": ["0", "1", "2"],
//     "disks": ["⚫", "🔴", "🟡"],
//     "zombies": ["🟫", "🚧", "🧟"]
// });


// ========================
//    Board Generation
// ========================

// its a special hex board missing all corners
// Cube co-ordinates: p = |, q = /, r = \
// Cube co-ordinataes always follow p+q+r = 0
// hence only need to use 2 co-ordinates to define grid

const Board_radius = 5;


const co_ordinate_exceptions = [
{r: 0, q: Board_radius},  // top left corner
{r: -Board_radius, q: Board_radius}, // top centre corner
{r: -Board_radius, q: 0}, // top right corner

{r: Board_radius, q: 0}, // bottom left corner
{r: Board_radius, q: -Board_radius}, // bottom centre corner
{r: 0, q: -Board_radius}, // bottom right corner
]

const find_valid_co_ordinates = function () {
const valid_co_ordinates = []

// generating valid co-ordinates
for(let r = -Board_radius; r <=Board_radius; r +=1) {
    for(let q= -Board_radius; q <= Board_radius; q +=1){
        const p=-r-q;

        if (Math.abs(p) <= 5){
        valid_co_ordinates.push({
            r:r,
            q:q})
            }
        }
    }
// excluding exceptions
    const is_co_ordinate_exception = function (value) {
    return co_ordinate_exceptions.some(function (exception) {
        return (
            exception.r === value.r &&
            exception.q === value.q
            );
        });
    };
        return valid_co_ordinates.filter(function(value){
        return !is_co_ordinate_exception(value);
    })

}
Yinsh.valid_co_ordinates = find_valid_co_ordinates();

console.log(Yinsh.valid_co_ordinates);



// ========================
// Private Helper Functions
// ========================

const is_straight_line = function (){}
const flip_markers_on_path = function (){}
const path_contains_ring = function (){}

const vertical_line = function () {}
const left_diagonal_line = function () {}
const right_diagonal_line = function () {}

Yinsh.keys_to_positions= function(keys) {
                return keys.map(function(key) {
                const parts = key.split(",");
                return { r: Number(parts[0]), q: Number(parts[1]) };
            })};

const co_ords_in_between = function(array, position_1, position_2) {

        const position_1_p = -position_1.r - position_1.q;
        const position_2_p = -position_2.r - position_2.q;
        console.log(position_1_p,position_2_p)

        const varying_axis =
          position_1.r ===position_2.r ? "q"
        : position_1.q === position_2.q ? "r"
        : position_1_p === position_2_p ? "qr"
        : undefined;

        console.log(varying_axis)


        const constant_axis =
         varying_axis === "r" ? "q"
        : varying_axis === "q" ? "r"
        : undefined;

        console.log(constant_axis)


        let min = undefined
        let max = undefined
        // check if p1 or p2 varying axis is larger
        if (varying_axis === "qr"){
             min = Math.min(position_1.q, position_2.q);
             max = Math.max(position_1.q, position_2.q);
        }

        else{
         min = Math.min(position_1[varying_axis], position_2[varying_axis])
         max = Math.max(position_1[varying_axis], position_2[varying_axis])
        }

        console.log(max,min)


        const markers_in_between = array.filter(function(co_ordinate) {

            if (varying_axis === "qr"){
                const co_ordinate_p = -co_ordinate.r - co_ordinate.q
                return ((co_ordinate_p === position_1_p && co_ordinate.q > min && co_ordinate.q <max))}
            else{

            return ((co_ordinate[constant_axis]
                === position_1[constant_axis])
                 && (co_ordinate[varying_axis]>min) &&
             (co_ordinate[varying_axis] <max)
            )}})


        return markers_in_between
    }


Yinsh.position_to_key = (position) => position.r + "," + position.q;
(Yinsh.is_valid_co_ordinate =
        (position) => Yinsh.valid_co_ordinates.some(function(co_ordinate) {
        return (
            co_ordinate.r === position.r &&
            co_ordinate.q === position.q
            );
        }));


const next_player = function (player) {
    if (player === "white") {
        return "black";
    }
    else {
        return "white";
    }
};




// ========================
//       Public API
// ========================#

/**
 * Create a new game state.
 * @memberof Yinsh
 * @function
 * @returns {Yinsh.GameState} A fresh initial game state
 */

Yinsh.initial_state = function () {
    return {
        phase: "setup", // setup or active play
        current_player: "white", // white or black
        valid_coordinates: Yinsh.valid_co_ordinates,
        board: {
            rings: {},
            markers: {}
        },
        rings_to_place: {
            white: 5, // 0 TO 5
            black:5
        },
        rings_removed: {
            white: 0, // 0 TO 3
            black: 0
        },
        winner: undefined // undefined, white or black
    };

};



/**
 * Place rings in the setup phase
 * @memberof Yinsh
 * @function 
 * @param {object}, game_state
 * @param {object}, the co-ordinate that the player wants to place the ring
 * @returns {object}, the new game state with the placed ring
 */

Yinsh.place_ring = function (game_state, position) {
    const key = Yinsh.position_to_key(position)


    // is it a valid position - occupied or off board
    if (!Yinsh.is_valid_co_ordinate(position)) {
        return undefined
    }

    if (game_state.board.rings[key] !== undefined) {
        return undefined
    }

    // is it the setup phase
    if (game_state.phase !== "setup") {
        return undefined
    }

    // otherwise update game state accordingly
    const player = game_state.current_player

    const new_rings_to_place = {
        white: player === "white"
        ? game_state.rings_to_place.white -1
        : game_state.rings_to_place.white,
        black: player === "black"
        ? game_state.rings_to_place.black -1
        : game_state.rings_to_place.black,
        }

    const total_rings_left = (
        new_rings_to_place.white + new_rings_to_place.black)

    return {
        phase: total_rings_left === 0
            ? "active"
            : "setup",
        current_player: next_player(player),
        valid_coordinates: Yinsh.valid_co_ordinates,
        board: {
            rings: {
                ...game_state.board.rings,
                [key]: player
            },
            markers: {}
        },
        rings_to_place: new_rings_to_place,
        rings_removed: {
            white: 0,
            black: 0
        },
        winner: undefined
    };
};



Yinsh.valid_move=function(game_state, original_position, new_position) {

    // is it a valid board co-ordinate?
    if (!Yinsh.valid_co_ordinates.some(function(valid_coord){
        return (valid_coord.r === new_position.r & valid_coord.q === new_position.q) 
    })){
        return undefined
    }

    // is it active phase?
    if (game_state.phase !== "active") {
        return undefined
    }

    // is the ring trying to be moved the current players?
    const original_key= Yinsh.position_to_key(original_position)
    if (game_state.board.rings[original_key] !== game_state.current_player) {
        return undefined
    }

    // is straight line? - if P, Q or R are constant
    const r_original = original_position.r
    const q_original = original_position.q
    const p_original = (-r_original-q_original)

    const r_new = new_position.r
    const q_new = new_position.q
     const p_new = (-r_new-q_new)

    if (!((r_new === r_original)
         || (q_new === q_original)
         || (p_new === p_original))) {
    return undefined
    }

    // is not same position?
    if (R.equals(original_position, new_position)) {
    return undefined
    }

    // is space occupied? by ring OR marker
    const new_key = Yinsh.position_to_key(new_position)
    if (game_state.board.rings[new_key] !== undefined
        || game_state.board.markers[new_key] !== undefined) {
            return undefined
        }

    // are there any rings in path?
    if (co_ords_in_between(Yinsh.keys_to_positions(Object.keys(game_state.board.rings)),
     original_position, new_position).length !== 0) {
        return undefined
    }



    // if there are markers in the path,
    // has the ring also travelled over any empty spaces?


    const placed_markers_in_between = co_ords_in_between(
        Yinsh.keys_to_positions(Object.keys(game_state.board.markers)), original_position, new_position)



    const valid_co_ordinates_in_between = co_ords_in_between(
        Yinsh.valid_co_ordinates, original_position, new_position)


    if (placed_markers_in_between.length !== 0) {
        if (placed_markers_in_between.length  !==
            valid_co_ordinates_in_between.length) {
                return undefined
        }
    }

    return true

}


/**
 * Place a marker in a ring and move that ring in a straight line
 * @memberof Yinsh
 * @function
 * @param {object}, game state
 * @param {object}, co-ordinate of the ring player wants to move
 * @param {object}, co-ordinate of the position they want to move the ring to
 * @returns the new game state with the moved ring
 */

Yinsh.move_ring = function (game_state, original_position, new_position) {

    const original_key = Yinsh.position_to_key(original_position);
    const new_key = Yinsh.position_to_key(new_position);
    const placed_markers_in_between = co_ords_in_between(
        Yinsh.keys_to_positions(Object.keys(game_state.board.markers)), original_position, new_position)
    // validity check
    if (Yinsh.valid_move(game_state, original_position, new_position) !==true){
        return undefined
    }

    const player = game_state.current_player

    // remove the original ring position from the rings placed object to 
    // eventually replace with new position
        const ring_position_without_moved_ring = Object.fromEntries(
        (Object.entries(game_state.board.rings).filter(
            function([k,v])
            {
                return k !== original_key
                })))

    // use the markers in between to flip

    const new_marker_object_with_flipped_markers = Object.fromEntries(
        Object.entries(game_state.board.markers).map(
            function([k,v]) {
                if (placed_markers_in_between.some(function(co_ord){
                    return Yinsh.position_to_key(co_ord) ===k;
                })) {
                        return [k,v=== "white" ? "black" :"white"]
                    }
                return [k,v]
            }
        )
    )

    // const moved_state =
    // {phase: "active",
    //     current_player: next_player(player),
    //     valid_coordinates: Yinsh.valid_co_ordinates,
    //     board: {
    //         rings: {
    //            ...ring_position_without_moved_ring,
    //             [new_key]: player
    //         },
    //         markers: {
    //             ...new_marker_object_with_flipped_markers,
    //             [original_key]: player
    //         }
    //     },
    //     rings_to_place: {
    //                     white: 0,
    //                     black: 0
    //                 },
    //     rings_removed: {
    //         white:0,
    //         black:0
    //     },
    //     winner: undefined
    // };

    let moved_state = undefined
    moved_state =
    {...game_state,
        current_player: next_player(player),
        board: {
            rings: {
               ...ring_position_without_moved_ring,
                [new_key]: player
            },
            markers: {
                ...new_marker_object_with_flipped_markers,
                [original_key]: player
            }
        }

    }



    let lines_of_five = Yinsh.lines_of_five(moved_state)


        while (lines_of_five !== undefined) {
            moved_state = Yinsh.remove_markers(moved_state, lines_of_five)
            lines_of_five = Yinsh.lines_of_five(moved_state)
        }
    const is_winner = Yinsh.winner(moved_state)

    if ( is_winner !== undefined) {
        return is_winner
    }

    return moved_state
}



/**
 * Has a player got 5 consecutive markers
 * @memberof Yinsh
 * @function
 * @param {object}, game state
 * @returns {array}, the consecutive markers
 */


Yinsh.lines_of_five = function (state) {

    let all_possible_lines_of_fives = []

    const directions = [{r:1, q:0}, {r:0, q:1}, {r:-1,q:1}]

    Yinsh.valid_co_ordinates.forEach(function(coord){

        // generate a line of 5 in each of the 3 directions
        const possible_lines_of_five_per_coord = []

        directions.forEach(function(direction){
            const possible_line_of_five_1_direction = []
            for(let i =0; i<5; i++){

                possible_line_of_five_1_direction.push({r:coord.r + direction.r*i,
                    q:coord.q + direction.q*i})
            }

            if (possible_line_of_five_1_direction.every(function(co_ord){
                    return Yinsh.valid_co_ordinates.some(function(val_co_ord){
                        return val_co_ord.r === co_ord.r
                            && val_co_ord.q === co_ord.q}
                        )
                    }
                )
            ){
            possible_lines_of_five_per_coord.push(
                possible_line_of_five_1_direction)
            }
        })
        all_possible_lines_of_fives.push(possible_lines_of_five_per_coord)})

    const board_lines_of_five = []
    // then iterate through possible lines of five

    all_possible_lines_of_fives = all_possible_lines_of_fives.flat()

    all_possible_lines_of_fives.forEach(function(line_of_five){
        const first_key = Yinsh.position_to_key(line_of_five[0])
        const colour_1 = state.board.markers[first_key]
        // iterating through line of five co_ords
        if (line_of_five.every(function(line_of_five_coord){
        // checking if one of the line of five co_ords is in the placed markers
            const key = Yinsh.position_to_key(line_of_five_coord);
            const colour = state.board.markers[key] 

            return state.board.markers[key] !== undefined && colour === colour_1

            }))
        {board_lines_of_five.push({line:line_of_five, colour: colour_1})}})

    if (board_lines_of_five.length >0){
    console.log(board_lines_of_five)
    return board_lines_of_five

    }

    else {
        return undefined
    }


    }



/**
 * Remove a ring from the board if 5 in a row
 * @memberof Yinsh
 * @function
 * @param 
 * @param 
 * @returns 
 */
Yinsh.remove_ring = function () {}


/**
 * Remove the 5 in a row from the board
 * @memberof Yinsh
 * @function
 * @param 
 * @param 
 * @returns 
 */
Yinsh.remove_markers = function (state, lines_of_five) {
        // const co_ords_to_remove = R.chain(R.prop("line"), lines_of_five)
        const co_ords_to_remove = lines_of_five[0].line
        const new_markers = Object.fromEntries(Object.entries(state.board.markers).filter(function([key,colour]) {
            return !co_ords_to_remove.some(function(co_ord) {
                return Yinsh.position_to_key(co_ord) === key
            })
        }))

    // const lines_of_five_colour = R.chain(R.prop("colour"), lines_of_five[0])
    const lines_of_five_colour = lines_of_five[0].colour
    let white_count=0
    let black_count =0
    if (lines_of_five_colour === "white"){
        white_count =1
    }
    if (lines_of_five_colour === "black"){
        black_count =1
    }
    console.log(lines_of_five_colour)
    // const white_count = R.count(R.equals("white"), lines_of_five_colour)
    console.log(white_count)
    // const black_count = R.count(R.equals("black"), lines_of_five_colour)



    const new_rings_removed = { "white":state.rings_removed.white + white_count,
                            "black":state.rings_removed.black +black_count}
console.log (new_rings_removed)
console.log(state)

console.log({
        ...state,
        board: {
            ...state.board,
            markers: new_markers
        },
        rings_removed: new_rings_removed
    })

    return {
        ...state,
        board: {
            ...state.board,
            markers: new_markers
        },
        rings_removed: new_rings_removed
    }
}

/**
 * Win condition: Has a player removed 3 rings
 * @memberof Yinsh
 * @function
 * @param 
 * @param 
 * @returns 
 */
Yinsh.winner = function (state) {
    if (state.rings_removed.white ===3){
        return {...state, winner:"white"}
    }
    if (state.rings_removed.black ===3) {
        return {...state, winner: "black"}
    }
    else {
        return undefined
    }



}






export default Object.freeze(Yinsh);

































































































// /**
//  * Create a new empty board.
//  * Optionally with a specified width and height,
//  * otherwise returns a standard 7 wide, 6 high board.
//  * @memberof Connect4
//  * @function
//  * @param {number} [width = 7] The width of the new board.
//  * @param {number} [height = 6] The height of the new board.
//  * @returns {Connect4.Board} An empty board for starting a game.
//  */
// Connect4.empty_board = function (width = 7, height = 6) {
//     return R.repeat(R.repeat(0, height), width);
// };


// /**
//  * This helper function takes a board, and for each column, returns either
//  * the column's index if it has free slots, or `-1` if it is full.
//  * @function
//  * @param {Connect4.Board} board The board to label.
//  * @returns {number[]} Array containing the column index if free or `-1` if full
//  */
// const label_free_columns = R.addIndex(R.map)((column, index) => (
//     R.includes(0, column)
//     ? index
//     : -1
// ));

// /**
//  * Returns an array of which column numbers are free to place a token in.
//  * @memberof Connect4
//  * @function
//  * @param {Connect4.Board} board The board to check for free columns.
//  * @returns {number[]} An array of column indices of free columns.
//  */
// Connect4.free_columns = R.pipe(
//     label_free_columns,
//     R.reject(R.equals(-1))
// );

// /**
//  * Returns if a game has ended,
//  * either because a player has won or the board is full.
//  * @memberof Connect4
//  * @function
//  * @param {Connect4.Board} board The board to test.
//  * @returns {boolean} Whether the game has ended.
//  */
// Connect4.is_ended = function (board) {
//     return (
//         Connect4.is_winning_for_player(1, board) ||
//         Connect4.is_winning_for_player(2, board) ||
//         Connect4.free_columns(board).length === 0
//     );
// };

// const player_has_win_in_column = function (player) {
//     return function (column) {
//         return R.includes(
//             [player, player, player, player],
//             R.aperture(4, column)
//         );
//     };
// };

// const player_has_vertical_win = function (player, board) {
//     return R.any(player_has_win_in_column(player), board);
// };

// const player_has_horizontal_win = function (player, board) {
//     return player_has_vertical_win(player, R.transpose(board));
// };

// const negative_stagger = function (board) {
//     const column_count = board.length;
//     return board.map(function (column, index) {
//         return [
//             ...R.repeat(0, index),
//             ...column,
//             ...R.repeat(0, column_count - 1 - index)
//         ];
//     });
// };

// const positive_stagger = R.pipe(R.reverse, negative_stagger, R.reverse);

// const player_has_positive_diagonal_win = function (player, board) {
//     return player_has_horizontal_win(player, positive_stagger(board));
// };

// const player_has_negative_diagonal_win = function (player, board) {
//     return player_has_horizontal_win(player, negative_stagger(board));
// };

// /**
//  * Returns if the board is in a winning state for any player.
//  * A board is won for a player if that player has four tokens in a row,
//  * either horizontally, vertically, or diagonally, at any position on the board.
//  * @memberof Connect4
//  * @function
//  * @param {(1 | 2)} player Which player to check has a win.
//  * @param {Connect4.Board} board The board to check.
//  * @returns {boolean} Returns if the board is in a winning state
//  * for the specified player.
//  */
// Connect4.is_winning_for_player = function (player, board) {
//     return (
//         player_has_vertical_win(player, board) ||
//         player_has_horizontal_win(player, board) ||
//         player_has_positive_diagonal_win(player, board) ||
//         player_has_negative_diagonal_win(player, board)
//     );
// };

// /**
//  * Returns which player is the next to make a ply for a board.
//  * @memberof Connect4
//  * @function
//  * @param {Connect4.Board} board The board to check.
//  * @returns {(1 | 2)} The player next to play.
//  */
// Connect4.player_to_ply = function (board) {
//     const flattened_board = R.flatten(board);
//     return (
//         R.count(
//             R.equals(1),
//             flattened_board
//         ) === R.count(
//             R.equals(2),
//             flattened_board
//         )
//         ? 1
//         : 2
//     );
// };

// /**
//  * A ply is one turn taken by one of the players.
//  * Return a new board after a player places a token in a specified column.
//  * @memberof Connect4
//  * @function
//  * @param {Connect4.Token} token The token to be added to the board.
//  * @param {number} column_index The column the player adds the token to
//  * @param {Connect4.Board} board The board state that the ply is made on.
//  * @returns {(Connect4.Board | undefined)} If the ply was legal,
//  *   return the new board, otherwise return `undefined`.
//  */
// Connect4.ply = function (token, column_index, board) {
//     if (Connect4.is_ended(board)) {
//         return undefined;
//     }
//     if (Connect4.player_to_ply(board) !== token) {
//         return undefined;
//     }
//     const row_index = R.indexOf(0, board[column_index]);
//     if (row_index === undefined) {
//         return undefined;
//     }
//     return R.update(
//         column_index,
//         R.update(row_index, token, board[column_index]),
//         board
//     );
// };

// /**
//  * Returns the size of a board as an array of [width, height].
//  * @memberof Connect4
//  * @function
//  * @param {Connect4.Board} board The board to check the size of.
//  * @returns {number[]} The width and height of the board, [width, height].
//  */
// Connect4.size = function (board) {
//     return [board.length, board[0].length];
// };

// const replace_tokens_in_slot = (token_strings) => (token) => (
//     token_strings[token] || token
// );

// const replace_tokens_on_board = function (token_strings) {
//     return function (board) {
//         return R.map(R.map(replace_tokens_in_slot(token_strings)), board);
//     };
// };

// /**
//  * Returns a {@link Connect4.to_string} like function,
//  * mapping tokens to provided string representations.
//  * @memberof Connect4
//  * @function
//  * @param {string[]} token_strings
//  * Strings to represent tokens as. Examples are given in
//  * {@link Connect4.token_strings}
//  * @returns {function} The string representation.
//  */
// Connect4.to_string_with_tokens = (token_strings) => (board) => R.pipe(
//     R.transpose, // Columns to display vertically.
//     R.reverse, // Empty slots at the top.
//     replace_tokens_on_board(token_strings),
//     R.map(R.join(" ")), // Add a space between each slot.
//     R.join("\n") // Stack rows atop each other.
// )(board);

// /**
//  * Returns a string representation of a board.
//  * I.e. for printing to the console rather than serialisation.
//  * @memberof Connect4
//  * @function
//  * @param {Connect4.Board} board The board to represent.
//  * @returns {string} The string representation.
//  */
// Connect4.to_string = Connect4.to_string_with_tokens(["0", "1", "2"]);

// const winning_indices_in_column = function (column) {
//     let streak = 1;
//     let starting_index = 0;
//     let last_token = 0;
//     // some is like forEach, but will escape early if you return true.
//     column.some(function (token, index) {
//         if (token !== 0 && token === last_token) {
//             streak += 1;
//             return;
//         }
//         if (streak >= 4) {
//             starting_index = index - streak;
//             return true;
//         }
//         streak = 1;
//         last_token = token;
//     });
//     if (streak < 4) {
//         return [];
//     }
//     return R.range(starting_index, starting_index + streak);
// };

// const winning_vertical_slots = function (board) {
//     return board.flatMap(function (column, column_index) {
//         return winning_indices_in_column(column).map(
//             (row_index) => [column_index, row_index]
//         );
//     });
// };

// const winning_horizontal_slots = function (board) {
//     return winning_vertical_slots(R.transpose(board)).map(function ([r, c]) {
//         return [c, r];
//     });
// };

// const winning_positive_diagonal_slots = function (board) {
//     return winning_horizontal_slots(positive_stagger(board)).map(
//         function ([c, r]) {
//             return [c, r - (board.length - 1 - c)];
//         }
//     );
// };

// const winning_negative_diagonal_slots = function (board) {
//     return winning_horizontal_slots(negative_stagger(board)).map(
//         function ([c, r]) {
//             return [c, r - c];
//         }
//     );
// };

// /**
//  * For a board that is won,
//  * returns the coordinates (col, row) of slots contributing to the win.
//  * Will return more than four coordinates if there is a win along multiple axes,
//  * or a longer streak than four in a row.
//  * Returns the empty array if the board is not won.
//  * @memberof Connect4
//  * @function
//  * @param {Connect4.board} board The board to analyse.
//  * @returns {number[][]} An array of coordinates.
//  */
// Connect4.winning_slots = function (board) {
//     return R.dropRepeats([
//         ...winning_vertical_slots(board),
//         ...winning_horizontal_slots(board),
//         ...winning_positive_diagonal_slots(board),
//         ...winning_negative_diagonal_slots(board)
//     ]);
// };

// // const print = function (board) {
// //     console.log(Connect4.to_string_with_tokens(
// //         Connect4.token_strings.zombies
// //     )(board));
// //     return board;
// // };
// // debugger;

// export default Object.freeze(Connect4);