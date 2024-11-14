import { getTile, getMapTile, map_solid, map_item, map_furniture } from "./map.js";
import { confirmFront, checkStorage, moveStorageSelection, grabStorageItem, cookTheItems, throwAwayItem, locateHeldItemIndex, leaveStorage, printItems, drawRecipe, drawItemsInContainer, resetItems, moveBookSelection} from "./item.js";
import { spots, direction, book, cooking_utensil, changed_cooking_utensil, score } from "./idkeys.js";
import { resetNPCS } from './npc.js';


export var p1 = {
    "id": 0,
    "px": 50,
    "py": 60,
    "w": 4,
    "h": 8,
    "offset": 2,
    "speed": 5,
    "spr": 127,
    "flipped": false,
    "held_item": -1,
    "holding_item": false,
    "dir": -1,
    "opened_storage": false,
    "storage_id": -1,
    "opened_book": false,
    "front": {
        "spr": 106,
        "fx": 60,
        "fy": 60,
    },
    "control_type": 1,
    "carrying_container": false,
    "on_belt": false,
    "on_counter": false,
    "bid": -1,
    "score": 0,
    "high_score": 0,
};

export var p2 = {
    "id": 1,
    "px": 70,
    "py": 60,
    "speed": 5,
    "spr": 111,
    "flipped": false,
    "held_item": -1,
    "holding_item": false,
    "dir": -1,
    "opened_storage": false,
    "storage_id": -1,
    "opened_book": false,
    "front": {
        "spr": 106,
        "tile": -1,
        "fx": 60,
        "fy": 60,
    },
    "control_type": 2,
    "carrying_container": false,
    "on_belt": false,
    "on_counter": false,
    "pid": -1,
    "score": 0,
    "high_score": 0,
};


export function updatePlayers(dt) {
    p1 = movePlayer(dt, p1);
    p2 = movePlayer(dt, p2);
}

export function drawPlayers() {
    drawPlayerItem(p2);
    if (!p2.on_belt && !p2.on_counter) {
        drawPlayer(p2);
    }

    drawPlayerItem(p1);
    if (!p1.on_belt && !p1.on_counter) {
        drawPlayer(p1);
    }
}

export function drawPlayerOnBelt() {
    if (p2.on_belt) {
        drawPlayer(p2);
    }

    if (p1.on_belt) {
        drawPlayer(p1);
    }
}

export function drawPlayerOnTop() {
    if (p2.on_counter) {
        drawPlayer(p2);
    }

    if (p1.on_counter) {
        drawPlayer(p1);
    }
}

export function drawPlayerFront() {
    drawFrontOfPlayer(p2);
    drawFrontOfPlayer(p1);
}

