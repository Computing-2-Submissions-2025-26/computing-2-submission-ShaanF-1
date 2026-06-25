import R from "./ramda.js";

// ========================
//    Module Declaration
// ========================

/**
 * Yinsh.js is a module to model and play "Yinsh".
 * @namespace Yinsh
 * @author Shaan Fisher
 * @version 2026/
 */

const Yinsh = Object.create(null);

// ========================
//    Type Definitions
// ========================

/**
 * Complete state of a game during a given turn
 * @memberof Yinsh
 * @typedef {object} GameState
 * @property {"setup" | "active"} phase Whether
 *  the game is in setup or active play
 * @property {"white" | "black"} current_player The player whose turn
 * it is
 * @property {Yinsh.Board} board All rings and markers currently on the
 * board
 * @property {{white: number, black: number}} rings_to_place The number of rings
 *  each player has placed so far during setup phase
 * @property {{white: number, black: number}} rings_removed The number of rings
 * each player has removed
 * @property {Yinsh.Player | undefined} winner
 */

/**
* @memberof Yinsh
* @typedef {Object} Board
* @property {Object.<string, Yinsh.Player>} rings
* @property {Object.<string, Yinsh.Player>} markers
*/

/**
 * A position on Yinsh hex-board using cube co-ordinates
 * the third axis p is defined as (-r-q) so is not stored
 * @memberof Yinsh
 * @typedef {Object} Position
 * @property {number} r The r axis co-ordinate
 * @property {number} q The q axis co-ordinate
 */

/**
 * A line of five same colour markers on the board
 * @memberof Yinsh
 * @typedef {Object} LineOfFive
 * @property {Array.<Yinsh.Position>} line The five positions
 * in the line
 * @property {"white" | "black"} colour The colour of the markers
 */




// ========================
//    Constant Definitions
// ========================
const Board_radius = 5; // Yinsh's Board Radius



// ========================
//    Board Generation
// ========================
// its a special hex board missing all corners
// Cube co-ordinates: p = |, q = /, r = \
// Cube co-ordinataes always follow p+q+r = 0
// hence only need to use 2 co-ordinates to define grid

const co_ordinate_exceptions = [
    {r: 0, q: Board_radius},  // top left corner
    {r: -Board_radius, q: Board_radius}, // top centre corner
    {r: -Board_radius, q: 0}, // top right corner

    {r: Board_radius, q: 0}, // bottom left corner
    {r: Board_radius, q: -Board_radius}, // bottom centre corner
    {r: 0, q: -Board_radius} // bottom right corner
];

const find_valid_co_ordinates = function () {
    const valid_co_ordinates = [];

    // generating valid co-ordinates
    R.range(-Board_radius, Board_radius + 1).forEach(function (r) {
        R.range(-Board_radius, Board_radius + 1).forEach(function (q) {
            const p = -r - q;
            if (Math.abs(p) <= 5) {
                valid_co_ordinates.push({r: r, q: q});
            }
        });
    });
    // excluding exceptions
    const is_co_ordinate_exception = function (value) {
        return co_ordinate_exceptions.some(function (exception) {
            return (
                exception.r === value.r &&
                exception.q === value.q
            );
        });
    };
    return valid_co_ordinates.filter(function (value) {
        return !is_co_ordinate_exception(value);
    });
};


// ========================
//    Private Helper Functions
// ========================

const co_ords_in_between = function (array, position_1, position_2) {

    const position_1_p = -position_1.r - position_1.q;
    const position_2_p = -position_2.r - position_2.q;

    const varying_axis = (
        position_1.r === position_2.r
        ? "q"
        : position_1.q === position_2.q
        ? "r"
        : position_1_p === position_2_p
        ? "qr"
        : undefined
    );

    const constant_axis = (
        varying_axis === "r"
        ? "q"
        : varying_axis === "q"
        ? "r"
        : undefined
    );

    let min = undefined;
    let max = undefined;
    // check if p1 or p2 varying axis is larger
    if (varying_axis === "qr") {
        min = Math.min(position_1.q, position_2.q);
        max = Math.max(position_1.q, position_2.q);
    } else {
        min = Math.min(position_1[varying_axis], position_2[varying_axis]);
        max = Math.max(position_1[varying_axis], position_2[varying_axis]);
    }

    const markers_in_between = array.filter(function (co_ordinate) {

        if (varying_axis === "qr") {
            const co_ordinate_p = -co_ordinate.r - co_ordinate.q;
            const is_p_equals_p1 = co_ordinate_p === position_1_p;
            const is_q_greater_min = co_ordinate.q > min;
            const is_q_less_max = co_ordinate.q < max;
            return (is_p_equals_p1 && is_q_greater_min && is_q_less_max);
        } else {

            return (
                (co_ordinate[constant_axis] === position_1[constant_axis])
                && (co_ordinate[varying_axis] > min) &&
                (co_ordinate[varying_axis] < max)
            );
        }
    });

    return markers_in_between;
};

