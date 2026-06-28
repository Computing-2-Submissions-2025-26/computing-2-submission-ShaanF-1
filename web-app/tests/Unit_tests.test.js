import Yinsh from "../yinsh.js";
import fc from "fast-check";
import R from "../ramda.js";

// The tests were tested with these functions to ensure that all tests failed
// - as never trust a test that doesnt fail
// Yinsh.initial_state = function() {return undefined};
// Yinsh.place_ring = function() { return undefined; };
// Yinsh.move_ring = function() { return undefined; };
// Yinsh.valid_move = function() { return undefined; };
// Yinsh.lines_of_five = function() { return undefined; };
// Yinsh.remove_markers = function() { return undefined; };
// Yinsh.winner = function() { return undefined; };


// =======================================
// Conversion Helpers
// =======================================
// converts position object {r: , q: } to string key "r,q"

const position_to_key = (position) => position.r + "," + position.q;

//... vice verca
const keys_to_positions = function (keys) {
    return keys.map(function (key) {
        const parts = key.split(",");
        return {r: Number(parts[0]), q: Number(parts[1])};
    });
};

//=========================================
// Generator Helpers
//=========================================

// Random element selector
const pick_random_element = function (array) {
    const random_index = Math.floor(Math.random() * array.length);
    return array[random_index];

};

// Random-Setup Phase Generation
const generate_setup_state = function () {
    return fc.shuffledSubarray(Yinsh.valid_co_ordinates, {
        minLength: 2,
        maxLength: 8
    }).map(function (positions) {
        return positions.reduce(
            function (state, position) {
                return Yinsh.place_ring(state, position);
            },
            Yinsh.initial_state()
        );
    });
};

// Random-Active State Generation

const generate_active_state = function () {
    return fc.shuffledSubarray(Yinsh.valid_co_ordinates, {
        minLength: 10,
        maxLength: 10
    }).map(function (positions) {
        return positions.reduce(
            function (state, position) {
                return Yinsh.place_ring(state, position);
            },
            Yinsh.initial_state()
        );
    });
};


// Random-Play Generation

const random_valid_ring_move = function (state) {
    // pick a random ring
    const current_player_rings = Object.entries(
        state.board.rings
    ).filter(function (entry) {
        return entry[1] === state.current_player;
    });

    const random_ring_key = pick_random_element(current_player_rings)[0];
    const random_ring = keys_to_positions([random_ring_key])[0];

    // find the rings valid moves
    const possible_moves = Yinsh.valid_co_ordinates.filter(
        function (coord) {
            return Yinsh.valid_move(
                state,
                random_ring,
                coord
            ) === true;
        }
    );

    // choose random move
    const random_move = pick_random_element(possible_moves);
    if (possible_moves.length === 0) {
        return undefined;
    }
    // execute one of its random moves
    const new_state = Yinsh.move_ring(state, random_ring, random_move);
    return {
        new_state,
        random_ring,
        random_move
    };
};

const generate_random_play_state = generate_active_state().chain(
    function (state) {
        return fc.integer({min: 10, max: 100}).map(
            function (N) {
                return R.range(0, N).reduce(
                    function (state) {
                        const result = random_valid_ring_move(state);
                        if (result === undefined) {
                            return state;
                        }
                        return result.new_state;
                    },
                    state
                );
            }
        );
    }
);


//=========================================
// Initial State
//=========================================

describe("Yinsh.initial_state()", function () {
    it("Creates an initial state with an empty board", function () {
        const state = Yinsh.initial_state();
        if (state === undefined) {
            throw new Error("Expected initial_state to return a game state.");
        }
        if (state.phase !== "setup") {
            throw new Error("Expected phase to be setup.");
        }
        if (state.current_player !== "white") {
            throw new Error("Expected current player to be white.");
        }
        if (
            state.rings_to_place.white !== 5
            || state.rings_to_place.black !== 5
        ) {
            throw new Error("Expected both players to have 5 rings to place.");
        }

        if (
            state.rings_removed.white !== 0
            || state.rings_removed.black !== 0
        ) {
            throw new Error("Expected both players to have 0 rings removed");
        }

        if (Object.keys(state.board.rings).length !== 0) {
            throw new Error("Expected no rings on the board.");
        }

        if (Object.keys(state.board.markers).length !== 0) {
            throw new Error("Expected no markers on the board.");
        }

    });
});

