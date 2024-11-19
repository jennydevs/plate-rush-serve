import { getMapTile, map_logic } from "./map.js";
import { direction, spots } from "./idkeys.js";
import { checkCanPlace, checkCanPickUp, items, item_tiles, getItemKey, removeItem, placeItem, spawnBeltItems } from "./item.js";
import { npcCheck } from "./npc.js";
import { platers } from "./player.js";

const belt_type = {
    line: 4,
    corner: 20,
};

const max_belt_timer = 60;
let current_timer = 0;

export const belts = {};

export function setUpBelts() {
    createBelts();
}

function createBelts() {
    let map_width = 16;
    let map_height = 16;
    
    for (let i = 0; i < map_height; i++) {
        for (let j = 0; j < map_width; j++) {
            let tile = getMapTile(map_logic, j, i);
            if (tile !== -1) {
                if (tile.sprite == belt_type.line 
                    || tile.sprite == belt_type.corner) {
                    let belt = {
                        "nkey": -1,
                        "dir": findBeltDirection(tile),
                        "end": false,
                        "x": tile.x,
                        "y": tile.y,
                        "nx": -1,
                        "ny": -1,
                        "tile_type": spots.belt,
                        "is_counter": true,
                    };

                    let belt_coords = getNextBelt(belt.dir, belt.x, belt.y);

                    if (belt_coords !== -1) {
                        belt.nkey = getItemKey(belt_coords.x, belt_coords.y);
                        belt.nx = belt_coords.x;
                        belt.ny = belt_coords.y;
                    }
                    else { belt.end = true; }

                    belts[getItemKey(belt.x, belt.y)] = belt;
                }
            }
        }
    }
}

function getNextBelt(bdir, bx, by) {
    let offset_1 = 0;
    let offset_2 = 0;
    
    if (bdir == direction.right) { offset_1 = 1; } 
    else if (bdir == direction.left) { offset_1 = -1 } 
    else if (bdir == direction.up) { offset_2 = -1 } 
    else if (bdir == direction.down) { offset_2 = 1 }
    
    let tile = getMapTile(map_logic, bx + offset_1, by + offset_2);
    
    if (tile !== -1) { 
        if (tile.sprite == belt_type.line 
            || tile.sprite == belt_type.corner) {
            return {"x": bx + offset_1, "y": by + offset_2};
        } 
    }

    return -1;
}

function findBeltDirection(belt_tile) {
    const fH = belt_tile.flipH;
    const fV = belt_tile.flipV;
    const fR = belt_tile.flipR;
    
    if (!fH && !fR) { return direction.right; }
    if (fH && !fR) { return direction.left; }
    if (!fV && fR) { return direction.down; }    
    if (fV && fR) { return direction.up; }
}

export function beltMoveItems() {
    if (current_timer >= max_belt_timer) { // in sync now, not sure still is when npc check is fixed
        for (const [key, plater] of Object.entries(platers)) {
            if (plater.on_belt) {
                const belt = belts[getItemKey(Math.floor(plater.px / 8), Math.floor(plater.py / 8))];
                plater.px = belt.nx * 8;
                plater.py = belt.ny * 8;
            }
        }
    }

    let b_items = {};
    let b_counter = 0;

    for (const [key, belt] of Object.entries(belts)) {
        if (items[key] !== undefined && items[key] !== -1) {
            b_items[key] = items[key];
            b_counter++;
        }
    }

    if (b_counter == 0) { // could do bool
        return;
    }

    b_items = npcCheck(b_items); 

    if (current_timer >= max_belt_timer) {
        let moved_items = {};

        for (const [key, b] of Object.entries(b_items)) {
            if (items[key] !== undefined && items[key] !== -1) { // work on this
                if (checkCanPickUp(item_tiles[key])) {
                    removeItem(items[key].x, items[key].y);

                    const belt = belts[b.current_tile];
                    b.x = belt.nx;
                    b.y = belt.ny;
                    b.on_counter = true;
                    b.current_tile = belt.nkey;
                    moved_items[b.current_tile] = b;
                }
            }
        }

        for (const [key, m] of Object.entries(moved_items)) {
            if (checkCanPlace(item_tiles[key], m.subtype)) {
                placeItem(m, item_tiles[key]);
            }
        }

        current_timer = 0;
    }
    else { current_timer++; }
} 

export function resetBelts() {
    current_timer = 0;
    let b_items = {};
    let b_counter = 0;

    for (const [key, belt] of Object.entries(belts)) {
        if (items[key] !== undefined && items[key] !== -1) {
            b_items[key] = items[key];
            b_counter++;
        }
    }

    if (b_counter == 0) { // could do bool
        return;
    }

    for (const [key, b] of Object.entries(b_items)) {
        removeItem(items[key].x, items[key].y);
    }

    spawnBeltItems();
    current_timer = 0;
}