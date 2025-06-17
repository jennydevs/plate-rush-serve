import { getTile, getMapTile, map_solid, map_item, map_furniture } from "./map.js";
import { interactFront, checkStorage, moveStorageSelection, grabStorageItem, cookTheItems, leaveStorage, drawRecipe, drawItemsInContainer, moveBookSelection, getItemKey} from "./item.js";
import { spots, direction } from "./idkeys.js";
import { drawRect } from "./menu.js";

let singleplater = true;

export let platers = {
    0: -1,
    1: -1,
};

let p2_storage = -1;
let p2_wins = -1;

export function setUpPlaters(spr_1, spr_2, mode, winner) {
    let win = 0;
    if (spr_2 !== -1) { 
        if (platers[0] !== -1) {
            if (winner == platers[0].id) { win = 1; }
            platers[0] = Plater(0, spr_1, 50, 60, 106, 2, platers[0].single_hs, platers[0].multi_hs, mode, platers[0].wins + win);
            win = 0;
        }
        else { // new game
            platers[0] = Plater(0, spr_1, 50, 60, 106, 2, 0, 0, mode, 0);
        }

        if (platers[1] !== -1) { // move to new one
            if (winner == platers[1].id) { win = 1 };
            platers[1] = Plater(1, spr_2, 70, 60, 106, 1, 0, platers[1].multi_hs, "Multiplayer VS", platers[1].wins + win);
            win = 0;
        }
        else if (p2_storage !== -1) { // changed settings from singleplayer
            platers[1] = Plater(1, spr_2, 70, 60, 106, 1, 0, p2_storage, "Multiplayer VS", p2_wins);
            p2_storage = -1;
            p2_wins = -1;
        }
        else { // new
            platers[1] = Plater(1, spr_2, 70, 60, 106, 1, 0, 0, "Multiplayer VS", 0);
        }

        singleplater = false;
    }
    else {
        if (platers[1] !== -1) {
            p2_storage = platers[1].multi_hs;
            p2_wins = platers[1].wins;
            platers[1] = -1;
        }

        if (platers[0] !== -1) {
            platers[0] = Plater(0, spr_1, 60, 60, 106, 2, platers[0].single_hs, platers[0].multi_hs, mode, platers[0].wins);
        }
        else {
            platers[0] = Plater(0, spr_1, 60, 60, 106, 2, 0, 0, mode, 0);
        }
        singleplater = true;
    }
}

function Plater(id, spr, x, y, front_spr, control_type, single_hs, multi_hs, mode, wins) {
    return {
        "id": id,
        "px": x,
        "py": y,
        "start_x": x,
        "start_y": y,
        "w": 4,
        "h": 8,
        "spr": spr,
        "offset": 2,
        "speed": 5,
        "flipped": false,
        "held_item": -1,
        "holding_item": false,
        "dir": -1,
        "opened_storage": false,
        "storage_id": -1,
        "opened_book": false,
        "front": {
            "spr": front_spr,
            "fx": x,
            "fy": y,
        },
        "control_type": control_type,
        "carrying_container": false,
        "on_belt": false,
        "on_counter": false,
        "score": 0,
        "mode": mode,
        "single_hs": single_hs,
        "multi_hs": multi_hs,
        "wins": wins,
    };
}

export function addScore(plater, pay) {
    platers[plater].score += pay;
}

export function updatePlayers(dt) {
    for (const [key, p] of Object.entries(platers)) {
        if (p !== -1) {
            p = movePlayer(dt, p);
        }
    }
}