const next_player = function (player) {
    if (player === "white") {
        return "black";
    } else {
        return "white";
    }
};




// ========================
//     Public API
// ========================

/**
 * Converts a position object to a string key for board lookups
 * @memberof Yinsh
 * @function
 * @param {Yinsh.Position} position Position to be converted
 * @returns {string} Position key in form "r,q"
 */

Yinsh.position_to_key = (position) => position.r + "," + position.q;

/**
 * Converts an array of position key strings back to position objects
 * @memberof Yinsh
 * @function
 * @param {Array.<string>} keys Array of position keys in form "r,q"
 * @returns {Array.<Yinsh.Position>} Array of position objects
 */

Yinsh.keys_to_positions = function (keys) {
    return keys.map(function (key) {
        const parts = key.split(",");
        return {r: Number(parts[0]), q: Number(parts[1])};
    });
};


/**
 * All valid positions on the Yinsh board
 * @memberof Yinsh
 * @type {Array.<Yinsh.Position>}
*/

Yinsh.valid_co_ordinates = find_valid_co_ordinates();

/**
 * Creates a new game of Yinsh with an empty board
 * @memberof Yinsh
 * @function
 * @returns {Yinsh.GameState} The initial game state for
 * starting the game
 */

Yinsh.initial_state = function () {
    return {
        phase: "setup",
        current_player: "white",
        board: {
            rings: {},
            markers: {}
        },
        rings_to_place: {
            white: 5,
            black: 5
        },
        rings_removed: {
            white: 0,
            black: 0
        },
        winner: undefined
    };
};


/**
 * Checks if the selected co_ordinate is on the board
 * @memberof Yinsh
 * @function
 * @param {Yinsh.Position} position Co_ordinate to check validity of
 * @returns {boolean} Return true if selected position is on the board
 */
Yinsh.is_valid_co_ordinate = function (position) {
    return Yinsh.valid_co_ordinates.some(function (co_ordinate) {
        return (
            co_ordinate.r === position.r &&
            co_ordinate.q === position.q
        );
    });
};


/**
 * Places the player's ring during the setup phase
 * @memberof Yinsh
 * @function
 * @param {Yinsh.GameState} game_state Contains board information
 * @param {Yinsh.Position} position Co-ordinate the player places
 * ring on
 * @returns {Yinsh.GameState | undefined } Return new state
 * with placed ring on board
 * otherwise return undefined
 */

Yinsh.place_ring = function (game_state, position) {
    const key = Yinsh.position_to_key(position);
        // is position valid board space
    if (!Yinsh.is_valid_co_ordinate(position)) {
        return undefined;
    }
        // is position occupied
    if (game_state.board.rings[key] !== undefined) {
        return undefined;
    }
        // is it not the setup phase
    if (game_state.phase !== "setup") {
        return undefined;
    }

        // otherwise update game state accordingly
    const current_player = game_state.current_player;

        // increment the number of rings to place count
    const new_number_of_rings_to_place = {
        white: (
            current_player === "white"
            ? game_state.rings_to_place.white - 1
            : game_state.rings_to_place.white
        ),
        black: (
            current_player === "black"
            ? game_state.rings_to_place.black - 1
            : game_state.rings_to_place.black
        )
    };

    const total_rings_left = (
        new_number_of_rings_to_place.white
        + new_number_of_rings_to_place.black
    );


    const new_rings = Object.assign({}, game_state.board.rings);
    new_rings[key] = current_player; // add the new placed ring to the board

    return Object.assign({}, game_state, {
        phase: (
            total_rings_left === 0
            ? "active"
            : "setup"
        ),
        current_player: next_player(current_player),
        board: Object.assign({}, game_state.board, {
            rings: new_rings
        }),
        rings_to_place: new_number_of_rings_to_place
    });
};

/**
 * Moves current player's ring in a straight line
 * Leaving a marker of their colour at the original location
 * Any markers on the path are flipped to the opposite colour
 * @memberof Yinsh
 * @function
 * @param {Yinsh.GameState} game_state
 * @param {Yinsh.Position} original_position Position of ring to move
 * @param {Yinsh.Position} new_position New position to move ring to
 * @returns {Yinsh.GameState | undefined} The updated game state,
 * or undefined if move is illegal
 */