//=========================================
// Place Ring
//=========================================

describe("Yinsh.place_ring()", function () {

// - occupied coordinate is rejected.
    it("Ring cannot be placed on a valid, occupied co-ordinate", function () {
        fc.assert(fc.property(
            generate_setup_state(),
            function (state) {
                // positive assertion to prevent false positive
                if (state === undefined) {
                    throw new Error(
                        "Expected valid placement to succeed"
                    );
                }
                const current_player_rings = Object.fromEntries(
                    Object.entries(
                        state.board.rings
                    ).filter(function (entry) {
                        return entry[1] === state.current_player;
                    })
                );

                const random_placed_ring = keys_to_positions(
                    [pick_random_element(
                        Object.keys(current_player_rings)
                    )]
                )[0];

                const rejected_state = Yinsh.place_ring(
                    state,
                    random_placed_ring
                );

                if (rejected_state !== undefined) {
                    throw new Error(
                        "Expected placement on occupied coordinate" +
                        "to be rejected. Placement was accepted on" +
                        "occupied space:" + JSON.stringify(random_placed_ring)
                    );
                }
            }
        ));
    });

    it(
        "the current player's ring"
        + " can be placed on valid empty coordinate",
        function () {
            fc.assert(fc.property(
                generate_setup_state(),
                function (state) {

                    const empty_co_ordinates = (
                        Yinsh.valid_co_ordinates.filter(function (co_ord) {
                            return state.board.rings[
                                position_to_key(co_ord)
                            ] === undefined;
                        })
                    );
                    const random_empty_co_ord = pick_random_element(
                        empty_co_ordinates
                    );
                    const new_state = Yinsh.place_ring(
                        state,
                        random_empty_co_ord
                    );
                    if (new_state === undefined) {
                        throw new Error(
                            "Expected initial"
                            + "valid placement not to be rejected"
                        );
                    }
                    const random_empty_key = position_to_key(
                        random_empty_co_ord
                    );
                    if (
                        new_state.board.rings[random_empty_key]
                        !== state.current_player
                    ) {
                        throw new Error(
                            "Expected a "
                            + state.current_player
                            + "ring at " + JSON.stringify(random_empty_key)
                        );

                    }
                }
            ));
        }
    );

    // - successful placement does not mutate the original state.
    it((
        "Successful placement should not"
        + "mutate the original state"
    ), function () {
        fc.assert(fc.property(
            generate_setup_state(),
            function (state) {

                const empty_co_ordinates = (
                    Yinsh.valid_co_ordinates.filter(function (co_ord) {
                        return state.board.rings[
                            position_to_key(co_ord)
                        ] === undefined;
                    })
                );
                const random_empty_co_ord = pick_random_element(
                    empty_co_ordinates
                );
                const state_before_json = JSON.stringify(state);
                Yinsh.place_ring(
                    state,
                    random_empty_co_ord
                );
                const state_after_json = JSON.stringify(state);

                if (state_before_json !== state_after_json) {
                    throw new Error(
                        "Mutation detected,"
                        + "the original state object was modified." +
                        "Original State was:" + state_before_json +
                        "Mutated State was:" + state_after_json
                    );

                }
            }
        ));
    });


    it("Rings can't be placed in the non-setup phase", function () {
        fc.assert(fc.property(
            generate_active_state(),
            function (state) {
                const valid_placement_positions = (
                    Yinsh.valid_co_ordinates.filter(function (co_ord) {
                        return state.board.rings[
                            position_to_key(co_ord)
                        ] === undefined;
                    })
                );

                const valid_placement_position = (
                    pick_random_element(valid_placement_positions)
                );
                const place_ring_non_setup = Yinsh.place_ring(
                    state,
                    valid_placement_position
                );

                if (place_ring_non_setup !== undefined) {
                    throw new Error(
                        "Expected ring placement"
                        + "during non-setup to be rejected." +
                        "Ring was placed at:"
                        + JSON.stringify(valid_placement_position)
                    );
                }
            }
        ));
    });

    it("Phase transitions to active once all 10 rings placed", function () {
        fc.assert(fc.property(
            generate_active_state(),
            function (state) {

                if (state === undefined) {
                    throw new Error(
                        "Expected all 10 placements to be valid."
                    );
                }

                if (state.phase !== "active") {
                    throw new Error(
                        "Expected game phase to be active" +
                        "Instead it is:" + JSON.stringify(state.phase)
                    );
                }
            }
        ));
    });


});


