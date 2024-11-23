import { setUpPlaters, platers, sendWinner } from "./player.js";
import { menu_options, game_type_options, character_list, game_times, game_times_strs } from "./idkeys.js";
import { map_title, map_pause, map_title_bg } from "./map.js";
import { setUpGame } from "./level.js";

var scores = [];
var tied_score = [];
var greatest_score = -1;
var greatest_score_id = -1;
var winner = -1;

export function centerText(text) { // make this more general
    let w = 4;
    // let h = 5;
    let offset_x = 60 + 5;

    offset_x -= (text.length * w) / 2;

    if (text.length % 2 !== 0) {
        offset_x -= 1;
    }

    return Math.floor(offset_x);
}

export function drawRect(text, x, offset_y) {
    let w = 4;
    let h = 7;
    let rect_w = text.length * w;
    rectf(x - 1, offset_y - 1, rect_w + 1, h);
}

export function resetChoices() {
    choices[0] = 0;
}

function switchMenus(choice, options) {
    if (btnp.down || btnp.s && !btnp.w && !btnp.up) {
        choice++;
        if (choice > options.length - 1) { choice = 0; }
    }
    if (btnp.up || btnp.w && !btnp.down && !btnp.s) {
        choice--;
        if (choice < 0) { choice = options.length - 1; }
    }

    return choice;
}

function switchOptions(choice, options) {
    if (btnp.left || btnp.a && !btnp.right && !btnp.d) {
        choice--;
        if (choice < 0) { choice = options.length - 1; }
    }
    if (btnp.right || btnp.d && !btnp.left && !btnp.a) {
        choice++;
        if (choice > options.length - 1) { choice = 0; }
    }

    return choice;
}

function swapCharacters(player, choice, singleplayer, options) {
    let left = false;
    let right = false;
    let not_left = false;
    let not_right = false;

    if (singleplayer) {
        not_left = !btnp.right && !btnp.d;
        not_right = !btnp.left && !btnp.a;
        left = (btnp.a || btnp.left) && not_left;
        right = (btnp.d || btnp.right) && not_right;
    }
    else if (player == 1) {
        not_left = !btnp.left && !btnp.right && !btnp.d;
        not_right = !btnp.right && !btnp.left && !btnp.a;
        left = btnp.a;
        right = btnp.d;

        left = left && not_left;
        right = right && not_right;
    }
    else if (player == 2){
        not_left = !btnp.a && !btnp.right && !btnp.d;
        not_right = !btnp.d && !btnp.left && !btnp.a;
        left = btnp.left;
        right = btnp.right;
        left = left && not_left;
        right = right && not_right;
    }

    return loopSelection(choice, options, left, right);
}

function loopSelection(choice, options, left, right) {
    if (left) {
        choice--;
        if (choice < 0) { choice = options.length - 1; }
    }
    if (right) {
        choice++;
        if (choice > options.length - 1) { choice = 0; }
    }

    return choice;
}


let choices = {
    0: 0, // up / down
    1: 0, // left /right
    2: [0,0], // char select
    3: 0, // timer
}

let singleplater = game_type_options[choices[1]] == "Singleplayer"? true : false;

export function updateStart() {
    choices[0] = switchMenus(choices[0], menu_options);

    if (choices[0] == 0) { // GAME MODE
        choices[1] = switchOptions(choices[1], game_type_options);
    }
    if (choices[0] == 2) { // TIMER
        choices[3] = switchOptions(choices[3], game_times);
    }

    singleplater = game_type_options[choices[1]] == "Singleplayer" ? true : false;

    if (choices[0] == 1) { // CHARACTER
        choices[2][0] = swapCharacters(1, choices[2][0], singleplater, character_list);
        choices[2][1] = swapCharacters(2, choices[2][1], singleplater, character_list);
        
        if (btnp.enter) {
            if (game_type_options[choices[1]] == "Singleplayer") {
                singleplater = true;
                setUpPlaters(character_list[choices[2][0]], -1, game_type_options[choices[1]], -1);
                setUpGame(game_times[choices[3]]);
            }
            else {
                singleplater = false;
                setUpPlaters(character_list[choices[2][0]], character_list[choices[2][1]], game_type_options[choices[1]], -1);
                setUpGame(game_times[choices[3]]);
            }
            return [false, true]; // game start, and loop
        }
    }
    
    return [true, false];
}

let offsets = [];

export function calcCenterOffset() {
    // for (let i = 0; i < strings.length; i++) {
    //     offsets.push(centerText(strings[i]));
    // }

    // for (let j = 0; j < game_type_options.length; j++) {
    //     offsets.push(centerText(game_type_options[j]));
    // }

    // for (let k = 0; k < game_times.length; k++) {
    //     offsets.push(centerText(("" + game_times[k])));
    // }
}