export function movePlayer(dt, p) { 
    let btn_right = -1;
    let btn_left = -1;
    let btn_up = -1;
    let btn_down = -1;
    let btn_c = -1;
    let btnp_space = -1;
    let btnp_left = -1;
    let btnp_right = -1;
    let btnp_c = -1;

    if (singleplater) {
        btn_right = btn.right || btn.d;
        btn_left = btn.left || btn.a;
        btn_up = btn.up || btn.w;
        btn_down = btn.down || btn.s;
        btn_c = btn.l || btn.t;
        btnp_space = btnp.k || btnp.r;
        btnp_left = btnp.left || btnp.a;
        btnp_right = btnp.right || btnp.d;
        btnp_c = btnp.l || btnp.t;
    }
    else {
        if (p.control_type == 1) {
            btn_right = btn.right;
            btn_left = btn.left;
            btn_up = btn.up;
            btn_down = btn.down;
            btn_c = btn.l;
            btnp_space = btnp.k;
            btnp_left = btnp.left;
            btnp_right = btnp.right;
            btnp_c = btnp.l;
        }
        else if (p.control_type == 2) {
            btn_right = btn.d;
            btn_left = btn.a;
            btn_up = btn.w;
            btn_down = btn.s;
            btn_c = btn.t;
            btnp_space = btnp.r;
            btnp_left = btnp.a;
            btnp_right = btnp.d;
            btnp_c = btnp.t;
        }
    }

    if (!p.opened_storage) {
        let cx = p.px;
        let cy = p.py;
        
        let vx = 0;
        let vy = 0;

        if (!p.on_belt){
            if (btn_right && !btn_left && !btn_c) { 
                vx = p.speed; 
                p.dir = direction.right;
                p.flipped = false;
            }
            if (btn_left && !btn_right && !btn_c) { 
                vx = -(p.speed); 
                p.dir = direction.left;
                p.flipped = true;
            }
            if (btn_up && !btn_down && !btn_c) { 
                vy = -(p.speed); 
                p.dir = direction.up;
            }
            if (btn_down && !btn_up && !btn_c) { 
                vy = p.speed; 
                p.dir = direction.down;
            }
        }
        else if (p.on_belt) {
            if (btn_right && !btn_left && !btn_c) { 
                p.dir = direction.right;
                p.flipped = false;
            }
            if (btn_left && !btn_right && !btn_c) { 
                p.dir = direction.left;
                p.flipped = true;
            }
            if (btn_up && !btn_down && !btn_c) { 
                p.dir = direction.up;
            }
            if (btn_down && !btn_up && !btn_c) { 
                p.dir = direction.down;
            }
        }
    
        let map_coords = checkFront(p.dir, cx, cy);

        if (map_coords !== -1) {
            let tx = map_coords[0];
            let ty = map_coords[1];
            p.front.fx = tx * 8;
            p.front.fy = ty * 8;

            if (btnp_space && !btnp_c) {
                let tile = getMapTile(map_item, tx, ty);
                
                if (tile !== -1) {
                    let result = lookFront(tile, p.holding_item, p.held_item, tx , ty, p.id);
                    p.held_item = result[0];
                    p.carrying_container = result[1];
                    p.opened_storage = result[2];
                    p.storage_id = result[3];
                    p.opened_book = result[4];
                    p.score += result[5];

                    if (p.held_item !== -1) {
                        p.holding_item = true;
                    }
                    else {
                        p.holding_item = false;
                    }
                }
            }

            if (btnp_c && !btnp_space) {
                let tile = getTile(map_item, p.front.fx, p.front.fy);
                if (tile !== -1){
                    if (tile.sprite == spots.fryer || tile.sprite == spots.stove) {
                        cookTheItems(p.id, getItemKey(tile.x, tile.y));
                    }
                    else if (tile.sprite == spots.item_spot) {
                        if (p.opened_book && p.on_belt) {
                            p.on_belt = false;
                            cx = p.front.fx;
                            cy = p.front.fy;
                        }
                        else if (!p.opened_book) { // dont hop around when holding the book
                            p.on_belt = false;
                            cx = p.front.fx;
                            cy = p.front.fy;
                        }

                        let tile_2 = getTile(map_furniture, p.front.fx, p.front.fy);
                        if (tile_2.sprite == spots.counter) {
                            p.on_counter = true;
                        }
                        else {
                            p.on_counter = false;
                        }
                    }
                    else if (tile.sprite == spots.belt) {
                        p.on_belt = true;
                        cx = p.front.fx;
                        cy = p.front.fy;
                    }
                }
            }
        }
    
        if (p.opened_book) {
            if (btn_c && btnp_right && !btnp_left) {
                p.held_item.current_selection = moveBookSelection(direction.right, p.held_item.current_selection, p.held_item.max_choice);
            }

            if (btn_c && btnp_left && !btnp_right) {
                p.held_item.current_selection = moveBookSelection(direction.left, p.held_item.current_selection, p.held_item.max_choice);
            }
        }

        // Movement/Collision code adapted for top-down from Monkey Warp by Cedric Stoquer
        
        cx = cx + vx * dt;
        cy = cy + vy * dt;

        cx = horizontalCollide(vx, cx, p.py);
        cy = verticalCollide(vy, cy, p.px);
    
        const limit = constrainBoundaries(cx, cy);

        p.px = limit.cx;
        p.py = limit.cy;

        let tile = getTile(map_furniture, p.px, p.py);
        if (tile !== -1) {
            if (tile.sprite == spots.counter && !p.on_counter) {
                p.on_counter = true;
            }
            else if (tile.sprite != spots.counter && p.on_counter) {
                p.on_counter = false;
            }
        }
        else {
            p.on_counter = false;
        }
    
        if (p.holding_item) {
            p.held_item.x = p.px;
            p.held_item.y = p.py - 8;   
        }

        return p;
    }

    if (p.opened_storage) {
        if (btnp_c && !btnp_space && !btnp_left && !btnp_right) {
            leaveStorage(p.storage_id);
            p.opened_storage = false;
        }
        if (btnp_right && !btnp_left) {
            moveStorageSelection(p.storage_id, direction.right);
        }
        if (btnp_left && !btnp_right) {
            moveStorageSelection(p.storage_id, direction.left);
        }
        if (btnp_space && !btnp_left && !btnp_right) {
            p.held_item = grabStorageItem(p.storage_id, p.id);
            p.holding_item = true;
            p.opened_storage = false;
        }
        return p;
    }
}


