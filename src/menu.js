import { setUpPlaters, platers, sendWinner } from "./player.js";
import { menu_options, game_type_options, character_list } from "./idkeys.js";
import { map_title, map_pause, map_title_bg } from "./map.js";

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


let choices = [0, 0, [0,0]]; // up/down / left/right / char select
let singleplater = game_type_options[choices[1]] == "Singleplayer"? true: false;

export function updateStart() {
    let menu_choice = choices[0]; // up / down
    let option_choice = choices[1]; // left / right
    let p1_choice = choices[2][0];
    let p2_choice = choices[2][1];

    if (btnp.down || btnp.s && !btnp.w && !btnp.up) {
        menu_choice++;
        if (menu_choice > menu_options.length - 1) { menu_choice = 0; }
        choices[0] = menu_choice;
    }
    if (btnp.up || btnp.w && !btnp.down && !btnp.s) {
        menu_choice--;
        if (menu_choice < 0) { menu_choice = menu_options.length - 1; }
        choices[0] = menu_choice;
    }

    if (choices[0] == 0) { // GAME MODE
        if (btnp.left || btnp.a 
            && !btnp.right && !btnp.d) {
            option_choice--;
            if (option_choice < 0) { option_choice = game_type_options.length - 1; }
            choices[1] = option_choice;
        }
        if (btnp.right || btnp.d 
            && !btnp.left && !btnp.a) {
            option_choice++;
            if (option_choice > game_type_options.length - 1) { option_choice = 0; }
            choices[1] = option_choice;
        }
    }

    if (game_type_options[choices[1]] == "Singleplayer") {
        singleplater = true;
    }
    else {
        singleplater = false;
    }

    if (choices[0] == 1) { // CHARACTER
        if (btnp.a && !btnp.left && !btnp.right && !btnp.d) {
            p1_choice--;
            if (p1_choice < 0) { p1_choice = character_list.length - 1; }
            choices[2][0] = p1_choice;
        }
        if (btnp.d && !btnp.right && !btnp.left && !btnp.a) {
            p1_choice++;
            if (p1_choice > character_list.length - 1) { p1_choice = 0; }
            choices[2][0] = p1_choice;
        }

        if (btnp.left && !btnp.a && !btnp.right && !btnp.d) {
            if (!singleplater) {
                p2_choice--;
                if (p2_choice < 0) { p2_choice = character_list.length - 1; }
                choices[2][1] = p2_choice;
            }
            else {
                p1_choice--;
                if (p1_choice < 0) { p1_choice = character_list.length - 1; }
                choices[2][0] = p1_choice;
            }
        }
        if (btnp.right && !btnp.d && !btnp.left && !btnp.a) {
            if (!singleplater) {
                p2_choice++;
                if (p2_choice > character_list.length - 1) { p2_choice = 0; }
                choices[2][1] = p2_choice;
            }
            else {
                p1_choice++;
                if (p1_choice > character_list.length - 1) { p1_choice = 0; }
                choices[2][0] = p1_choice;
            }
        }

        if (btnp.enter) {
            if (game_type_options[choices[1]] == "Singleplayer") {
                setUpPlaters(character_list[choices[2][0]], -1, game_type_options[choices[1]], -1);
            }
            else {
                singleplater = false;
                setUpPlaters(character_list[choices[2][0]], character_list[choices[2][1]], game_type_options[choices[1]], -1);
            }
            return [false, true]; // game start, and loop
        }
    }

    return [true, false];
}

const strings = [
    "Press Enter to start",
    menu_options[0],
    menu_options[1],
];

let offsets = [];

export function calcCenterOffset() {
    for (let i = 0; i < strings.length; i++) {
        offsets.push(centerText(strings[i]));
    }

    for (let j = 0; j < game_type_options.length; j++) {
        offsets.push(centerText(game_type_options[j]));
    }
}

export function drawStart() { // real messy
    cls();
    draw(map_title_bg, 0,0);
    draw(map_title,0, -10);
    
    let start_y = 100;
    let offset_y = 0;
    let h = 6;

    // for (let i = 0; i < strings.length; i++) {
    //     print(strings[i] + "\n", offsets[i], start_y + offset_y);
    //     offset_y += h;
    // }

    let top = start_y + (offset_y * 2);

    if (choices[0] == 0) {
        drawRect(strings[1], offsets[1], start_y + (offset_y * 2));
        print(strings[1], offsets[1], start_y + (offset_y * 2));
        offset_y += h * 2;
        sprite(131, offsets[choices[1] + strings.length] - 8, start_y + offset_y - 2, true);
        sprite(131, game_type_options[choices[1]].length * 4 + offsets[choices[1] + strings.length] - 1, start_y + offset_y - 2);
        drawRect(game_type_options[choices[1]], offsets[choices[1] + strings.length], start_y + offset_y);
        print(game_type_options[choices[1]], offsets[choices[1] + strings.length], start_y + offset_y); // watch this choice
        sprite(131, centerText("I") - 2, start_y + offset_y + 7, false, false, true);
    }
    else if (choices[0] == 1) {
        if (game_type_options[choices[1]] == "Singleplayer") {
            sprite(131, 53, 85, true);
            sprite(131, 69, 85);

            drawRect("P1", 61, 78);
            print ("P1", 61, 78);
            sprite(136, 61, 85);
            sprite(character_list[choices[2][0]], 61, 85);

            drawRect(strings[2], offsets[2], top);
            print(strings[2], offsets[2], top);
            offset_y += h * 2;
            drawRect(strings[0], offsets[0], start_y + offset_y);
            print(strings[0], offsets[0], start_y + offset_y);
        }
        else {
            sprite(131, 21, 85, true);
            sprite(131, 39, 85);

            sprite(131, 81, 85, true);
            sprite(131, 99, 85);

            drawRect("P1", 31, 78);
            drawRect("P2", 91, 78);
            print ("P1", 31, 78);
            print ("P2", 91, 78);
            sprite(136, 30, 85);
            sprite(136, 90, 85);
            sprite(character_list[choices[2][0]], 30, 85);
            sprite(character_list[choices[2][1]], 90, 85);

            drawRect(strings[2], offsets[2], top);
            print(strings[2], offsets[2], top);

            offset_y += h * 2;
            drawRect(strings[0], offsets[0], start_y + offset_y);
            print(strings[0], offsets[0], start_y + offset_y);
        }
        sprite(131, centerText("I") - 2, start_y + offset_y + 7, false, false, true);
    }
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