//====================
// Move Ring
//====================


describe("Yinsh.move_ring()", function () {

    it("Moving during setup phase is rejected", function () {
        fc.assert(fc.property(
            generate_setup_state(),
            function (state) {
                const current_player_rings = Object.fromEntries(
                    Object.entries(state.board.rings).filter(
                        function (entry) {
                            return entry[1] === state.current_player;
                        }
                    )
                );

                const random_current_player_ring = keys_to_positions(
                    [pick_random_element(Object.keys(current_player_rings))]
                )[0];

                const new_position = {
                    r: random_current_player_ring.r + 1,
                    q: random_current_player_ring.q
                };
                if (!Yinsh.is_valid_co_ordinate(new_position)) {
                    return;
                }
                const new_state = Yinsh.move_ring(
                    state,
                    random_current_player_ring,
                    new_position
                );

                if (new_state !== undefined) {
                    throw new Error(
                        "Expected undefined, should not be able to"
                        + "move rings during setup phase. " +
                        "Was able to move: " +
                        JSON.stringify(random_current_player_ring) +
                        " to:" + JSON.stringify(new_position)
                    );
                }
            }
        ));
    });


    // - moving in a non-straight line is rejected.

    it("moving in a non-straight line is rejected", function () {
        fc.assert(fc.property(
            fc.constantFrom(...Yinsh.valid_co_ordinates),
            function (position) {
                const test_position = {
                    r: position.r + 1,
                    q: position.q
                };
                const new_position = {
                    r: position.r + 1,
                    q: position.q + 1
                };

                if (
                    !Yinsh.is_valid_co_ordinate(test_position) ||
                    !Yinsh.is_valid_co_ordinate(new_position)
                ) {
                    return;
                }
                const rings = Object.assign({}, {});

                const position_key = position_to_key(position);
                rings[position_key] = "white";

                const state = {
                    phase: "active",
                    current_player: "white",
                    board: {
                        rings,
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

                if (Yinsh.move_ring(
                    state,
                    position,
                    test_position
                ) === undefined) {
                    throw new Error("Expected straight line movement to work");
                }
                if (Yinsh.move_ring(
                    state,
                    position,
                    new_position
                ) !== undefined) {
                    throw new Error(
                        "Expected non-straight line movement to be rejected"
                    );
                }
            }
        ));
    });


      // - moving ring to an occupied space is rejected
    it("Moving a ring to a marker-occupied space is rejected", function () {
        fc.assert(fc.property(
            fc.constantFrom(...Yinsh.valid_co_ordinates),
            function (position) {
                const inter_position_1 = {
                    r: position.r,
                    q: position.q + 1
                };
                const new_position = {
                    r: position.r,
                    q: position.q + 2
                };
                if (
                    !Yinsh.is_valid_co_ordinate(new_position)
                ) {
                    return;
                }
                const position_key = (
                    position_to_key(position)
                );
                const inter_position_1_key = (
                    position_to_key(inter_position_1)
                );
                const new_position_key = (
                    position_to_key(new_position)
                );

                const rings_1 = Object.assign({}, {});
                rings_1[position_key] = "white";
                const empty_state = {
                    phase: "active",
                    current_player: "white",
                    board: {rings: rings_1, markers: {}},
                    rings_to_place: {white: 0, black: 0},
                    rings_removed: {white: 0, black: 0},
                    winner: undefined
                };
                if (Yinsh.move_ring(
                    empty_state,
                    position,
                    inter_position_1
                ) === undefined) {
                    throw new Error("Expected move to empty space to work");
                }



                const rings_2 = Object.assign({}, {});
                rings_2[position_key] = "white";
                const markers_2 = Object.assign({}, {});
                markers_2[inter_position_1_key] = "white";
                markers_2[new_position_key] = "white";

                const state = {
                    phase: "active",
                    current_player: "white",
                    board: {
                        rings: rings_2,
                        markers: markers_2
                    },
                    rings_to_place: {
                        white: 0,
                        black: 0
                    },
                    rings_removed: {
                        white: 0,
                        black: 0
                    },
                    winner: undefined
                };


                const moved_state = Yinsh.move_ring(
                    state,
                    position,
                    new_position
                );

                if (moved_state !== undefined) {
                    throw new Error(
                        "Expected undefined, can't move a ring"
                        + "to a marker-occupied position " +
                        ". Ring at: " +
                        JSON.stringify(position) +
                        "was moved to marker occupied space:" +
                        JSON.stringify(new_position)
                    );
                }
            }
        ));
    });



    // - moving ring to an occupied space is rejected
    it("Moving a ring to a ring-occupied space is also rejected", function () {
        fc.assert(fc.property(
            fc.constantFrom(...Yinsh.valid_co_ordinates),
            function (position) {

                const inter_position_1 = {
                    r: position.r,
                    q: position.q + 1
                };

                const new_position = {
                    r: position.r,
                    q: position.q + 2
                };

                if (
                    !Yinsh.is_valid_co_ordinate(new_position)
                ) {
                    return;
                }
                const position_key = (
                    position_to_key(position)
                );
                const inter_position_1_key = (
                    position_to_key(inter_position_1)
                );
                const new_position_key = (
                    position_to_key(new_position)
                );
                const rings = Object.assign({}, {});
                rings[position_key] = "white";
                const empty_state = {
                    phase: "active",
                    current_player: "white",
                    board: {rings, markers: {}},
                    rings_to_place: {white: 0, black: 0},
                    rings_removed: {white: 0, black: 0},
                    winner: undefined
                };
                if (Yinsh.move_ring(
                    empty_state,
                    position,
                    inter_position_1
                ) === undefined) {
                    throw new Error("Expected move to empty space to work");
                }
                const rings_2 = Object.assign({}, {});
                rings_2[position_key] = "white";
                rings_2[new_position_key] = "white";
                const markers_2 = Object.assign({}, {});
                markers_2[inter_position_1_key] = "white";
                const state = {
                    phase: "active",
                    current_player: "white",
                    board: {
                        rings: rings_2,
                        markers: markers_2
                    },
                    rings_to_place: {
                        white: 0,
                        black: 0
                    },
                    rings_removed: {
                        white: 0,
                        black: 0
                    },
                    winner: undefined
                };


                const moved_state = Yinsh.move_ring(
                    state,
                    position,
                    new_position
                );

                if (moved_state !== undefined) {
                    throw new Error(
                        "Expected undefined, can't move a ring"
                        + "to a ring-occupied position " +
                        ". Ring at: " +
                        JSON.stringify(position) +
                        "was moved to ring occupied space:" +
                        JSON.stringify(new_position)
                    );
                }
            }
        ));
    });

    // - can only move ring across 1 set of consecutive markers,
    // it must be placed at the next empty space
    it("Can only move a ring across markers not empty spaces", function () {
        fc.assert(fc.property(
            fc.constantFrom(...Yinsh.valid_co_ordinates),
            function (position) {

                const inter_position_1 = {
                    r: position.r,
                    q: position.q + 1
                };

                const inter_position_2 = {
                    r: position.r,
                    q: position.q + 3
                };

                const new_position = {
                    r: position.r,
                    q: position.q + 4
                };

                if (
                    !Yinsh.is_valid_co_ordinate(new_position)
                ) {
                    return;
                }
                const position_key = (
                    position_to_key(position)
                );
                const inter_position_1_key = (
                    position_to_key(inter_position_1)
                );
                const inter_position_2_key = (
                    position_to_key(inter_position_2)
                );
                const consecutive_position_2 = {
                    r: position.r,
                    q: position.q + 2
                };
                const consecutive_key = position_to_key(
                    consecutive_position_2
                );
                const consecutive_dest = {r: position.r, q: position.q + 3};
                if (!Yinsh.is_valid_co_ordinate(consecutive_dest)) {
                    return;
                }

                const rings = Object.assign({}, {});
                rings[position_key] = "white";
                const markers = Object.assign({}, {});
                markers[inter_position_1_key] = "white";
                markers[consecutive_key] = "white";

                const consecutive_state = {
                    phase: "active",
                    current_player: "white",
                    board: {
                        rings,
                        markers
                    },
                    rings_to_place: {white: 0, black: 0},
                    rings_removed: {white: 0, black: 0},
                    winner: undefined
                };
                if (Yinsh.move_ring(
                    consecutive_state,
                    position,
                    consecutive_dest
                ) === undefined) {
                    throw new Error(
                        "Expected move over consecutive markers to work"
                    );
                }

                const rings_2 = Object.assign({}, {});
                rings_2[position_key] = "white";
                const markers_2 = Object.assign({}, {});
                markers_2[inter_position_1_key] = "white";
                markers_2[inter_position_2_key] = "white";

                const state = {
                    phase: "active",
                    current_player: "white",
                    board: {
                        rings: rings_2,
                        markers: markers_2
                    },
                    rings_to_place: {
                        white: 0,
                        black: 0
                    },
                    rings_removed: {
                        white: 0,
                        black: 0
                    },
                    winner: undefined
                };

                const moved_state = Yinsh.move_ring(
                    state,
                    position,
                    new_position
                );

                if (moved_state !== undefined) {
                    throw new Error(
                        "Expected undefined, can't move a ring"
                        + "over an empty space"
                    );
                }
            }
        ));
    });



    // - moving opponent's ring is rejected.
    it("Moving an opponent's ring is rejected", function () {
        fc.assert(fc.property(
            fc.constantFrom(...Yinsh.valid_co_ordinates),
            function (position) {

                const new_position = {
                    r: position.r,
                    q: position.q + 1
                };

                if (
                    !Yinsh.is_valid_co_ordinate(new_position)
                ) {
                    return;
                }
                const position_key = (
                    position_to_key(position)
                );
                const rings = Object.assign({}, {});
                rings[position_key] = "white";

                const own_ring_state = {
                    phase: "active",
                    current_player: "white",
                    board: {
                        rings,
                        markers: {}
                    },
                    rings_to_place: {white: 0, black: 0},
                    rings_removed: {white: 0, black: 0},
                    winner: undefined
                };
                if (Yinsh.move_ring(
                    own_ring_state,
                    position,
                    new_position
                ) === undefined) {
                    throw new Error("Expected moving own ring to work");
                }


                const rings_2 = Object.assign({}, {});
                rings_2[position_key] = "black";

                const state = {
                    phase: "active",
                    current_player: "white",
                    board: {
                        rings: rings_2,
                        markers: {

                        }
                    },
                    rings_to_place: {
                        white: 0,
                        black: 0
                    },
                    rings_removed: {
                        white: 0,
                        black: 0
                    },
                    winner: undefined
                };


                const moved_state = Yinsh.move_ring(
                    state,
                    position,
                    new_position
                );

                if (moved_state !== undefined) {
                    throw new Error(
                        "Expected undefined, should not be able to"
                        + "move enemy player's ring"
                    );
                }
            }
        ));
    });


    // - total number of rings stays the same after a legal move.
    it((
        "The total number of rings" +
        " stays the same after a legal move"
    ), function () {
        fc.assert(fc.property(generate_random_play_state, function (state) {

            const result = random_valid_ring_move(state);


            if (result === undefined || result.new_state === undefined) {
                return;
            }

            const {new_state} = result;



            if (
                new_state.rings_removed.white
                !== state.rings_removed.white
                ||
                new_state.rings_removed.black
                !== state.rings_removed.black
            ) {
                return;
            }
            const n_rings_before = Object.keys(state.board.rings).length;
            const n_rings_after = Object.keys(new_state.board.rings).length;

            if (n_rings_before !== n_rings_after) {
                throw new Error(
                    "expected number of rings" +
                    "to stay the same after a legal move"
                    + ". Number of rings changed from "
                    + n_rings_before + "to" +
                    n_rings_after
                );
            }

        }));
    });



    // - legal move moves the ring from start to
    // destination and leaves a marker at start.

    it((
        "legal move moves the ring from start to destination "
        + "and leaves a marker at the start"
    ), function () {
        fc.assert(fc.property(
            generate_random_play_state,
            function (state) {
                const result = random_valid_ring_move(state);
                if (
                    result === undefined
                    || result.new_state === undefined
                ) {
                    return;
                }
                const {new_state, random_ring, random_move} = result;

                if (
                    new_state.rings_removed.white
                    !== state.rings_removed.white ||
                    new_state.rings_removed.black
                    !== state.rings_removed.black
                ) {
                    return;
                }

                // marker at the start
                const is_marker_at_origin = new_state.board.markers[
                    position_to_key(random_ring)
                ] !== undefined;

                // ring at new destination not start
                const is_ring_at_destination = new_state.board.rings[
                    position_to_key(random_move)
                ] !== undefined;
                if (!is_ring_at_destination || !is_marker_at_origin) {
                    throw new Error(
                        "Expected the current player's colour"
                        + "marker at start position and"
                        + "their ring at the destination"
                    );
                }
            }
        ));
    });

    // - legal move with markers flips exactly the markers on the path.

    it("A legal move only flips the markers on its path", function () {
        fc.assert(fc.property(
            generate_random_play_state,
            function (state) {
                const result = random_valid_ring_move(state);
                if (
                    result === undefined
                    || result.new_state === undefined
                ) {
                    return;
                }
                const {new_state, random_ring, random_move} = result;

                if (
                    new_state.rings_removed.white
                    !== state.rings_removed.white ||
                    new_state.rings_removed.black
                    !== state.rings_removed.black
                ) {
                    return;
                }

                const marker_positions = keys_to_positions(
                    Object.keys(state.board.markers)
                );

                const markers_in_between = Yinsh.co_ords_in_between(
                    marker_positions,
                    random_ring,
                    random_move
                );

                markers_in_between.forEach(function (co_ord) {
                    const key = position_to_key(co_ord);
                    if (
                        state.board.markers[key]
                        === new_state.board.markers[key]
                    ) {
                        throw new Error(
                            "Expected marker at "
                            + key + " to be flipped"
                        );
                    }
                });
            }
        ));
    });


    it("Turn alternates when player successfuly moves ring", function () {

        fc.assert(fc.property(
            generate_random_play_state,
            function (state) {
                const result = random_valid_ring_move(state);
                if (
                    result === undefined
                    || result.new_state === undefined
                ) {
                    return;
                }
                const new_state = result.new_state;

                if (
                    new_state.rings_removed.white
                    !== state.rings_removed.white ||
                    new_state.rings_removed.black
                    !== state.rings_removed.black
                ) {
                    return;
                }
                if (
                    state.current_player
                    === new_state.current_player
                ) {
                    throw new Error(
                        "Expected turn to alternate"
                        + "after successful ring movement"
                        + " but current player stayed as: "
                        + state.current_player
                    );
                }
            }
        ));
    });
});


//=======================
//Lines of Five
//=======================

describe("Yinsh.lines_of_five", function () {


    // - every returned line has exactly 5 coordinates.

    it("every returned line has exactly 5 co-ordinates", function () {
        fc.assert(fc.property(
            generate_random_play_state,
            function (state) {
                const lines = Yinsh.lines_of_five(state);

                if (lines === undefined) {
                    return;
                }

                const failing_line = lines.find(function (line) {
                    return line.line.length !== 5;
                });

                if (failing_line) {
                    throw new Error(
                        "Expected only 5 co-ordinates"
                        + "per line of five" +
                        ", got:" + failing_line.line.length
                        + "at line: " + JSON.stringify(failing_line.line)
                    );
                }


            }
        ));
    });
});



//=======================
// Remove markers (includes all win conditions)
//======================

describe("Yinsh.remove_markers()", function () {

    it((
        "all markers in the line of"
        + "five are removed from the board"
    ), function () {
        fc.assert(fc.property(
            generate_random_play_state,
            function (state) {
                const lines = Yinsh.lines_of_five(state);
                if (lines === undefined) {
                    return;
                }
                const new_state = Yinsh.remove_markers(state, lines);
                if (lines[0].line.some(function (co_ord) {
                    return new_state.board.markers[
                        position_to_key(co_ord)
                    ] !== undefined;
                })) {
                    throw new Error(
                        "expected all markers"
                        + "in the line to be removed. "
                        + "Remaining markers to be removed: " + JSON.stringify(
                            lines[0].line.filter(function (co_ord) {
                                return new_state.board.markers[
                                    position_to_key(co_ord)
                                ] !== undefined;
                            })
                        )
                    );
                }
            }
        ));
    });

    // - if both players have fewer than
    //  3 removed rings, winner returns undefined.

    it((
        "winner returns the player who won"
        + " the game if a player has gotten 3 lines of 5"
    ), function () {
        fc.assert(fc.property(generate_random_play_state, function (state) {
            if (
                state.rings_removed.white < 3
                && state.rings_removed.black < 3
            ) {
                return;
            }

            if (Yinsh.winner(state) === undefined) {
                throw new Error(
                    "Expected winner to be returned when 3 rings removed" +
                    "White removed: " + state.rings_removed.white +
                    " Black removed: " + state.rings_removed.black
                );
            }
        }));
    });


});