export function drawStart() { // real messy
    cls();
    draw(map_title_bg, 0,0);
    draw(map_title,0, -10);
    
    let start_y = 100;
    let offset_y = 0;
    let h = 6;

    let top_line = start_y + (offset_y * 2);

    let choice = choices[0];
    let str = "";
    let game_choice = "";

    if (choice == 0) {
        str = menu_options[0];
        game_choice = game_type_options[choices[1]];
    }
    else if (choice == 2) {
        str = menu_options[2];
        game_choice = game_times_strs[choices[3]];
    }
    else if (choice == 1) {
        str = menu_options[1];
        game_choice = game_type_options[choices[1]];
    }

    let x = centerText(str);
    drawRectAndTextNoCenter(str, x, top_line);
    offset_y += h * 2;
    let switchable_choices_offset = start_y + offset_y;
    
    if (choice !== 1) {
        sprite(131, centerText(game_choice) - 8, switchable_choices_offset - 2, true);
        sprite(131, centerText(game_choice) + game_choice.length * 4 - 1, switchable_choices_offset - 2);
        drawRectAndText(game_choice, start_y + offset_y);
    }
    else if (choice== 1) { // CHARACTER
        let p1 = character_list[choices[2][0]];
        drawRectAndText("Press Enter To Start", start_y + offset_y);

        if (game_choice == "Singleplayer") {
            sprite(131, 53, 85, true);
            sprite(131, 69, 85);

            drawRectAndTextNoCenter("P1", 61, 78);
            sprite(136, 61, 85);
            sprite(p1, 61, 85);
        }
        else {
            let p2 = character_list[choices[2][1]];

            let p_offsets = [21, 81, 39, 99, 30, 90];
            let sprs = [p1, p2];
            let counter = 0;

            for (let i = 0; i < p_offsets.length; i++) {
                if (i < 4) {
                    let flipped = false;

                    if (i <= 1) { flipped = true; }
                    sprite(131, p_offsets[i], 85, flipped);
                }
                else if (i >= 4 && i < 6) {
                    sprite(136, p_offsets[i], 85);
                    sprite(sprs[counter], p_offsets[i], 85);
                    counter++;
                }
            }

            drawRectAndTextNoCenter("P1", 31, 78);
            drawRectAndTextNoCenter("P2", 91, 78);
        }
    }

    sprite(131, centerText("I") - 2, switchable_choices_offset + 7, false, false, true); // down arrow
}

export function evaluateScores() {
    scores = [];
    tied_score = [];
    greatest_score = -1;
    greatest_score_id = -1;
    winner = -1;

    if (singleplater) {
        let hs = false;
        let p = platers[0];
        if (p.score > p.single_hs) {
            p.single_hs = p.score;
            hs = true;
        }
        scores.push({"id": p.id + 1, "score": p.score, "got_high_score": hs});
    }
    else {
        let temp_compare = {"id": -1, "score": -1};
        for (const [key, p] of Object.entries(platers)) { // already set scores here
            let hs = false;
            let pid = p.id + 1;
            if (p.score > p.multi_hs) {
                p.multi_hs = p.score;
                hs = true;
            }

            if (p.score > temp_compare.score) {
                greatest_score = p.score;
                greatest_score_id = pid;
            }

            temp_compare.id = pid;
            temp_compare.score = p.score;

            scores.push({"id": pid, "score": p.score, "got_high_score": hs});
        }

        for (let i = 0; i < scores.length; i++) { // ties
            if (scores[i].score !== -1 && scores[i].score == greatest_score && scores[i].id !== greatest_score_id) {
                tied_score.push({"id": scores[i].id, "score": scores[i].score});
            }
        }

        tied_score.push({"id": greatest_score_id, "score": greatest_score});

        if (tied_score.length == 1 && greatest_score_id !== -1) {
            winner = greatest_score_id - 1;
            sendWinner(winner);
            winner = -1; // reset winner after sending
        }
    }
}

export function drawEnd() { // should really precalculate offsets
    let offset_y = 40;
    let h = 7;

    if (singleplater) {
        let p = scores[0];

        offset_y = drawRectAndOffset("P" + p.id + ":" + p.score, offset_y, h);

        if (p.got_high_score) {
            offset_y = drawRectAndOffset("New High Score!", offset_y, h);
        }
    }
    else {
        for (let i = 0; i < scores.length; i++) {
            let p = scores[i];

            if (p.got_high_score) {
                offset_y = drawRectAndOffset("New High Score!", offset_y, h);
            }

            offset_y = drawRectAndOffset("P" + p.id + ":" + p.score, offset_y, h);
        }

        if (tied_score.length > 1) {
            offset_y = drawRectAndOffset("Tie!", offset_y, h);
        }
        else {
            offset_y = drawRectAndOffset("P" + greatest_score_id + " wins!", offset_y, h);
        }
    }

    drawRectAndOffset("Press Enter to Reset the Game", offset_y, h);
}

export function drawPause() {
    cls();
    draw(map_pause, 0,0);

    let h = 8;
    let offset_y = 30;
    offset_y = drawRectAndOffset("ESC to return to game", offset_y, h);
    offset_y = drawRectAndOffset("R or K to return to start", offset_y, h);
    offset_y = drawRectAndOffset("Enter to Reset the Game", offset_y, h);
}

function drawRectAndOffset(str, offset_y, h) {
    let x = centerText(str);
    drawRect(str, x, offset_y);
    print(str, x, offset_y);

    offset_y += h;

    return offset_y;
}

function drawRectAndText(str, offset_y) {
    let x = centerText(str);
    drawRect(str, x, offset_y);
    print(str, x, offset_y);
}

function drawRectAndTextNoCenter(str, x, offset_y) {
    drawRect(str, x, offset_y);
    print(str, x, offset_y);
}