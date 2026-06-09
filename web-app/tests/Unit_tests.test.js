import { move, remove } from "ramda";
import Yinsh from "../yinsh.js";
import fc from "fast-check";

// Unit Tests
// Using a test driven developement approach
// Tests are property based as opposed to example based

/*
Property Based Testing Notes:

Generative testing - instruct computer to generate examples
as opposed to writing by hand

Property - should always be true (law/rule) no matter the data

Use fast check, fc.record() to specify keys to generate, fc.string(),.date.nat. etc to generate, fc.array to generate array.
Fast check is biased as edge cases tend to cause bugs so is biased towards small values, e.g. 0, [], undefined empty strings etc

Reccomended Test Structure for Property Based Tests:
GIVEN ANY <arbitrary inputs, conforming to certain restrictions>
WHEN <we call some function or take some action>
THEN <some condition SHOULD ALWAYS hold>

E.g. checking that total number of tasks stay the same

given any valid task state and date
when we run moveOldTaskToArchive()
THEN the total number of tasks SHOULD ALWAYS stay the same
*/
//GIVEN a randomly generated valid game state (produced by actually playing moves)
//WHEN we call some function
//THEN some property ALWAYS holds

// Random setup board state generation
// const validSetupState = fc
//   .shuffledSubarray(Yinsh.valid_co_ordinates, {
//     minLength: 10,
//     maxLength: 10
//   })
//   .map(function(ring_positions) {
//     return ring_positions.reduce(
//       function(state, position) {
//         if (state === undefined) {
//           return undefined;
//         }
//         return Yinsh.place_ring(state, position);
//       },
//       Yinsh.initial_state()
//     );
//   })
//   .filter(function(state) {
//     return state !== undefined && state.phase === "active";
//   });

// Valid game moves
// Valid moves given a setup state


// check rings that can be moved based on player turn

// iterate through the rings that can moved for the players turn

// append to list movees that don't return undefined










// ----Board & Setup----

// Initial State:

const throw_if_initial_state_invalid = function (state) {

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
};



describe("Yinsh.initial_state()", function () {
    it("creates a setup state with an empty board", function () {
        throw_if_initial_state_invalid(Yinsh.initial_state());
    });
});



// Place Rings:
// - valid empty coordinate places the current player's ring

//GIVEN any coordinate chosen from the valid board coordinates
//AND an initial setup state with no rings placed
//WHEN place_ring is called with that coordinate
//THEN the current player's ring should be placed at that coordinate

describe("Yinsh.place_ring()", function() {
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
        ),  { verbose: 2 });
    });

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


    

    // - occupied coordinate is rejected.
        it("valid occupied co ordinate does not place a ring", function(){
            fc.assert(fc.property(
                fc.constantFrom(...Yinsh.valid_co_ordinates),
                function(position) {
                    const state = Yinsh.initial_state();

                    const occupied_state = Yinsh.place_ring(state, position);
                    const rejected_state = Yinsh.place_ring(occupied_state, position);

                    if (rejected_state !== undefined){
                        throw new Error(
                            "Expected placement on occupied coordinate to be rejected."
                        );
                    }
                }
            ));
        });


