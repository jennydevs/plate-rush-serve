import { resetPlayers } from "./player.js";
import { resetNPCS } from "./npc.js";
import { resetItems } from "./item.js";
import { resetBelts } from "./belt.js";
import { drawRect, centerText } from "./menu.js";

let og_game_timer = 10800; // 3 min
let game_timer = og_game_timer; // 18000 = 5 minutes
let end_game = 0;

let center_x = centerText("0:00"); // max of 9:59 for now

export function gameTimer() {
    if (game_timer >= end_game) {
        game_timer--;
        let total_seconds = game_timer / 60; // 60 frames a second
        let minutes = total_seconds / 60;
        let seconds = total_seconds % 60;
        if (minutes >= 0 && seconds >= 0) {
            drawTimer(minutes, seconds);
        } else {
            drawRect("0:00", center_x, 1);
            print("0:00", center_x, 1);
        }
        return false;
    }

    drawRect("0:00", center_x, 1);
    print("0:00", center_x, 1);
    return true;
}

function drawTimer(minutes, seconds) {
    drawRect("0:00", center_x, 1);
    (seconds > 10) ? print(Math.floor(minutes) + ":" + Math.floor(seconds), center_x, 1) 
            : print(Math.floor(minutes) + ":0" + Math.floor(seconds), center_x, 1);
}

export function resetGame() {
    resetPlayers();
    resetNPCS();
    resetItems();
    resetBelts();

    game_timer = og_game_timer;

    return false;
}