import { resetPlayers } from "./player.js";
import { resetNPCS } from "./npc.js";
import { resetItems } from "./item.js";

let og_game_timer = 18000;
let game_timer = og_game_timer; // 18000 = 5 minutes
let end_game = 0;

export function gameTimer() {
    if (game_timer >= end_game) {
        game_timer--;
        let total_seconds = game_timer / 60; // 60 frames a second
        let minutes = total_seconds / 60;
        let seconds = total_seconds % 60;
        if (minutes >= 0 && seconds >= 0) {
            drawTimer(minutes, seconds);
        } else {
            print("0:00", 60, 60);
        }
        return false;
    }

    print("0:00", 60, 60);
    return true;
}

function drawTimer(minutes, seconds) {
    (seconds > 10) ? print(Math.floor(minutes) + ":" + Math.floor(seconds), 60, 60) 
            : print(Math.floor(minutes) + ":0" + Math.floor(seconds), 60, 60);
}

export function resetGame() {
    resetPlayers();
    resetNPCS();
    resetItems();

    game_timer = og_game_timer;

    return false;
}