import yinsh from "../yinsh.js";
import fc from "fast-check";


// ----Board & Setup----

// Initial State:

describe("yinsh.initial_state()", function () {
    it("Creates an initial state with an empty board", function () {
        const state = yinsh.initial_state();
    if (state === undefined) {
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

    if (state.rings_removed.white !== 0 || state.rings_removed.black !==0) {
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



// Place Rings:
// - valid empty coordinate places the current player's ring

//GIVEN any coordinate chosen from the valid board coordinates
//AND an initial setup state with no rings placed
//WHEN place_ring is called with that coordinate
//THEN the current player's ring should be placed at that coordinate

describe("yinsh.place_ring()", function() {
    it("the current player's ring can be placed on valid empty coordinate",
        function(){ //Be more clear and explicit here
        // - what is a "valid co-ordinate"
        fc.assert(fc.property(
            // "..." separates valid co ordinates into separate items
            fc.constantFrom(...yinsh.valid_co_ordinates),
            function(position) {
                const state = yinsh.initial_state();
                const next_state = yinsh.place_ring(state, position);
                    const key = yinsh.position_to_key(position);

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
        ),  { verbose: 2 });
    });

    // - occupied coordinate is rejected.
        it("valid occupied co ordinate does not place a ring", function(){
            fc.assert(fc.property(
                fc.constantFrom(...yinsh.valid_co_ordinates),
                function(position) {
                    const state = yinsh.initial_state();
                    // verify it works - positive assertion required otherwise will always pass
                    const occupied_state = yinsh.place_ring(state, position);
                     if (occupied_state === undefined){
                        throw new Error(
                            "Expected first placement to succeed"
                        );
                    }
                    const rejected_state = yinsh.place_ring(occupied_state, position);

                    if (rejected_state !== undefined){
                        throw new Error(
                            "Expected placement on occupied coordinate" +
                            "to be rejected."
                        );
                    }
                }
            ));
        });

// REWRITE USING VAL ACTIVE PHASE
// // - non-setup phase placement is rejected.

        it("Rings can't be placed in the non-setup phase", function(){
            fc.assert(fc.property(
                fc.constantFrom(...yinsh.valid_co_ordinates),
                function(position) {
                    const state = yinsh.initial_state();
                    state.phase = "active";
                    const place_ring_non_setup = yinsh.place_ring(state, position);

                    if (place_ring_non_setup !== undefined){
                        throw new Error(
                            "Expected ring placement during non-setup to be rejected."
                        );
                    }
                }
            ));
        });


// - phase transitions to non-setup phase once all 10 rings placed

        it("Phase transitions to active once all 10 rings placed", function(){
            fc.assert(fc.property(
                fc.shuffledSubarray(yinsh.valid_co_ordinates, {
                    minLength: 10,
                    maxLength: 10
                    }),
                function(ring_positions) {

                    const final_state = ring_positions.reduce(
                        function(state, position) {
                             if (state === undefined) {
                                 return undefined;
                             }
                            return yinsh.place_ring(state, position);
                        },
                        yinsh.initial_state()
                    );

                    if (final_state === undefined) {
                        throw new Error(
                            "Expected all 10 placements to be valid."
                        );
                    }
                    if (final_state.phase !== "active"){
                        throw new Error(
                            "Expected game phase to be active"
                        );
                    }
                }
            ));
        });

// - successful placement does not mutate the original state.
        it("Successful placement should not mutate the original state",
            function(){
            fc.assert(fc.property(
                fc.constantFrom(...yinsh.valid_co_ordinates),
                function(position) {
                    const state = yinsh.initial_state();
                    // check if placement works first 
                    if (state ===undefined){
                        throw new Error(
                            "Expected successfull ring placement"
                        );
                    }
                    const state_before_json = JSON.stringify(state);

                    yinsh.place_ring(state, position);

                    const state_after_json = JSON.stringify(state);


                    if (state_before_json !== state_after_json){
                        throw new Error(
                            "Mutation detected, the original state object was modified."
                        );
                    }
                }
            ));
        });

    });


// Move Rings:


describe("yinsh.move_ring()", function() {
    // -----legality------
// REPLACE WITH NEW
it("Turn alternates when player successfuly moves ring", function(){
        fc.assert(fc.property(
            fc.constantFrom(...yinsh.valid_co_ordinates),
            function(position) {
                 const new_position = {
                    r:position.r+1,
                    q:position.q
                };

                if (!yinsh.is_valid_co_ordinate(new_position)) {
                    return;
                }

                const position_key = yinsh.position_to_key(position);

                const state = {
                    phase: "active",
                    current_player: "white",
                    board: {
                        rings: {
                            [position_key]: "white"
                        },
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
                const moved_state = yinsh.move_ring(state, position, new_position);
                if (moved_state.current_player !== "black") {
                    throw new Error("Expected turn to alternate"
                        + "after successful marker movement");
                }
            }
        ));
    });

    it("Moving during setup phase is rejected", function(){
        fc.assert(fc.property(
            fc.constantFrom(...yinsh.valid_co_ordinates),
            function(position) {
                 const new_position = {
                    r:position.r+1,
                    q:position.q
                };

                if (!yinsh.is_valid_co_ordinate(new_position)) {
                    return;
                }

                const position_key = yinsh.position_to_key(position);

                const state = {
                    phase: "setup",
                    current_player: "white",
                    board: {
                        rings: {
                            [position_key]: "white"
                        },
                        markers: {
                        }
                    },
                    rings_to_place: {
                        white: 1,
                        black: 0
                    },
                    rings_removed: {
                        white: 0,
                        black: 0
                    },
                    winner: undefined
                };
                 // first verify move_ring works in active phase
                const active_state = {
                    phase: "active",
                    current_player: "white",
                    board: {rings: {[position_key]: "white"}, markers: {}},
                    rings_to_place: {white: 0, black: 0},
                    rings_removed: {white: 0, black: 0},
                    winner: undefined
                };
                if (yinsh.move_ring(active_state, position, new_position)
                    === undefined) {
                    throw new Error(
                    "Expected move to work in active phase"
                );
            }

                const moved_state = yinsh.move_ring(state, position, new_position);
                if (moved_state !== undefined) {
                    throw new Error("Expected undefined, should not be able to"
                        + "move rings during setup phase");
                }
            }
        ));
    });


    // - moving in a non-straight line is rejected.

    it("moving in a non-straight line is rejected", function(){
    fc.assert(fc.property(
        fc.constantFrom(...yinsh.valid_co_ordinates),
        function(position) {
            const test_position = {
                r: position.r + 1,
                q: position.q
            };
            const new_position = {
                r: position.r + 1,
                q: position.q + 1
            };

            if (
                !yinsh.is_valid_co_ordinate(test_position) ||
                !yinsh.is_valid_co_ordinate(new_position)
            ) {
                return;
            }

            const position_key = yinsh.position_to_key(position);
            const state = {
                phase: "active",
                current_player: "white",
                board: {
                    rings: {
                        [position_key]: "white"
                    },
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

            if (yinsh.move_ring(state, position, test_position) === undefined) {
                throw new Error("Expected straight line movement to work");
            }
            if (yinsh.move_ring(state, position, new_position) !== undefined) {
                throw new Error("Expected non-straight line ring movement to be rejected");
            }
        }
    ));
});
// - legal move moves the ring from start to
// destination and leaves a marker at start.

    it("legal move moves the ring from start to destination and leaves a marker at the start", function(){
        fc.assert(fc.property(
            fc.constantFrom(...yinsh.valid_co_ordinates),
            function(position) {
                 const new_position = {
                    r:position.r,
                    q:position.q+1
                };

                if (
                !yinsh.is_valid_co_ordinate(new_position)) {
                    return;
                }

                const key_position = yinsh.position_to_key(position);
                const key_new_position = yinsh.position_to_key(new_position);
                const active_state = {
                    phase: "active",
                    current_player: "white",
                    board: {
                        rings: {
                            [key_position]: "white"
                        },
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
   
                const moved_state = yinsh.move_ring(active_state, position, new_position);

                if (moved_state.board.rings[key_new_position]
                    !== active_state.current_player
                    || moved_state.board.markers[key_position]
                    !== active_state.current_player) {
                    throw new Error("Expected the current player's marker at "
                        + "start position and their ring at the destination");
                }
            }
        ));
    });

    // - legal move with markers flips exactly the markers on the path.

    it("A legal move only flips the markers on its path", function(){
        fc.assert(fc.property(
            fc.constantFrom(...yinsh.valid_co_ordinates),
            function(position) {
                 const new_position = {
                    r:position.r,
                    q:position.q+3
                };

                const inter_position_1 = {
                    r:position.r,
                    q:position.q+1
                };

                const inter_position_2 = {
                    r:position.r,
                    q:position.q+2
                };

                if (
                    !yinsh.is_valid_co_ordinate(new_position)) {
                    return;
                }
                const position_key =
                 yinsh.position_to_key(position);
                const inter_position_1_key =
                 yinsh.position_to_key(inter_position_1);
                const inter_position_2_key =
                 yinsh.position_to_key(inter_position_2);

                const state = {
                    phase: "active",
                    current_player: "white",
                    board: {
                        rings: {
                            [position_key]: "white"
                        },
                        markers: {
                            [inter_position_1_key]: "white",
                            [inter_position_2_key]: "white"
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


                const moved_state = yinsh.move_ring(
                    state, position, new_position
                );
                const is_flipped_1 =
                 moved_state.board.markers[inter_position_1_key] !== "black";
                const is_flipped_2 =
                 moved_state.board.markers[inter_position_2_key] !== "black";

                if (is_flipped_1 || is_flipped_2) {
                    throw new Error(
                        "Expected all markers between the" +
                         "start and end position to be flipped"
                    );
                }
            }
        ));
    });
    // - moving ring to an occupied space is rejected
    it("Moving a ring to a marker-occupied space is rejected", function(){
        fc.assert(fc.property(
            fc.constantFrom(...yinsh.valid_co_ordinates),
            function(position) {

                const inter_position_1 = {
                    r:position.r,
                    q:position.q+1
                };

                const new_position = {
                    r:position.r,
                    q:position.q+2
                };

                if (
                    !yinsh.is_valid_co_ordinate(new_position)) {
                    return;
                }
                const position_key =
                 yinsh.position_to_key(position);
                const inter_position_1_key =
                 yinsh.position_to_key(inter_position_1);
                const new_position_key =
                 yinsh.position_to_key(new_position);


                const empty_state = {
                    phase: "active",
                    current_player: "white",
                    board: {rings: {[position_key]: "white"}, markers: {}},
                    rings_to_place: {white: 0, black: 0},
                    rings_removed: {white: 0, black: 0},
                    winner: undefined
                };
                if (yinsh.move_ring(empty_state, position, inter_position_1) === undefined) {
                    throw new Error("Expected move to empty space to work");
                    }

                const state = {
                    phase: "active",
                    current_player: "white",
                    board: {
                        rings: {
                            [position_key]: "white"
                        },
                        markers: {
                            [inter_position_1_key]: "white",
                            [new_position_key]: "white"
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


                const moved_state = yinsh.move_ring(
                    state, position, new_position
                );

                

                if (moved_state !== undefined) {
                    throw new Error(
                        "Expected undefined, can't move a ring"
                        + "to a marker-occupied position"
                    );
                }
            }
        ));
    });


    // - moving ring to an occupied space is rejected
    it("Moving a ring to a ring-occupied space is also rejected", function(){
        fc.assert(fc.property(
            fc.constantFrom(...yinsh.valid_co_ordinates),
            function(position) {

                const inter_position_1 = {
                    r:position.r,
                    q:position.q+1
                };

                const new_position = {
                    r:position.r,
                    q:position.q+2
                };

                if (
                    !yinsh.is_valid_co_ordinate(new_position)) {
                    return;
                }
                const position_key =
                 yinsh.position_to_key(position);
                const inter_position_1_key =
                 yinsh.position_to_key(inter_position_1);
                const new_position_key =
                 yinsh.position_to_key(new_position);
                const empty_state = {
                    phase: "active",
                    current_player: "white",
                    board: {rings: {[position_key]: "white"}, markers: {}},
                    rings_to_place: {white: 0, black: 0},
                    rings_removed: {white: 0, black: 0},
                    winner: undefined
                };
                if (yinsh.move_ring(empty_state, position, inter_position_1) === undefined) {
                    throw new Error("Expected move to empty space to work");
}
                const state = {
                    phase: "active",
                    current_player: "white",
                    board: {
                        rings: {
                            [position_key]: "white",
                            [new_position_key]: "white"
                        },
                        markers: {
                            [inter_position_1_key]: "white",
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


                const moved_state = yinsh.move_ring(
                    state, position, new_position
                );

                if (moved_state !== undefined) {
                    throw new Error(
                        "Expected undefined, can't move a ring"
                        + "to a ring-occupied position"
                    );
                }
            }
        ));
    });

    // - can only move ring across 1 set of consecutive markers, 
    // it must be placed at the next empty space
     it("Can only move a ring across markers not empty spaces", function(){
        fc.assert(fc.property(
            fc.constantFrom(...yinsh.valid_co_ordinates),
            function(position) {

                const inter_position_1 = {
                    r:position.r,
                    q:position.q+1
                };

                const inter_position_2 = {
                    r:position.r,
                    q:position.q+3
                };

                const new_position = {
                    r:position.r,
                    q:position.q+4
                };

                if (
                    !yinsh.is_valid_co_ordinate(new_position)) {
                    return;
                }
                const position_key =
                 yinsh.position_to_key(position);
                const inter_position_1_key =
                 yinsh.position_to_key(inter_position_1);
                const inter_position_2_key =
                 yinsh.position_to_key(inter_position_2);
                const consecutive_position_2 = {r: position.r, q: position.q + 2};
                const consecutive_key = yinsh.position_to_key(consecutive_position_2);
                const consecutive_dest = {r: position.r, q: position.q + 3};
                if (!yinsh.is_valid_co_ordinate(consecutive_dest)) {
                    return;
                }
                const consecutive_state = {
                    phase: "active",
                    current_player: "white",
                    board: {
                        rings: {[position_key]: "white"},
                        markers: {
                            [inter_position_1_key]: "white",
                            [consecutive_key]: "white"
                        }
                    },
                    rings_to_place: {white: 0, black: 0},
                    rings_removed: {white: 0, black: 0},
                    winner: undefined
                };
                if (yinsh.move_ring(consecutive_state, position,
                    consecutive_dest) === undefined) {
                    throw new Error("Expected move over consecutive markers to work");
                }
                const state = {
                    phase: "active",
                    current_player: "white",
                    board: {
                        rings: {
                            [position_key]: "white",
                        },
                        markers: {
                            [inter_position_1_key]: "white",
                            [inter_position_2_key]: "white"
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


                const moved_state = yinsh.move_ring(
                    state, position, new_position
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

    // - total number of rings stays the same after a legal move.
   it("The total number of rings stays the same after a legal move", function(){
        fc.assert(fc.property(
            fc.constantFrom(...yinsh.valid_co_ordinates),
            function(position) {

                const new_position = {
                    r:position.r,
                    q:position.q+1
                };

                if (
                    !yinsh.is_valid_co_ordinate(new_position)) {
                    return;
                }
                const position_key =
                 yinsh.position_to_key(position);


                const state = {
                    phase: "active",
                    current_player: "white",
                    board: {
                        rings: {
                            [position_key]: "white",
                        },
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


                const moved_state = yinsh.move_ring(
                    state, position, new_position
                );

                if (Object.keys(moved_state.board.rings).length !==
                 Object.keys(state.board.rings).length)  {
                    throw new Error(
                        "Expected number of rings to stay the same" +
                        "as no lines of 5 created"
                    );
                }
            }
        ));
    });

    // - moving opponent's ring is rejected.
   it("Moving an opponent's ring is rejected", function(){
        fc.assert(fc.property(
            fc.constantFrom(...yinsh.valid_co_ordinates),
            function(position) {

                const new_position = {
                    r:position.r,
                    q:position.q+1
                };

                if (
                    !yinsh.is_valid_co_ordinate(new_position)) {
                    return;
                }
                const position_key =
                 yinsh.position_to_key(position);

                const own_ring_state = {
                    phase: "active",
                    current_player: "white",
                    board: {rings: {[position_key]: "white"}, markers: {}},
                    rings_to_place: {white: 0, black: 0},
                    rings_removed: {white: 0, black: 0},
                    winner: undefined
                };
                if (yinsh.move_ring(own_ring_state, position, new_position) === undefined) {
                    throw new Error("Expected moving own ring to work");
                }
                                const state = {
                    phase: "active",
                    current_player: "white",
                    board: {
                        rings: {
                            [position_key]: "black",
                        },
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


                const moved_state = yinsh.move_ring(
                    state, position, new_position
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


// - successful movement does not mutate the original state.

});




//Lines of Five:

describe ("yinsh.lines_of_five", function() {


    // - every returned line has exactly 5 coordinates.

    it("every returned line has exactly 5 co-ordinates", function(){
        fc.assert(fc.property(
            fc.constantFrom(...yinsh.valid_co_ordinates),
            function(position) {

                const p1 = {
                    r:position.r,
                    q:position.q+1
                };
                const p2 = {
                    r:position.r,
                    q:position.q+2
                };
                const p3 = {
                    r:position.r,
                    q:position.q+3
                };
                const p4 = {
                    r:position.r,
                    q:position.q+4
                };
                 const p5 = {
                    r:position.r+1,
                    q:position.q
                };


                if (
                    !yinsh.is_valid_co_ordinate(p4)) {
                    return;
                }
                const p1_key =
                 yinsh.position_to_key(p1);
                 const p2_key =
                 yinsh.position_to_key(p2);
                 const p3_key =
                 yinsh.position_to_key(p3);
                 const p4_key =
                 yinsh.position_to_key(p4);
                 const p5_key =
                 yinsh.position_to_key(p5);
                 const position_key =
                 yinsh.position_to_key(position);
                 
                 


                const state = {
                    phase: "active",
                    current_player: "white",
                    board: {
                        rings: {
                            [position_key]: "black",
                        },
                        markers: {
                            [p1_key]:"white",
                            [p2_key]:"white",
                            [p3_key]: "white",
                            [p4_key]: "white",
                            [p5_key]: "white",
                            [position_key]: "white"

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

               if (!yinsh.lines_of_five(state).every(line => line.line.length === 5)){
                    throw new Error(
                        "Expected only 5 co-ordinates"
                    );
               }
            }
        ));
    });

    it("if no line of 5 then return undefined", function() {
        fc.assert(fc.property(
            fc.constantFrom(...yinsh.valid_co_ordinates),
            function(position) {



                if (
                    !yinsh.is_valid_co_ordinate(position)) {
                    return;
                }

                const p1 = {r: position.r, q: position.q + 1};
                const p2 = {r: position.r, q: position.q + 2};
                const p3 = {r: position.r, q: position.q + 3};
                const p4 = {r: position.r, q: position.q + 4};
                if (yinsh.is_valid_co_ordinate(p4)) {
                    const line_state = {
                        phase: "active",
                        current_player: "white",
                        board: {
                            rings: {},
                            markers: {
                                [yinsh.position_to_key(position)]: "white",
                                [yinsh.position_to_key(p1)]: "white",
                                [yinsh.position_to_key(p2)]: "white",
                                [yinsh.position_to_key(p3)]: "white",
                                [yinsh.position_to_key(p4)]: "white"
                            }
                        },
                        rings_to_place: {white: 0, black: 0},
                        rings_removed: {white: 0, black: 0},
                        winner: undefined
                    };
                    if (yinsh.lines_of_five(line_state) === undefined) {
                        throw new Error("Expected lines_of_five to find a line");
                    }
                }
                const state = {
                    phase: "active",
                    current_player: "white",
                    board: {
                        rings: {
                        },
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

                if (yinsh.lines_of_five(state) !== undefined) {
                    throw new Error(
                        "Expected a state with no lines of 5 to return undefined"
                    );
                }
            }
        ));
    });


});



// Winner:
// - player with 3 removed rings is returned.

describe("yinsh.remove_markers()", function () {
    it("all markers in the line of five are removed from the board", function () {
        fc.assert(fc.property(
            fc.constantFrom(...yinsh.valid_co_ordinates),
            function (position) {
                const p1 = {r: position.r, q: position.q + 1};
                const p2 = {r: position.r, q: position.q + 2};
                const p3 = {r: position.r, q: position.q + 3};
                const p4 = {r: position.r, q: position.q + 4};

                if (!yinsh.is_valid_co_ordinate(p4)) {
                    return;
                }

                const position_key = yinsh.position_to_key(position);
                const p1_key = yinsh.position_to_key(p1);
                const p2_key = yinsh.position_to_key(p2);
                const p3_key = yinsh.position_to_key(p3);
                const p4_key = yinsh.position_to_key(p4);

                const state = {
                    phase: "active",
                    current_player: "white",
                    board: {
                        rings: {},
                        markers: {
                            [position_key]: "white",
                            [p1_key]: "white",
                            [p2_key]: "white",
                            [p3_key]: "white",
                            [p4_key]: "white"
                        }
                    },
                    rings_to_place: {white: 0, black: 0},
                    rings_removed: {white: 0, black: 0},
                    winner: undefined
                };

                const lines_of_five = yinsh.lines_of_five(state);
                const new_state = yinsh.remove_markers(state, lines_of_five);

                const line_positions = lines_of_five[0].line;
                if (line_positions.some(function (co_ord) {
                    const key = yinsh.position_to_key(co_ord);
                    return new_state.board.markers[key] !== undefined;
                })) {
                    throw new Error(
                        "Expected all markers in the line to be removed"
                    );
                }
            }
        ));
    });

    // - if both players have fewer than 3 removed rings, winner returns undefined.

    it(" if both players have fewer than 3 removed rings, winner returns undefined", function(){
        fc.assert(fc.property(
            fc.constantFrom(...yinsh.valid_co_ordinates),
            function(position) {

                if (
                    !yinsh.is_valid_co_ordinate(position)) {
                    return;
                }

                const state = {
                    phase: "active",
                    current_player: "white",
                    board: {
                        rings: {
                        },
                        markers: {

                        }
                    },
                    rings_to_place: {
                        white: 0,
                        black: 0
                    },
                    rings_removed: {
                        white: 2,
                        black: 1
                    },
                    winner: undefined
                };

                
                const win_check = yinsh.winner(state)
                const win_state = {
                    phase: "active",
                    current_player: "white",
                    board: {rings: {}, markers: {}},
                    rings_to_place: {white: 0, black: 0},
                    rings_removed: {white: 3, black: 0},
                    winner: undefined
                };
                if (yinsh.winner(win_state) === undefined) {
                    throw new Error("Expected winner to be returned when 3 rings removed");
}
                if (win_check !== undefined) {
                    throw new Error(
                        "Expected no winner"
                    );
                }
            }
        ));
    });

 it("all markers input to the function are removed", function(){
        fc.assert(fc.property(
            fc.constantFrom(...yinsh.valid_co_ordinates),
           function(position) {

                const p1 = {
                    r:position.r,
                    q:position.q+1
                };
                const p2 = {
                    r:position.r,
                    q:position.q+2
                };
                const p3 = {
                    r:position.r,
                    q:position.q+3
                };
                const p4 = {
                    r:position.r,
                    q:position.q+4
                };


                if (
                    !yinsh.is_valid_co_ordinate(p4)) {
                    return;
                }
                const p1_key =
                 yinsh.position_to_key(p1);
                 const p2_key =
                 yinsh.position_to_key(p2);
                 const p3_key =
                 yinsh.position_to_key(p3);
                 const p4_key =
                 yinsh.position_to_key(p4);
        
                 const position_key =
                 yinsh.position_to_key(position);


                const state = {
                    phase: "active",
                    current_player: "white",
                    board: {
                        rings: {

                        },
                        markers: {
                            [position_key]:"white",
                            [p1_key]:"white",
                            [p2_key]: "white",
                            [p3_key]: "white",
                            [p4_key]: "white",
                    
                        }
                    },
                    rings_to_place: {
                        white: 0,
                        black: 0
                    },
                    rings_removed: {
                        white: 2,
                        black: 0
                    },
                    winner: undefined
                };


                const line_of_five = yinsh.lines_of_five(state);
                
                const removed_marker_state = yinsh.remove_markers(state, line_of_five);
                const new_markers = removed_marker_state.board.markers;
                const line_positions = line_of_five[0].line;
                if (line_positions.some(function (co_ord) {
                    const key = yinsh.position_to_key(co_ord);
                    return new_markers[key] !== undefined;
                })) {
                    throw new Error(
                        "Expected no markers in line of 5 to still be on the board"
                    );
                }
            }
        ));
    });
});














