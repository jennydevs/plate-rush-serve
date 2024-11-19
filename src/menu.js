import { setUpPlaters, platers } from "./player.js";
import { menu_options, game_type_options, character_list } from "./idkeys.js";
import { map_title } from "./map.js";

export function centerText(text) {
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
            console.log(singleplater, !singleplater)
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
            console.log(singleplater)
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
                setUpPlaters(character_list[choices[2][0]], -1);
            }
            else {
                singleplater = false;
                setUpPlaters(character_list[choices[2][0]], character_list[choices[2][1]]);
            }
            return [false, true]; // game start, and loop
        }
    }

    return [true, false];
}

const strings = [
    "Press ENTER/RETURN to start",
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
        print(strings[1], offsets[1], start_y + (offset_y * 2));
        offset_y += h * 2;
        sprite(131, offsets[choices[1] + strings.length] - 8, start_y + offset_y - 2, true);
        sprite(131, game_type_options[choices[1]].length * 4 + offsets[choices[1] + strings.length] - 1, start_y + offset_y - 2);
        print(game_type_options[choices[1]], offsets[choices[1] + strings.length], start_y + offset_y); // watch this choice
    }
    else if (choices[0] == 1) {
        if (game_type_options[choices[1]] == "Singleplayer") {
            sprite(131, 53, 85, true);
            sprite(131, 69, 85);

            print ("P1", 61, 78);
            sprite(character_list[choices[2][0]], 61, 85);

            print(strings[2], offsets[2], top);
            offset_y += h * 2;
            print(strings[0], offsets[0], start_y + offset_y)
        }
        else {
            sprite(131, 21, 85, true);
            sprite(131, 39, 85);

            sprite(131, 81, 85, true);
            sprite(131, 99, 85);

            print ("P1", 31, 78);
            print ("P2", 91, 78);
            sprite(character_list[choices[2][0]], 30, 85);
            sprite(character_list[choices[2][1]], 90, 85);

            print(strings[2], offsets[2], top);

            offset_y += h * 2;
            print(strings[0], offsets[0], start_y + offset_y)
        }
    }
}


export function drawEnd() {
    let offset_y = 0;
    let h = 7;

    let tied_score = [];
    let greatest_score = 0;
    let id = -1;

    if (singleplater) {
        let p = platers[0];
        let str = "P" + p.id + ": " + p.score;
        let x = centerText(str);
        offset_y = 40;
        drawRect(str, x, offset_y);
        print(str, x, offset_y);
        offset_y += h;

        if (p.score > p.high_score) {
            str = "New High Score for P" + p.id + " is" + p.score + "!";
            x = centerText(str);
            drawRect(str, x, offset_y);
            print(str, x, offset_y);
            p.high_score = p.score;
        }
    }
    else {
        offset_y = 40;

        for (const [key, p] of Object.entries(platers)) {
            if (p.score > greatest_score) {
                greatest_score = p.score;
                id = p.id;
            }
            else if (p.score == greatest_score) {
                tied_score.push({"id": key, "score": p.score});
            }
            let str = "P" + p.id + ": " + p.score;
            let x = centerText(str);
            drawRect(str, x, offset_y);
            print(str, x, offset_y);
            offset_y += h;

            if (p.score > p.high_score) {
                str = "New High Score for P" + p.id + " is" + p.score + "!";
                x = centerText(str);
                drawRect(str, x, offset_y);
                print(str, x, offset_y);
                offset_y += h;
                p.high_score = p.score;
            }
        }

        if (tied_score.length !== 0) {
            let str = "Tie!";
            let x = centerText(str);
            drawRect(str, x, offset_y);
            print(str, x, offset_y);
            offset_y += h;
            for (let i = 0; i < tied_score.length; i++) {
                str = "P" + tied_score[i].id + " is tied at " + tied_score[i].score + "!";
                x = centerText(str);
                drawRect(str, x, offset_y);
                print(str, x, offset_y);
                offset_y += h;
            }
        }
        else {
            str = "P" + id + " wins with " + greatest_score + "!";
            x = centerText(str);
            drawRect(str, x, offset_y);
            print(str, x, offset_y);
            offset_y += h;
        }
    }

    let str = "Press Enter to Reset the Game";
    let x = centerText(str);
    drawRect(str, x, offset_y);
    print(str, x, offset_y);
    offset_y += h;
}

export function drawPause() {
    cls();
    print("Press ESC to return to game" + "\n");
    print("Press Enter to Reset the Game" + "\n");
}