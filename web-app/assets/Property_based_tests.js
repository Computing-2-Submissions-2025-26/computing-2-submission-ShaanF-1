import Yinsh from "../yinsh.js";
import fc from "fast-check";
import R from "../ramda.js";


// ========================
// Random Active Game State Generation
// ========================

// Generates a real active game state by playing through setup
// shuffles valid coords, picks 10, places rings one by one
const random_active_state = fc.shuffledSubarray(
    Yinsh.valid_co_ordinates,
    {minLength: 10, maxLength: 10}
// place rings
).map(function (positions) {
    return positions.reduce(function (state, position) {
        if (state === undefined) {
            return undefined;
        }
        return Yinsh.place_ring(state, position);
    }, Yinsh.initial_state());
// filter out any undefined states or states where all 10 rings weren't placed
}).filter(function (state) {
    return state !== undefined && state.phase === "active";
});


// ========================
// Ring Movement Generation
// ========================

const max_moves = 10;
// Plays several moves
const play_n_moves = function (random_state) {
    return random_state.map(function (state) {
        let current_state = state;
    
        const n_moves = Math.floor(Math.random() * max_moves) + 1;

        // play n number of moves
        R.range(0, n_moves).forEach(function () {
            let valid_moves = [];

            // current players rings
            const current_player_rings = Object.keys(current_state.board.rings)
            .filter(function (key) {
                return current_state.board.rings[key]
                 === current_state.current_player;
            });

            //find all valid co-ordinates for a ring
            current_player_rings.forEach(function (ring) {
                const origin = Yinsh.keys_to_positions([ring])[0];
                const valid_moves_per_ring = Yinsh.valid_co_ordinates.filter(
                    function (co_ord) {
                        return Yinsh.valid_move(current_state, origin, co_ord);
                    }
                );
                valid_moves = valid_moves.concat(
                    valid_moves_per_ring.map(function (co_ord) {
                        return {origin, co_ord};
                    })
                );
            });

            if (valid_moves.length === 0) {
                return;
            }

            // pick a random valid move
            const random_valid_move = valid_moves[
                Math.floor(Math.random() * valid_moves.length)
            ];
            current_state = Yinsh.move_ring(
                current_state,
                random_valid_move.origin,
                random_valid_move.co_ord
            );
        });

        return current_state;
    });
};

const random_active_state_after_moves = play_n_moves(random_active_state);


// ========================
// Initial State
// ========================