Yinsh.move_ring = function (game_state, original_position, new_position) {

        // validity check
    if (!Yinsh.valid_move(game_state, original_position, new_position)) {
        return undefined;
    }
    const original_key = Yinsh.position_to_key(original_position);
    const new_key = Yinsh.position_to_key(new_position);

    const placed_markers = Yinsh.keys_to_positions(
        Object.keys(game_state.board.markers)
    );

    const markers_in_between = co_ords_in_between(
        placed_markers,
        original_position,
        new_position
    );

    const current_player = game_state.current_player;

        // remove ring stored at original position
    const ring_positions_without_moved_ring = Object.fromEntries(
        Object.entries(game_state.board.rings).filter(
            function ([k]) {
                return k !== original_key;
            }
        )
    );

        // flip markers in between
    const new_marker_object_with_flipped_markers = Object.fromEntries(
        Object.entries(game_state.board.markers).map(
            function ([k, v]) {
                if (markers_in_between.some(function (co_ord) {
                    return Yinsh.position_to_key(co_ord) === k;
                })) {
                    return [k, (
                        v === "white"
                        ? "black"
                        : "white"
                    )];
                }
                return [k, v];
            }
        )
    );


    const new_rings = Object.assign({}, ring_positions_without_moved_ring);
    new_rings[new_key] = current_player; // updated ring position

    const new_markers = Object.assign(
        {},
        new_marker_object_with_flipped_markers
    );
    new_markers[original_key] = current_player;

    let moved_state = Object.assign({}, game_state, {
        current_player: next_player(current_player),
        board: {
            rings: new_rings,
            markers: new_markers
        }
    });

    let lines_of_five = Yinsh.lines_of_five(moved_state);

    // iterate through to remove all lines of five
    while (lines_of_five !== undefined) {
        moved_state = Yinsh.remove_markers(moved_state, lines_of_five);
        lines_of_five = Yinsh.lines_of_five(moved_state);
    }

    const is_winner = Yinsh.winner(moved_state);
    if (is_winner) {
        return is_winner;
    }

    return moved_state;
};



/**
 * Checks if move is a legal Yinsh move
 * @memberof Yinsh
 * @function
 * @param {Yinsh.GameState} game_state
 * @param {Yinsh.Position} original_position Position of ring to move
 * @param {Yinsh.Position} new_position Position to move ring to
 * @returns {true | undefined} true if the move is legal,
 * or undefined if move is illegal
 */

Yinsh.valid_move = function (game_state, original_position, new_position) {

    // is it a valid board co-ordinate?
    if (!Yinsh.valid_co_ordinates.some(function (valid_coord) {
        return (
            valid_coord.r === new_position.r
            && valid_coord.q === new_position.q
        );
    })) {
        return undefined;
    }

    // is it active phase?
    if (game_state.phase !== "active") {
        return undefined;
    }

    // is the ring trying to be moved the current players?
    const original_key = Yinsh.position_to_key(original_position);
    if (game_state.board.rings[
        original_key
    ] !== game_state.current_player) {
        return undefined;
    }

    // is straight line? - if P, Q or R are constant
    const r_original = original_position.r;
    const q_original = original_position.q;
    const p_original = (-r_original - q_original);

    const r_new = new_position.r;
    const q_new = new_position.q;
    const p_new = (-r_new - q_new);

    if (
        !((
            r_new === r_original
        ) || (
            q_new === q_original
        ) || (
            p_new === p_original
        ))
    ) {
        return undefined;
    }

    // is not same position?
    if (R.equals(original_position, new_position)) {
        return undefined;
    }

    // is space occupied? by ring OR marker
    const new_key = Yinsh.position_to_key(new_position);
    if (
        game_state.board.rings[new_key] !== undefined
        || game_state.board.markers[new_key]
        !== undefined
    ) {
        return undefined;
    }

    // are there any rings in path?
    if (co_ords_in_between(
        Yinsh.keys_to_positions(Object.keys(game_state.board.rings)),
        original_position,
        new_position
    ).length !== 0) {
        return undefined;
    }



    // if there are markers in the path,
    // has the ring also travelled over any empty spaces?


    const markers_in_between = co_ords_in_between(
        Yinsh.keys_to_positions(Object.keys(
            game_state.board.markers
        )),
        original_position,
        new_position
    );



    const valid_co_ordinates_in_between = co_ords_in_between(
        Yinsh.valid_co_ordinates,
        original_position,
        new_position
    );


    if (markers_in_between.length !== 0) {
        if (
            markers_in_between.length
            !== valid_co_ordinates_in_between.length
        ) {
            return undefined;
        }
    }

    return true;

};



