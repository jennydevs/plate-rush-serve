import { delta } from "./helper.js";
import { setColors, drawMap } from "./map.js";
import { setUpItems, drawBottomItems, drawTopItems, drawMenus} from "./item.js";
import { setUpBelts, beltMoveItems } from "./belt.js";
import { setUpNPC, drawNPC, drawNPCOrders, updateNPC, addNPC } from "./npc.js";
import { updatePlayers, drawPlayers, drawHand, drawPlayerOnBelt, drawPlayerOnTop, drawPlayerFront, drawScore, gameTimer, resetGame } from "./player.js";
import { drawStart, drawEnd, drawPause, updateStart } from "./menu.js";

let game_loop = false;
let game_start = true;
let game_end = false;
let game_pause = false;

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
            drawPlayerOnBelt();
            drawPlayerOnTop();
            drawNPCOrders();
            drawHand();
            drawMenus();

            if (!game_end) {
                drawScore();
            }
            else if (game_end) {
                if (btnp.enter) {
                    game_end = resetGame();
                }

                drawEnd();
            }

            game_end = gameTimer();
        } 
        else if (game_pause) {
            if (btnp.enter) {
                game_end = resetGame();
                game_pause = false;
            }

            drawPause();
        }
    }
    else if (game_start) {
        let set_states = updateStart(game_start);
        game_start = set_states[0];
        game_loop = set_states[1];
        drawStart();
    }
 };