export function drawHand() {
    drawPlayerItem(p2);
    drawPlayerItem(p1);
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

    if (!p.opened_storage) {
        let cx = p.px;
        let cy = p.py;
        
        let vx = 0;
        let vy = 0;

        if (!p.on_belt){
            if (btn_right 
                && !btn_left 
                && !btn_c) { 
                vx = p.speed; 
                p.dir = direction.right;
                p.flipped = false;
            }
            if (btn_left 
                && !btn_right 
                && !btn_c) { 
                vx = -(p.speed); 
                p.dir = direction.left;
                p.flipped = true;
            }
            if (btn_up 
                && !btn_down 
                && !btn_c) { 
                vy = -(p.speed); 
                p.dir = direction.up;
            }
            if (btn_down 
                && !btn_up 
                && !btn_c) { 
                vy = p.speed; 
                p.dir = direction.down;
            }
        }
        else if (p.on_belt) {
            if (btn_right 
                && !btn_left 
                && !btn_c) { 
                p.dir = direction.right;
            }
            if (btn_left 
                && !btn_right 
                && !btn_c) { 
                p.dir = direction.left;
            }
            if (btn_up 
                && !btn_down 
                && !btn_c) { 
                p.dir = direction.up;
            }
            if (btn_down 
                && !btn_up 
                && !btn_c) { 
                p.dir = direction.down;
            }
        }
    
        let map_coords = checkFront(p.dir, cx, cy);

        if (map_coords !== -1) {
            let tx = map_coords[0];
            let ty = map_coords[1];
            p.front.fx = tx * 8;
            p.front.fy = ty * 8;

            if (btnp_space 
                && !btnp_c) {

                let tile = getMapTile(map_item, tx, ty);
                
                if (tile !== -1) {
                    let result = checkForItem(tile, p.holding_item, p.held_item, tx , ty);
                    p.holding_item = result[0];
                    p.held_item = result[1];
                    p.carrying_container = result[2];
                    p.opened_storage = result[3];
                    p.storage_id = result[4];
                    p.opened_book = result[5];
                    p.score += result[6];
                }
            }

            if (btnp_c 
                && !btnp_space) {
                    printItems();
                let tile = getTile(map_item, p.front.fx, p.front.fy);
                if (tile !== -1){
                    if (tile.sprite == spots.fryer || tile.sprite == spots.stove) {
                        cookTheItems(p.id, tile.id);
                    }
                    else if (tile.sprite == spots.item_spot) {
                        if (!p.opened_book) { // dont hop around when holding the book
                            p.on_belt = false;
                            p.bid = -1;
                            cx = p.front.fx;
                            cy = p.front.fy;
                        }
                        // p.on_belt = false; // test this
                        // p.bid = -1;
                        // cx = p.front.fx;
                        // cy = p.front.fy;

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
                        p.bid = tile.id;
                        cx = p.front.fx;
                        cy = p.front.fy;
                    }
                }
            }
            
        }
    
        if (p.opened_book) {
            if (
                btn_c 
                && btnp_right 
                && !btnp_left
            ) {
                p.held_item.current_selection = moveBookSelection(direction.right, p.held_item.current_selection, p.held_item.max_choice);
            }

            if (
                btn_c 
                && btnp_left 
                && !btnp_right
            ) {
                p.held_item.current_selection = moveBookSelection(direction.left, p.held_item.current_selection, p.held_item.max_choice);
            }
        }

        // From Monkey Warp Pixelbox by Cedric Stoquer

        vx = Math.floor(vx * 100) / 100;
        vy = Math.floor(vy * 100) / 100;
        
        cx = cx + vx * dt;
        cy = cy + vy * dt;

        cx = horizontalCollide(vx, cx, p.py);
        cy = verticalCollide(vy, cy, p.px);

        // END (Basically the movement code, but adapted for top-down)
    
        const limit = constrainBoundaries(cx, cy);

        p.px = limit.cx;
        p.py = limit.cy;

        let t = getTile(map_furniture, p.px, p.py);
        if (t !== -1) {
            if (t.sprite == spots.counter && !p.on_counter) {
                p.on_counter = true;
            }
            else if (t.sprite != spots.counter && p.on_counter) {
                p.on_counter = false;
            }
        }
        else {
            p.on_counter = false; // keeps it somewhat right
        }
    
        if (p.holding_item) {
            p.held_item.x = p.px;
            p.held_item.y = p.py - 8;   
        }

        return p;
    }

    if (p.opened_storage) {
        if (btnp_c 
            && !btnp_space && !btnp_left && !btnp_right) {
            leaveStorage(p.storage_id);
            p.opened_storage = false;
        }
        if (btnp_right 
            && !btnp_left) {
            moveStorageSelection(p.storage_id, direction.right);
        }
        if (btnp_left 
            && !btnp_right) {
            moveStorageSelection(p.storage_id, direction.left);
        }
        if (btnp_space
            && !btnp_left && !btnp_right
        ) {
            const result = grabStorageItem(p.storage_id);
            p.holding_item = result[0];
            p.held_item = result[1];
            p.opened_storage = result[2];
        }

        return p;
    }
}


