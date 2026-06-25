import Yinsh from "./yinsh.js";
import R from "./ramda.js";

const Yinsh_Engine = Object.create(null);
// move scoring

Yinsh_Engine.make_best_move = function (state, depth) {
    // for now assume are black
    const current_player = state.current_player;
    const current_enemy = (
        current_player === "white"
        ? "black"
        : "white"
    );

    const all_rings = state.board.rings;


    const black_ring_keys = Object.keys(all_rings).filter(
        function (key) {
            return all_rings[key] === current_player;
        }
    );
    const black_ring_positions = Yinsh.keys_to_positions(black_ring_keys);

    // iterate through each black ring
    const best_moves = [];
    black_ring_positions.forEach(function (position) {
        //    const possible moves for a ring
        const possible_moves = Yinsh.valid_co_ordinates.filter(
            function (coord) {
                return Yinsh.valid_move(state, position, coord) === true;
            }
        );

        const moves_and_score = [];
        let best_score_so_far = -Infinity;

        possible_moves.forEach(function (potential_next_position) {
            // scoring each move for each ring
            const possible_state = Yinsh.move_ring(
                state,
                position,
                potential_next_position
            );

            // how many black markers created?
            const old_all_markers = state.board.markers;
            const new_all_markers = possible_state.board.markers;
            const old_no_black_markers = R.count(
                R.equals(current_player),
                Object.values(old_all_markers)
            );
            const new_no_black_markers = R.count(
                R.equals(current_player),
                Object.values(new_all_markers)
            );
            const net_black_marker_gain = (
                new_no_black_markers - old_no_black_markers
            );

            // how many white markers created?
            const old_no_white_markers = R.count(
                R.equals(current_enemy),
                Object.values(old_all_markers)
            );
            const new_no_white_markers = R.count(
                R.equals(current_enemy),
                Object.values(new_all_markers)
            );
            const net_white_marker_gain = (
                new_no_white_markers - old_no_white_markers
            );

            // does it get a 5 in a row?
            const old_rings_removed = state.rings_removed[current_player];
            const new_rings_removed = (
                possible_state.rings_removed[current_player]
            );
            const is_line_of_five = new_rings_removed > old_rings_removed;

            // does it give enemy 5 in a row
            const old_enemy_rings_removed = (
                state.rings_removed[current_enemy]
            );
            const new_enemy_rings_removed = (
                possible_state.rings_removed[current_enemy]
            );
            const is_enemy_line_of_five = (
                new_enemy_rings_removed > old_enemy_rings_removed
            );

            // does it win?
            const is_win = possible_state.winner === current_player;

            // calculating move_score
            const line_of_five_weighting = 300;
            const enemy_live_of_five_weighting = -500;
            const win_weighting = 100000; // always goes for the win
            const marker_gain_weighting = 3;
            const immediate_score = (
                (net_black_marker_gain - net_white_marker_gain)
                * marker_gain_weighting
                + is_line_of_five * line_of_five_weighting
                + is_enemy_line_of_five * enemy_live_of_five_weighting
                + is_win * win_weighting
            );

            const future_score = (
                (depth > 0 && possible_state.winner === undefined)
                ? -Yinsh_Engine.make_best_move(
                    possible_state,
                    depth - 1
                ).score
                : 0
            );
            const move_score = immediate_score + future_score;

            if (move_score > best_score_so_far) {
                best_score_so_far = move_score;
            }

            // log move and score
            const potential_next_key = Yinsh.position_to_key(
                potential_next_position
            );
            const entry = Object.create(null);
            entry[potential_next_key] = move_score;
            moves_and_score.push(entry);
        });

        // find best move for a given ring
        const max_score = Math.max(
            ...R.chain(Object.values, moves_and_score)
        );

        const best_move_per_ring = moves_and_score.find(function (object) {
            return Object.values(object)[0] === max_score;
        });

        best_moves.push({
            ring: position,
            best_move: best_move_per_ring,
            score: max_score
        });
    });

    const best_move = best_moves.reduce(function (acc, object) {
        if (object.score > acc.score) {
            return object;
        }
        return acc;
    });

    const best_move_key = Object.keys(best_move.best_move)[0];
    const parts = best_move_key.split(",");
    const best_move_position = {r: Number(parts[0]), q: Number(parts[1])};

    return {
        state: Yinsh.move_ring(state, best_move.ring, best_move_position),
        score: best_move.score
    };
};

Yinsh_Engine.distribute_rings = function (state) {
    // find all spaces that are free to provide a list of options to choose from
    const free_spaces = Yinsh.valid_co_ordinates.filter(function (co_ord) {
        const is_placed = Object.keys(state.board.rings).some(
            function (key) {
                return key === Yinsh.position_to_key(co_ord);
            }
        );
        return !is_placed;
    });

    // implement a rule where each ring at least 1 away from every other ring
    const isolated_spaces = free_spaces.filter(function (free_space) {
        const surrounding_spaces = [
            {r: free_space.r + 1, q: free_space.q},
            {r: free_space.r - 1, q: free_space.q},
            {r: free_space.r, q: free_space.q + 1},
            {r: free_space.r, q: free_space.q - 1},
            {r: free_space.r + 1, q: free_space.q - 1},
            {r: free_space.r - 1, q: free_space.q + 1}
        ];

        const is_surrounding_area_free = !surrounding_spaces.some(
            function (space) {
                return Object.keys(state.board.rings).some(
                    function (board_ring) {
                        return Yinsh.position_to_key(space) === board_ring;
                    }
                );
            }
        );
        return is_surrounding_area_free;
    });

    const random_isolated_space = isolated_spaces[
        Math.floor(Math.random() * isolated_spaces.length)
    ];
    const new_state = Yinsh.place_ring(state, random_isolated_space);
    if (new_state !== undefined) {
        return new_state;
    }
    const random_free_space = free_spaces[
        Math.floor(Math.random() * free_spaces.length)
    ];
    console.log("couldn't satisfy rule");
    // in case can't satisfy rule
    return Yinsh.place_ring(state, random_free_space);
};

export default Object.freeze(Yinsh_Engine);