function horizontalCollide(vx, nx, py) {
    let hori_front = 8;
    let hori_offset = 0;
    
    if (vx < 0) {
        hori_front = 0;
        hori_offset = 8;   
    }
    
    if (vx !== 0) {
        const solid_sprite = 3;
        
        const y_side_1 = py + 1;
        const y_side_2 = py + 8 - 1;
        const x_side = nx + hori_front;
        
        const tile1 = getTile(map_solid, x_side, y_side_1);
        const tile2 = getTile(map_solid, x_side, y_side_2);
        
        if (tile1.sprite == solid_sprite || tile2.sprite == solid_sprite) {
            nx = Math.floor(nx / 8) * 8 + hori_offset;
        }
    } else {
        nx =  Math.round(nx);
    }

    return nx;
}


function verticalCollide(vy, ny, px) {
    let vert_front = 8;
    let vert_offset = 0;

    if (vy < 0) {
        vert_front = 0;
        vert_offset = 8;   
    }
    if (vy !== 0) {
        const solid_sprite = 3;
    
        const x_side_1 = px + 1;
        const x_side_2 = px + 8 - 1;
        const y_side = ny + vert_front;
        
        const tile1 = getTile(map_solid, x_side_1, y_side);
        const tile2 = getTile(map_solid, x_side_2, y_side);
        
        if (tile1.sprite == solid_sprite || tile2.sprite == solid_sprite) {
            ny = Math.floor(ny / 8) * 8 + vert_offset;
        }
    } else {
        ny =  Math.round(ny);
    }
    
    return ny;
}

function constrainBoundaries(cx, cy) {
    if (cx < 0) { cx = 0; }
    if (cy < 0) { cy = 0; }
    if (cx >= 120) { cx = 120; }
    if (cy >= 120) { cy = 120; }
    
    return {"cx": cx, "cy": cy};
}

function checkFront(p_dir, px, py) {
    const left_side = -2;
    const right_side = 11;
    const top_side = -2;
    const bottom_side = 11;
    const vertical_offset = 2;
    const horizontal_offset = 2;
    
    let front_coords = -1;
    
    if (p_dir == direction.right) {
        front_coords = [px + right_side, py + horizontal_offset];
    } else if (p_dir == direction.left) {
        front_coords = [px + left_side, py + horizontal_offset];
    } else if (p_dir == direction.up) {
        front_coords = [px + vertical_offset, py + top_side];
    } else if (p_dir == direction.down) {
        front_coords = [px+ vertical_offset , py + bottom_side];
    }
    
    if (front_coords !== -1) {
        let x = Math.floor(front_coords[0] / 8);
        let y = Math.floor(front_coords[1] / 8);
        return [x,y];
    }
    
    return front_coords;
}

