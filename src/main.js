import { delta } from "./helper.js";
import { setColors, drawMap } from "./map.js";
import { setUpItems, drawBottomItems, drawTopItems, drawMenus} from "./item.js";
import { setUpBelts, beltMoveItems } from "./belt.js";
import { setUpNPC, drawNPC, drawNPCOrders, updateNPC, addNPC } from "./npc.js";
import { 
    updatePlayers, drawPlayers, 
    drawHand, drawPlayersOnTop, drawPlayerFront, drawScore
} from "./player.js";
import { drawStart, drawEnd, drawPause, updateStart, calcCenterOffset, resetChoices, evaluateScores } from "./menu.js";
import { resetGame, gameTimer } from "./level.js";
import { addCharacters, createScoring } from "./idkeys.js";

var game_loop = false;
var game_start = true;
var game_end = false;
var game_pause = false;
var evaluated_score = false;
var pause_timer = false;

// calcCenterOffset();
createScoring();
addCharacters();
setColors();
setUpBelts();
setUpItems();
setUpNPC();

exports.update = function () {
    if (game_loop) {
        if (btnp.escape && !btnp.enter) {
            game_pause = !game_pause;
        }

        if (!game_pause) {
            if (!game_end) {
                let dt = delta();
                updatePlayers(dt);
            }

            beltMoveItems();
            addNPC();
            updateNPC();

            drawMap();
            drawBottomItems();
            drawPlayerFront();
            drawNPC();
            drawPlayers();
            drawTopItems();
            drawPlayersOnTop();
            drawNPCOrders();
            drawHand();
            drawMenus();

            if (!game_end) {
                drawScore();
            }
            else if (game_end) {
                if (!evaluated_score) {
                    evaluateScores();
                    evaluated_score = true;
                }
                if (evaluated_score && btnp.enter) {
                    game_end = resetGame(game_end);
                    evaluated_score = false;
                }

                drawEnd();
            }

            if (!pause_timer) {
                game_end = gameTimer();
            }
        } 
        else if (game_pause) {
            if (btnp.enter) {
                game_end = resetGame(game_end);
                game_pause = false;
            }

            if (btnp.k || btnp.r) { // return to menu
                game_loop = false;
                game_pause = false;
                game_start = true;
                resetChoices();
                resetGame(game_end);
            }

            drawPause();
        }
    }
    else if (game_start) {
        let set_states = updateStart();
        game_start = set_states[0];
        game_loop = set_states[1];
        drawStart();
    }
 };

 export function pauseTimer(p_timer) {
    pause_timer = p_timer;
 }