import { p1, p2 } from "./player.js";

// function drawCenter(text) {
//     let w = 3;
//     let h = 5;

//     for (let i = 0; i < text.length; i++) {
        
//     }
// }





let choice = 0;
let option_choice = 0;

const options_1 = {
    0: "Game Type",
    1: "Character Select",

};

const options = {
    0: "Singleplayer",
    1: "Multiplayer VS",
    2: "Multiplayer CO-OP",
};

export function updateStart() {
    if (btnp.left || btnp.a && !btnp.right && !btnp.d && !btnp.down && !btnp.up) {
        choice--;
        if (choice < 0) {
            choice = 2;
        }
    }

    if (btnp.right || btnp.d && !btnp.left && !btnp.a && !btnp.down && !btnp.up) {
        choice++;
        if (choice > 2) {
            choice = 0;
        }
    }

    if (btnp.down && !btnp.right && !btnp.d && !btnp.left && !btnp.a && !btnp.up) {
        option_choice++;
        if (option_choice > 2) {
            option_choice = 0;
        }
    }

    if (btnp.up && !btnp.down && !btnp.right && !btnp.d && !btnp.left && !btnp.a) {
        option_choice--;
        if (option_choice < 0) {
            option_choice = 2;
        }
    }

    if (btnp.enter) {
        return [false, true]; // game start, and loop
    }
    return [true, false];
}

export function drawStart() {
    cls();
    print("Plate Rush!", 60, 60);
    print("Press ENTER/RETURN to start" + "\n");
    print(options[choice]);
}


export function drawEnd() {
    let score_1 = p1.score;
    let score_2 = p2.score;

    let high_score_1 = p1.high_score;
    let high_score_2 = p2.high_score;

    print("Player 1: " + score_1 + "\n");
    print("Player 2: " + score_2 + "\n");

    if (score_1 > high_score_1) {
        print("New High Score for Player 1 is" + high_score_1 + "!\n");
    }
    if (score_2 > high_score_2) {
        print("New High Score for Player 2 is" + high_score_2 + "!\n");
    }

    if (score_1 > score_2) {
        print("Player 1 wins!" + "\n");
    }
    else if (score_2 > score_1) {
        print("Player 2 wins!" + "\n");
    }
    else if (score_1 == score_2) {
        print("TIE!" + "\n");
    }

    print("Press Enter to Reset the Game");
}


export function drawPause() {
    cls();
    print("Press ESC to return to game" + "\n");
    print("Press Enter to Reset the Game");
}