// - non-setup phase placement is rejected.

        it("Rings can't be placed in the non-setup phase", function(){
            fc.assert(fc.property(
                fc.constantFrom(...Yinsh.valid_co_ordinates),
                function(position) {
                    const state = Yinsh.initial_state();
                    state.phase = "active";
                    const place_ring_non_setup = Yinsh.place_ring(state, position);

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
                fc.shuffledSubarray(Yinsh.valid_co_ordinates, {
                    minLength: 10,
                    maxLength: 10
                    }),
                function(ring_positions) {

                    const final_state = ring_positions.reduce(
                        function(state, position) {
                             if (state === undefined) {
                                 return undefined;
                             }
                            return Yinsh.place_ring(state, position);
                        },
                        Yinsh.initial_state()
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
                fc.constantFrom(...Yinsh.valid_co_ordinates),
                function(position) {
                    const state = Yinsh.initial_state();
                    const state_before_json = JSON.stringify(state);

                    Yinsh.place_ring(state, position);

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


describe("Yinsh.move_ring()", function() {
    // -----legality------
it("Turn alternates when player successfuly moves ring", function(){
        fc.assert(fc.property(
            fc.constantFrom(...Yinsh.valid_co_ordinates),
            function(position) {
                 const new_position = {
                    r:position.r+1,
                    q:position.q
                };

                if (!Yinsh.is_valid_co_ordinate(new_position)) {
                    return;
                }

                const position_key = Yinsh.position_to_key(position);

                const state = {
                    phase: "active",
                    current_player: "white",
                    valid_coordinates: Yinsh.valid_co_ordinates,
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
                const moved_state = Yinsh.move_ring(state, position, new_position);
                if (moved_state.current_player !== "black") {
                    throw new Error("Expected turn to alternate"
                        + "after successful marker movement");
                }
            }
        ));
    });

    it("Moving during setup phase is rejected", function(){
        fc.assert(fc.property(
            fc.constantFrom(...Yinsh.valid_co_ordinates),
            function(position) {
                 const new_position = {
                    r:position.r+1,
                    q:position.q
                };

                if (!Yinsh.is_valid_co_ordinate(new_position)) {
                    return;
                }

                const position_key = Yinsh.position_to_key(position);

                const state = {
                    phase: "setup",
                    current_player: "white",
                    valid_coordinates: Yinsh.valid_co_ordinates,
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
                const moved_state = Yinsh.move_ring(state, position, new_position);
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
            fc.constantFrom(...Yinsh.valid_co_ordinates),
            function(position) {
                 const new_position = {
                    r:position.r+1,
                    q:position.q+1
                };

                if (!Yinsh.is_valid_co_ordinate(new_position)) {
                    return;
                }

                const position_key = Yinsh.position_to_key(position);
                 const state = {
                    phase: "active",
                    current_player: "white",
                    valid_coordinates: Yinsh.valid_co_ordinates,
                    board: {
                        rings: {
                            [position_key]: "white"
                        },
                        markers: {
                        }
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
                const moved_state = Yinsh.move_ring(state, position, new_position)
                if (moved_state !== undefined) {
                    throw new Error("Expected non-straight line ring"
                        + "movement to be rejected");
                }
            }
        ));
    });

// - legal move moves the ring from start to
// destination and leaves a marker at start.

    it("legal move moves the ring from start to destination and leaves a marker at the start", function(){
        fc.assert(fc.property(
            fc.constantFrom(...Yinsh.valid_co_ordinates),
            function(position) {
                 const new_position = {
                    r:position.r,
                    q:position.q+1
                };

                if (
                !Yinsh.is_valid_co_ordinate(new_position)) {
                    return;
                }

                const key_position = Yinsh.position_to_key(position);
                const key_new_position = Yinsh.position_to_key(new_position);
                const active_state = {
                    phase: "active",
                    current_player: "white",
                    valid_coordinates: Yinsh.valid_co_ordinates,
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
   
                const moved_state = Yinsh.move_ring(active_state, position, new_position);

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
            fc.constantFrom(...Yinsh.valid_co_ordinates),
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
                    !Yinsh.is_valid_co_ordinate(new_position)) {
                    return;
                }
                const position_key =
                 Yinsh.position_to_key(position);
                const inter_position_1_key =
                 Yinsh.position_to_key(inter_position_1);
                const inter_position_2_key =
                 Yinsh.position_to_key(inter_position_2);

                const state = {
                    phase: "active",
                    current_player: "white",
                    valid_coordinates: Yinsh.valid_co_ordinates,
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


                const moved_state = Yinsh.move_ring(
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
            fc.constantFrom(...Yinsh.valid_co_ordinates),
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
                    !Yinsh.is_valid_co_ordinate(new_position)) {
                    return;
                }
                const position_key =
                 Yinsh.position_to_key(position);
                const inter_position_1_key =
                 Yinsh.position_to_key(inter_position_1);
                const new_position_key =
                 Yinsh.position_to_key(new_position);

                const state = {
                    phase: "active",
                    current_player: "white",
                    valid_coordinates: Yinsh.valid_co_ordinates,
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


                const moved_state = Yinsh.move_ring(
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
            fc.constantFrom(...Yinsh.valid_co_ordinates),
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
                    !Yinsh.is_valid_co_ordinate(new_position)) {
                    return;
                }
                const position_key =
                 Yinsh.position_to_key(position);
                const inter_position_1_key =
                 Yinsh.position_to_key(inter_position_1);
                const new_position_key =
                 Yinsh.position_to_key(new_position);

                const state = {
                    phase: "active",
                    current_player: "white",
                    valid_coordinates: Yinsh.valid_co_ordinates,
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


                const moved_state = Yinsh.move_ring(
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
            fc.constantFrom(...Yinsh.valid_co_ordinates),
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
                    !Yinsh.is_valid_co_ordinate(new_position)) {
                    return;
                }
                const position_key =
                 Yinsh.position_to_key(position);
                const inter_position_1_key =
                 Yinsh.position_to_key(inter_position_1);
                const inter_position_2_key =
                 Yinsh.position_to_key(inter_position_2);

                const state = {
                    phase: "active",
                    current_player: "white",
                    valid_coordinates: Yinsh.valid_co_ordinates,
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


                const moved_state = Yinsh.move_ring(
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
            fc.constantFrom(...Yinsh.valid_co_ordinates),
            function(position) {

                const new_position = {
                    r:position.r,
                    q:position.q+1
                };

                if (
                    !Yinsh.is_valid_co_ordinate(new_position)) {
                    return;
                }
                const position_key =
                 Yinsh.position_to_key(position);


                const state = {
                    phase: "active",
                    current_player: "white",
                    valid_coordinates: Yinsh.valid_co_ordinates,
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


                const moved_state = Yinsh.move_ring(
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
            fc.constantFrom(...Yinsh.valid_co_ordinates),
            function(position) {

                const new_position = {
                    r:position.r,
                    q:position.q+1
                };

                if (
                    !Yinsh.is_valid_co_ordinate(new_position)) {
                    return;
                }
                const position_key =
                 Yinsh.position_to_key(position);


                const state = {
                    phase: "active",
                    current_player: "white",
                    valid_coordinates: Yinsh.valid_co_ordinates,
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


                const moved_state = Yinsh.move_ring(
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

describe ("Yinsh.lines_of_five", function() {
//- known generated line is returned.
 it("the co-ordinates of a line of 5 is returned", function() {
        fc.assert(fc.property(
            fc.constantFrom(...Yinsh.valid_co_ordinates),
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
                    !Yinsh.is_valid_co_ordinate(p4)) {
                    return;
                }
                const p1_key =
                 Yinsh.position_to_key(p1);
                 const p2_key =
                 Yinsh.position_to_key(p2);
                 const p3_key =
                 Yinsh.position_to_key(p3);
                 const p4_key =
                 Yinsh.position_to_key(p4);
                 const p5_key =
                 Yinsh.position_to_key(p5);
                 const position_key =
                 Yinsh.position_to_key(position);

                const state = {
                    phase: "active",
                    current_player: "white",
                    valid_coordinates: Yinsh.valid_co_ordinates,
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

                if (!R.equals(Yinsh.lines_of_five(state),
                            [p1,p2,p3,p4,position]
                        )) {
                    throw new Error(
                        "Expected all the co-ordinates in the lines of 5"
                    );
                }
            }
        ));
    });

    // - every returned line has exactly 5 coordinates.

    it("every returned line has exactly 5 co-ordinates", function(){
        fc.assert(fc.property(
            fc.constantFrom(...Yinsh.valid_co_ordinates),
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
                    !Yinsh.is_valid_co_ordinate(p4)) {
                    return;
                }
                const p1_key =
                 Yinsh.position_to_key(p1);
                 const p2_key =
                 Yinsh.position_to_key(p2);
                 const p3_key =
                 Yinsh.position_to_key(p3);
                 const p4_key =
                 Yinsh.position_to_key(p4);
                 const p5_key =
                 Yinsh.position_to_key(p5);
                 const position_key =
                 Yinsh.position_to_key(position);
                 
                 


                const state = {
                    phase: "active",
                    current_player: "white",
                    valid_coordinates: Yinsh.valid_co_ordinates,
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

               if (!Yinsh.lines_of_five(state).every(line => line.length === 5)){
                    throw new Error(
                        "Expected only 5 co-ordinates"
                    );
               }
            }
        ));
    });

    it("if no line of 5 then return undefined", function() {
        fc.assert(fc.property(
            fc.constantFrom(...Yinsh.valid_co_ordinates),
            function(position) {



                if (
                    !Yinsh.is_valid_co_ordinate(position)) {
                    return;
                }


                const state = {
                    phase: "active",
                    current_player: "white",
                    valid_coordinates: Yinsh.valid_co_ordinates,
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

                if (Yinsh.lines_of_five(state) !== undefined) {
                    throw new Error(
                        "Expected a state with no lines of 5 to return undefined"
                    );
                }
            }
        ));
    });


});


    // Remove Ring:
// - rings_removed for that player increases by 1
// - other rings do not change.
// - original state is not mutated.
// - invalid ring removal returns undefined




describe("Yinsh.remove_ring()", function() {
    it("rings removed increases by 1 for the player whose tile is being removed", function(){
        fc.assert(fc.property(
            fc.constantFrom(...Yinsh.valid_co_ordinates),
            function(position) {

                if (
                    !Yinsh.is_valid_co_ordinate(position)) {
                    return;
                }

                 const position_key =
                 Yinsh.position_to_key(position);
                 
                 


                const state = {
                    phase: "active",
                    current_player: "white",
                    valid_coordinates: Yinsh.valid_co_ordinates,
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

                const removed_state = Yinsh.remove_ring(state, position)

                if (removed_state.rings_removed.black !== 1) {
                    throw new Error(
                        "Expected rings removed counter to be incremented"
                    );
                }
            }
        ));
    });


    it("the removed ring is no longer in the placed rings object", function(){
        fc.assert(fc.property(
            fc.constantFrom(...Yinsh.valid_co_ordinates),
            function(position) {

                if (
                    !Yinsh.is_valid_co_ordinate(position)) {
                    return;
                }

                 const position_key =
                 Yinsh.position_to_key(position);
                 
                 


                const state = {
                    phase: "active",
                    current_player: "white",
                    valid_coordinates: Yinsh.valid_co_ordinates,
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

                const removed_state = Yinsh.remove_ring(state, position)

                if (removed_state.board.rings[position_key] !== undefined) {
                    throw new Error(
                        "Expected the removed ring to not be on the board"
                    );
                }
            }
        ));
    });
})



// Winner:
// - player with 3 removed rings is returned.

describe ("Yinsh.winner()", function() {
 it("player with 3 removed rings is returned", function(){
        fc.assert(fc.property(
            fc.constantFrom(...Yinsh.valid_co_ordinates),
            function(position) {

                if (
                    !Yinsh.is_valid_co_ordinate(position)) {
                    return;
                }
                  const position_key =
                 Yinsh.position_to_key(position);


                const state = {
                    phase: "active",
                    current_player: "white",
                    valid_coordinates: Yinsh.valid_co_ordinates,
                    board: {
                        rings: {
                            [position_key]:"white"
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
                        black: 0
                    },
                    winner: undefined
                };

                
                const win_state = Yinsh.remove_ring(state,position)
                const win_check = Yinsh.winner(win_state)

                if (win_check.winner !== "white") {
                    throw new Error(
                        "Expected the winner to be returned"
                    );
                }
            }
        ));
    });
    // - if both players have fewer than 3 removed rings, winner returns undefined.

    it(" if both players have fewer than 3 removed rings, winner returns undefined", function(){
        fc.assert(fc.property(
            fc.constantFrom(...Yinsh.valid_co_ordinates),
            function(position) {

                if (
                    !Yinsh.is_valid_co_ordinate(position)) {
                    return;
                }

                const state = {
                    phase: "active",
                    current_player: "white",
                    valid_coordinates: Yinsh.valid_co_ordinates,
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

                
                const win_check = Yinsh.winner(state)

                if (win_check.winner !== undefined) {
                    throw new Error(
                        "Expected no winner"
                    );
                }
            }
        ));
    });
})




describe ("Yinsh.remove_markers()", function() {
 it("all markers input to the function are removed", function(){
        fc.assert(fc.property(
            fc.constantFrom(...Yinsh.valid_co_ordinates),
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
                    !Yinsh.is_valid_co_ordinate(p5)) {
                    return;
                }
                const p1_key =
                 Yinsh.position_to_key(p1);
                 const p2_key =
                 Yinsh.position_to_key(p2);
                 const p3_key =
                 Yinsh.position_to_key(p3);
                 const p4_key =
                 Yinsh.position_to_key(p4);
                 const p5_key =
                 Yinsh.position_to_key(p5);
                 const position_key =
                 Yinsh.position_to_key(position);


                const state = {
                    phase: "active",
                    current_player: "white",
                    valid_coordinates: Yinsh.valid_co_ordinates,
                    board: {
                        rings: {

                        },
                        markers: {
                            [position_key]:"white",
                            [p1_key]:"white",
                            [p2_key]: "white",
                            [p3_key]: "white",
                            [p4_key]: "white",
                            [p5_key]: "white"
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


                const line_of_five = Yinsh.lines_of_five(state)
                
                const removed_marker_state = Yinsh.remove_markers(state,line_of_five)
                const new_markers = removed_marker_state.board.markers

                if (Object.entries(line_of_five).some(function([k, v]) {
                        return new_markers[k] === v;
                        })) {
                    throw new Error(
                        "Expected no markers in line of 5 to still be on the board"
                    );
                }
            }
        ));
    });
   
})
