/**
 * Finds five markers in a row of the same colour
 * @memberof Yinsh
 * @function
 * @param {Yinsh.GameState} state game state
 * @returns {Array.<Yinsh.LineOfFive> | undefined} all lines of five,
 * if there are no lines of five, returns undefined
 */


Yinsh.lines_of_five = function (state) {

    let all_possible_lines_of_fives = [];

    const directions = [{r: 1, q: 0}, {r: 0, q: 1}, {r: -1, q: 1}];

    Yinsh.valid_co_ordinates.forEach(function (coord) {

        // generate a line of 5 in each of the 3 directions
        const possible_lines_of_five_per_coord = [];

        directions.forEach(function (direction) {
            const possible_line_of_five_1_direction = [];


            R.range(0, 5).forEach(function (i) {
                possible_line_of_five_1_direction.push({
                    r: coord.r + direction.r * i,
                    q: coord.q + direction.q * i
                });
            });

            if (possible_line_of_five_1_direction.every(function (co_ord) {
                return Yinsh.valid_co_ordinates.some(function (val_co_ord) {
                    return (
                        val_co_ord.r === co_ord.r
                        && val_co_ord.q === co_ord.q
                    );
                });
            })) {
                possible_lines_of_five_per_coord.push(
                    possible_line_of_five_1_direction
                );
            }
        });
        all_possible_lines_of_fives.push(
            possible_lines_of_five_per_coord
        );
    });

    const board_lines_of_five = [];
    // then iterate through possible lines of five

    all_possible_lines_of_fives = all_possible_lines_of_fives.flat();

    all_possible_lines_of_fives.forEach(function (line_of_five) {
        const first_key = Yinsh.position_to_key(line_of_five[0]);
        const colour_1 = state.board.markers[first_key];
        // iterating through line of five co_ords
        if (line_of_five.every(function (line_of_five_coord) {
        // checking if one of the line of
        //  five co_ords is in the placed markers
            const key = Yinsh.position_to_key(line_of_five_coord);
            const colour = state.board.markers[key];

            return (
                state.board.markers[key]
                !== undefined && colour === colour_1
            );
        })) {
            board_lines_of_five.push({line: line_of_five, colour: colour_1});
        }
    });

    if (board_lines_of_five.length > 0) {
        return board_lines_of_five;

    } else {
        return undefined;
    }
};


/**
 * Remove any lines of five from the board
 * @memberof Yinsh
 * @function
 * @param {Yinsh.GameState} state
 * @param {Array.<Yinsh.LineOfFive>} lines_of_five
 * Lines of five markers to remove
 * @returns {Yinsh.GameState} Updated game state with the markers removed
 */
Yinsh.remove_markers = function (state, lines_of_five) {
    const co_ords_to_remove = lines_of_five[0].line;
    const new_markers = Object.fromEntries(
        Object.entries(
            state.board.markers
        ).filter(function ([key]) {
            return !co_ords_to_remove.some(function (co_ord) {
                return Yinsh.position_to_key(co_ord) === key;
            });
        })
    );

    const lines_of_five_colour = lines_of_five[0].colour;
    let white_count = 0;
    let black_count = 0;
    if (lines_of_five_colour === "white") {
        white_count = 1;
    }
    if (lines_of_five_colour === "black") {
        black_count = 1;
    }

    const new_rings_removed = {
        "white": state.rings_removed.white + white_count,
        "black": state.rings_removed.black + black_count
    };

    return Object.assign({}, state, {
        board: Object.assign({}, state.board, {
            markers: new_markers
        }),
        rings_removed: new_rings_removed
    });
};

/**
 * Win condition: Has a player removed 3 rings
 * @memberof Yinsh
 * @function
 * @param {Yinsh.GameState} state game state to check
 * @returns {Yinsh.GameState | undefined} the game state
 * with information on who won, undefined if no one has one yet
 */
Yinsh.winner = function (state) {
    if (state.rings_removed.white === 3) {
        return Object.assign({}, state, {winner: "white"});
    }
    if (state.rings_removed.black === 3) {
        return Object.assign({}, state, {winner: "black"});
    } else {
        return undefined;
    }
};
export default Object.freeze(Yinsh);