function horizontalCollide(vx, nx, py) {
    let hori_front = 8;
    let hori_offset = 0;
    
    if (vx < 0) { // flip around
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

    if (vy < 0) { // flip around
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
    const leftSide = -2;
    const rightSide = 11;
    const topSide = -2;
    const bottomSide = 11;
    const verticalOffset = 2;
    const horizontalOffset = 2;
    
    let front_coords = -1;
    
    if (p_dir == direction.right) {
        front_coords = [px + rightSide, py + horizontalOffset];
    } else if (p_dir == direction.left) {
        front_coords = [px + leftSide, py + horizontalOffset];
    } else if (p_dir == direction.up) {
        front_coords = [px + verticalOffset, py + topSide];
    } else if (p_dir == direction.down) {
        front_coords = [px+ verticalOffset , py + bottomSide];
    }
    
    if (front_coords !== -1) {
        let x = Math.floor(front_coords[0] / 8);
        let y = Math.floor(front_coords[1] / 8);
        return [x,y];
    }
    
    return front_coords;
}


function checkForItem(tile, holding_item, held_item, px, py) {
    let collected_score = 0;
    let carrying_container = false;
    let opened_book = false;
    let storage_id = -1;
    let opened_storage = false;
    
    let result = confirmFront(tile, held_item, holding_item);
    holding_item = result[0];
    held_item = result[1];

    let check = checkStorage(tile, holding_item);

    if (check !== -1) {
        opened_storage = true;
        storage_id = check;
    }

    if (holding_item) {
        held_item.x = px;
        held_item.y = py - 8;

        if (held_item.type == "cookery") {
            carrying_container = true;
        }

        if (held_item.type == "book") {
            opened_book = true;
        }

        if (held_item.type == "money") {
            collected_score += held_item.score;
            throwAwayItem(locateHeldItemIndex());
            held_item = -1;
            holding_item = false;
        }
    }
        
    return [holding_item, held_item, carrying_container, opened_storage, storage_id, opened_book, collected_score];
}


// DRAWING

export function drawPlayer(p) {
    sprite(p.spr, p.px, p.py, p.flipped);
}


export function drawPlayerItem(p) {
    let holding_item = p.holding_item;
    let held_item = p.held_item;

    if (holding_item) { // deal with pots and pans here
        if (p.carrying_container) { drawItemsInContainer(held_item); }
        if (p.opened_book) { drawRecipe(held_item); }

        sprite(held_item.spr, held_item.x, held_item.y);
    }
}


export function drawFrontOfPlayer(p) {
    let front = p.front;
    sprite(front.spr, front.fx, front.fy);
}


export function drawScore() { // 5 tall 3 wide
    rectf(0,0,21,13)
    print("1:" + p1.score + "\n", 1, 1)
    print("2:" + p2.score, 1,7)
}

// DRAWING END
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
    let reset_p1 = {
        "id": 0,
        "name": "Bob",
        "px": 50,
        "py": 60,
        "w": 4,
        "h": 8,
        "offset": 2,
        "speed": 5,
        "spr": 127,
        "flipped": false,
        "held_item": -1,
        "holding_item": false,
        "dir": -1,
        "opened_storage": false,
        "storage_id": -1,
        "opened_book": false,
        "front": {
            "spr": 106,
            "fx": 60,
            "fy": 60,
        },
        "control_type": 1,
        "carrying_container": false,
        "on_belt": false,
        "on_counter": false,
        "bid": -1,
        "score": 0,
        "high_score": 0,
    };

    if (p1.score > p1.high_score) { // reset need to move high score somewhere else
        reset_p1.high_score = p1.score;
    } 
    else {
        reset_p1.high_score = p1.high_score; 
    }

    p1 = reset_p1;

    let reset_p2 = {
        "id": 1,
        "name": "Bobbers",
        "px": 70,
        "py": 60,
        "speed": 5,
        "spr": 111,
        "flipped": false,
        "held_item": -1,
        "holding_item": false,
        "dir": -1,
        "opened_storage": false,
        "storage_id": -1,
        "opened_book": false,
        "front": {
            "spr": 106,
            "tile": -1,
            "fx": 60,
            "fy": 60,
        },
        "control_type": 2,
        "carrying_container": false,
        "on_belt": false,
        "on_counter": false,
        "pid": -1,
        "score": 0,
        "high_score": 0,
    };

    if (p2.score > p2.high_score) {
        reset_p2.high_score = p2.score;
    }
    else {
        reset_p2.high_score = p2.high_score; 
    }

    p2 = reset_p2;

    resetNPCS();
    resetItems();

    game_timer = og_game_timer;

    return false; // game end
}