function lookFront(tile, holding_item, held_item, px, py, p_id) {
    let collected_score = 0;
    let carrying_container = false;
    let opened_book = false;
    let storage_id = -1;
    let opened_storage = false;
    
    if (tile.sprite == spots.storage) {
        let check = checkStorage(tile, holding_item);
        if (check !== -1) {
            opened_storage = true;
            storage_id = check;
        }
    }
    else {
        held_item = interactFront(p_id, tile, holding_item, held_item);
        if (held_item !== -1) {
            holding_item = true;
        }
        else {
            holding_item = false;
        }
    }


    if (holding_item) {
        held_item.x = px;
        held_item.y = py - 8;

        if (held_item.type == "cookery") {
            if (held_item.subtype == "pot" 
                || held_item.subtype == "fry_tray") {
                carrying_container = true;
            }
        }
        else if (held_item.type == "book") {
            opened_book = true;
        }
        else if (held_item.type == "money") {
            collected_score += held_item.score;
            held_item = -1;
        }
    }
        
    return [held_item, carrying_container, 
        opened_storage, storage_id, opened_book, collected_score];
}


// DRAWING

export function drawScore() {
    let x = 30;
    let wx = 1;

    for (const [key, plater] of Object.entries(platers)) { // two players
        if (plater !== -1) {
            let offset = 1;
            let str = "" + (plater.id + 1) + ":" + plater.score;
            drawRect(str, x, offset);
            print(str, x, offset);
            offset += 6;
            let display_hs = -1;
            let display_wins = -1;
            if (plater.mode == "Singleplayer") {
                display_hs = plater.single_hs;
            }
            else if (plater.mode == "Multiplayer VS") {
                display_wins = plater.wins;
                display_hs = plater.multi_hs;

                drawRect("W:" + display_wins, wx, 1);
                print("W:" + display_wins, wx, 1);

                wx += 110; // 115 for single digit
            }
            str = "HS:" + display_hs;
            drawRect(str, x, offset);
            print(str, x, offset);
            x += 60;

        }
    }
}

export function drawPlayers() {
    for (const [key, plater] of Object.entries(platers)) {
        if (plater !== -1) {
            drawPlayerItem(plater);

            if (!plater.on_belt && !plater.on_counter) {
                drawPlayer(plater);
            }
        }
    }
}

export function drawPlayersOnTop() {
    for (const [key, plater] of Object.entries(platers)) {
        if (plater !== -1) {
            drawPlayerItem(plater);

            if (plater.on_belt || plater.on_counter) {
                drawPlayer(plater);
            }
        }
    }
}

export function drawPlayerFront() {
    for (const [key, plater] of Object.entries(platers)) {
        if (plater !== -1) {
            drawFrontOfPlayer(plater);
        }
    }
}

export function drawHand() {
    for (const [key, plater] of Object.entries(platers)) {
        if (plater !== -1) {
            drawPlayerItem(plater);
        }
    }
}

function drawPlayer(p) {
    sprite(p.spr, p.px, p.py, p.flipped);
}

function drawPlayerItem(p) {
    let holding_item = p.holding_item;
    let held_item = p.held_item;

    if (holding_item) {
        if (p.carrying_container) { drawItemsInContainer(held_item); }
        if (p.opened_book) { drawRecipe(held_item); }

        sprite(held_item.spr, held_item.x, held_item.y);
    }
}

function drawFrontOfPlayer(p) {
    sprite(p.front.spr, p.front.fx, p.front.fy);
}


// DRAWING END

var winner = -1;

export function resetPlayers(game_end) {
    let winning = -1;
    let p2 = -1;

    if (platers[0].mode != "Singleplayer") {
        p2 = platers[1].spr;
    }

    if (game_end) { winning = winner; }

    setUpPlaters(platers[0].spr, p2, platers[0].mode, winning);

    winner = -1;
}

export function sendWinner(id) {
    winner = id;
}