describe("Yinsh.initial_state()", function () {

    // Example Based
    it("Creates an initial state with an empty board", function () {
        const state = Yinsh.initial_state();
        if (!state === undefined) {
            throw new Error("Expected initial_state to return a game state.");
        }
        if (state.phase !== "setup") {
            throw new Error("Expected phase to be setup.");
        }
        if (state.current_player !== "white") {
            throw new Error("Expected current player to be white.");
        }
        if (state.rings_to_place.white !== 5 || state.rings_to_place.black !== 5) {
            throw new Error("Expected both players to have 5 rings to place.");
        }
        if (state.rings_removed.white !== 0 || state.rings_removed.black !== 0) {
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


// ========================
// Place Ring
// ========================

describe("Yinsh.place_ring()", function () {

    // Property Based

    // GIVEN any 10 unique valid coordinates
    // WHEN all 10 rings are placed one by one
    // THEN phase should always transition to active
    it("after all 10 rings are placed, phase transitions to active",
        function () {
        fc.assert(fc.property(
            random_active_state,
            function (state) {
                if (state.phase !== "active") {
                    throw new Error(
                        "Expected phase to change to active" +
                        " once 10 rings are placed"
                    );
                }
            }
        ));
    });

    // GIVEN any valid active state (all 10 rings placed)
    // WHEN place_ring is called on any coordinate
    // THEN it should always return undefined
  it("placing a ring in the active phase is always rejected", function () {
    fc.assert(fc.property(
        random_active_state,
        fc.constantFrom(...Yinsh.valid_co_ordinates),
        function (state, position) {
            const new_state = Yinsh.place_ring(state, position);
            if (new_state !== undefined) {
                throw new Error(
                    "Expected ring placement during" +
                    " active phase to be rejected"
                );
            }
        }
    ));
});



    // GIVEN any valid coordinate
    // WHEN place_ring is called
    // THEN the original state should never be modified
    it("place_ring never mutates the original state", function () {
    });
    fc.assert(fc.property(
    fc.constantFrom(...Yinsh.valid_co_ordinates),
    function (position) {
        const state = Yinsh.initial_state();
        const state_before = JSON.stringify(state);
        Yinsh.place_ring(state, position);
        if (JSON.stringify(state) !== state_before) {
            throw new Error("Expected placing rings"
                + "to not mutatate original state");
        }
    }
));


    // ---- Example Based ----

    // GIVEN any valid coordinate
    // WHEN place_ring is called on an empty board
    // THEN the ring should appear at that coordinate
      it("the current player's ring can be placed on valid empty coordinate",
            function(){ //Be more clear and explicit here
            // - what is a "valid co-ordinate"
            fc.assert(fc.property(
                // "..." separates valid co ordinates into separate items
                fc.constantFrom(...Yinsh.valid_co_ordinates),
                function(position) {
                    const state = Yinsh.initial_state();
                    const next_state = Yinsh.place_ring(state, position);
                        const key = Yinsh.position_to_key(position);

                    if (next_state === undefined) {
                        throw new Error("Expected valid placement not to be rejected.");
                    }

                    if (next_state.board.rings[key] !== state.current_player){
                        throw new Error(
                            "Expected " + state.current_player +
                            " ring at" + key + "."
                        );
                    }
                }
));
});

    // GIVEN any valid coordinate
    // WHEN place_ring is called twice on the same coordinate
    // THEN the second call should always return undefined
           it("ring cannot be placed on an occupied space", function(){
               fc.assert(fc.property(
                   fc.constantFrom(...Yinsh.valid_co_ordinates),
                   function(position) {
                       const state = Yinsh.initial_state();
   
                       const occupied_state = Yinsh.place_ring(state, position);
                       const rejected_state = Yinsh.place_ring(occupied_state, position);
   
                       if (rejected_state !== undefined){
                           throw new Error(
                               "Expected placement on occupied coordinate" +
                               "to be rejected."
                           );
                       }
                   }
               ));
           });)


// ========================
// Move Ring
// ========================

describe("Yinsh.move_ring()", function () {

    // ---- Property Based ----

    // GIVEN any valid active state and any valid move
    // WHEN move_ring is called
    // THEN current_player should always be different after the move
    it("turn always alternates after a valid move", function () {
    fc.assert(fc.property(
        random_active_state_after_moves,
        function (state) {
            const current_player_rings = Object.keys(
                state.board.rings
            ).filter(function (key) {
                return state.board.rings[key] === state.current_player;
            });

            // select a ring to move
            const original_position = Yinsh.keys_to_positions(
                [current_player_rings[0]]
            )[0];

            // find a valid move
            const new_position = Yinsh.valid_co_ordinates.find(
                function (co_ord) {
                    return Yinsh.valid_move(state, original_position, co_ord);
                }
            );

            if (new_position === undefined) {
                return;
            }

            const new_state = Yinsh.move_ring(state, original_position, new_position);
            if (new_state.current_player === state.current_player) {
                throw new Error(
                    "Expected turn to alternate after a move"
                );
            }
        }
    ));
});


    // GIVEN any valid active state and any valid move
    // WHEN move_ring is called
    // THEN no position should ever have both a ring and a marker
it("no position ever has both a ring and a marker", function () {
    fc.assert(fc.property(
        random_active_state_after_moves,
        function (state) {
            const move = find_valid_move(state);
            if (move === undefined) {
                return;
            }
            const new_state = Yinsh.move_ring(
                state, move.original_position, move.new_position
            );
            const is_overlap = Object.keys(new_state.board.rings).some(
                function (key) {
                    return new_state.board.markers[key] !== undefined;
                }
            );
            if (is_overlap) {
                throw new Error(
                    "Expected no position to have both a ring and a marker"
                );
            }
        }
    ));
});







    // GIVEN any valid active state and any valid move
    // WHEN move_ring is called
    // THEN the original state should never be modified
    it("move_ring never mutates the original state", function () {
    fc.assert(fc.property(
        random_active_state_after_moves,
        function (state) {
            const move = find_valid_moves(state);
            if (move === undefined) {
                return;
            }
        const state_before = JSON.stringify(state);
        Yinsh.move_ring(
                state, move.original_position, move.new_position
            );
        if (JSON.stringify(state) !== state_before) {
            throw new Error("Expected moving rings"
                + "to not mutatate original state");
        }
    }
));
          
            })
   

    // GIVEN any valid active state
    // pick a destination that is already occupied by a marker
    // WHEN move_ring is called with that destination
    // THEN it should always return undefined
    it("moving to a marker-occupied space is always rejected", function () {
        fc.assert(fc.property(
        random_active_state_after_moves,
        function (state) {
            const invalid_moves = find_valid_move(state);
            if (move !== undefined) {
                return;
            }
        const state_before = JSON.stringify(state);
        Yinsh.move_ring(
                state, move.original_position, move.new_position
            );
        if (JSON.stringify(state) !== state_before) {
            throw new Error("Expected moving rings"
                + "to not mutatate original state");
        }
    }
));
          
            })
   

    // GIVEN any valid active state
    // pick a destination that is already occupied by a ring
    // WHEN move_ring is called with that destination
    // THEN it should always return undefined
    it("moving to a ring-occupied space is always rejected", function () {
    });

    // GIVEN any valid active state
    // pick a ring belonging to the opponent as origin
    // WHEN move_ring is called with that ring
    // THEN it should always return undefined
    it("moving an opponent ring is always rejected", function () {
    });

    // GIVEN any valid active state
    // generate a destination that is not on a straight line from origin
    // WHEN move_ring is called with that destination
    // THEN it should always return undefined
    it("moving in a non-straight line is always rejected", function () {
    });

    // GIVEN any valid active state
    // generate a destination beyond a gap in markers
    // WHEN move_ring is called jumping over the gap
    // THEN it should always return undefined
    it("moving over an empty space between markers is always rejected",
        function () {
    });

    // ---- Example Based ----

    // GIVEN any valid active state and any valid move
    // WHEN move_ring is called
    // THEN a marker should appear at origin and ring at destination
    it("marker appears at origin and ring at destination after valid move",
        function () {
    });

    // GIVEN any valid active state with markers on the board
    // WHEN move_ring is called jumping over those markers
    // THEN all markers on the path should be flipped
    it("all markers on the path are flipped after a valid move", function () {
    });

});


// ========================
// Lines of Five
// ========================

describe("Yinsh.lines_of_five()", function () {

    // ---- Property Based ----

    // GIVEN any valid active state with no markers
    // WHEN lines_of_five is called
    // THEN it should always return undefined
    it("returns undefined when there are no lines of five", function () {
    });

    // GIVEN any valid active state after several moves where a line exists
    // WHEN lines_of_five is called
    // THEN every returned line should always have exactly 5 coordinates
    it("every returned line always has exactly 5 coordinates", function () {
    });

    // GIVEN any valid active state after several moves where a line exists
    // WHEN lines_of_five is called
    // THEN every returned line should always be a single colour
    it("every returned line is always a single colour", function () {
    });

});


// ========================
// Remove Markers
// ========================

describe("Yinsh.remove_markers()", function () {

    // ---- Property Based ----

    // GIVEN any valid active state with a line of five
    // WHEN remove_markers is called
    // THEN none of the 5 marker positions should exist in the new state
    it("all markers in the line are removed from the board", function () {
    });

    // GIVEN any valid active state with a line of five
    // WHEN remove_markers is called
    // THEN rings_removed for the correct player should increase by exactly 1
    it("rings_removed increments by 1 for the correct player", function () {
    });

    // ---- Example Based ----

    // GIVEN any valid active state with a line of five and other markers
    // WHEN remove_markers is called
    // THEN markers not in the line should be unchanged
    it("markers not in the line are unaffected", function () {
    });

});


// ========================
// Winner
// ========================

describe("Yinsh.winner()", function () {

    // ---- Property Based ----

    // GIVEN any state where neither player has 3 rings removed
    // WHEN winner is called
    // THEN it should always return undefined
    it("returns undefined when neither player has 3 rings removed",
        function () {
    });

    // ---- Example Based ----

    // GIVEN any state where a player has exactly 3 rings removed
    // WHEN winner is called
    // THEN that player should always be returned as winner
    it("returns the correct winner when a player has 3 rings removed",
        function () {
    });

});