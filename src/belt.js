import { getMapTile, map_logic, map_item, setMapTile, removeMapTile, map_counter_item } from "./map.js";
import { items } from "./item.js";
import { npcCheck } from "./npc.js";
import { p1, p2 } from "./player.js";
import { direction, spots } from "./idkeys.js";


const belt_type = {
    line: 4,
    corner: 20,
};

const max_belt_timer = 60;
let current_timer = 0;

export const belts = [];

export function setUpBelts() {
    findBelts();
}

function findBelts() {
    let map_width = 16;
    let map_height = 16;
    
    let collected_first_belt = false;
    let first_belt = -1;
    
    let belt_count = 0;
    
    for (let i = 0; i < map_height; i++) {
        for (let j = 0; j < map_width; j++) {
            let tile = getMapTile(map_logic, j, i);
            if (tile.sprite == belt_type.line || tile.sprite == belt_type.corner) {
                if (!collected_first_belt) {
                    first_belt = tile;
                    collected_first_belt = true;
                }
                belt_count++;
            }
        }
    }
    
    fillBelts(first_belt, belt_count);
}

function addBeltTileIds() {
    for (let i = 0 ; i < belts.length; i++) {
        let tile = getMapTile(map_item, belts[i].x, belts[i].y);
        tile.id = i;
    }
};

function fillBelts(belt, belt_count) {
    let b = belt; // tile
    
    for (let i = 0; i < belt_count; i++) {
        let curr_belt = {
            "id": i,
            "nid": i + 1,
            "full": false,
            "dir": findBeltDirection(b),
            "end": false,
            "x": b.x,
            "y": b.y,
            "tile_type": spots.belt,
            "is_counter": true,
            "type": "place",
            "subtype": "",
        };
        
        let belt_info = findNextBelt(curr_belt.dir, curr_belt.x, curr_belt.y);
        
        curr_belt.end = belt_info[1];
        b = belt_info[0];
        
        if (i == belt_count - 1) {
            curr_belt.nid = 0;
        }
        
        belts.push(curr_belt);
    }
    
    addBeltTileIds();
}

function findNextBelt(bdir, bx, by) {
    const left_side = -1;
    const right_side = 1;
    const top_side = -1;
    const bottom_side = 1;
    
    let belt_end = false;
    let next_belt = {};
    let belt_coords = [];
    
    if (bdir == direction.right) { belt_coords = [bx + right_side, by]; } 
    else if (bdir == direction.left) { belt_coords = [bx + left_side, by]; } 
    else if (bdir == direction.up) { belt_coords = [bx, by + top_side]; } 
    else if (bdir == direction.down) { belt_coords = [bx, by + bottom_side] }
    
    let tile = getMapTile(map_logic, belt_coords[0], belt_coords[1]);
    
    if (tile !== -1) { 
        if (tile.sprite == belt_type.line || tile.sprite == belt_type.corner) {
            next_belt = tile; 
        } 
    }
    else { belt_end = true; }
    
    return [next_belt, belt_end];
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
    let belt_items = [];
    for (let j = 0; j < items.length; j++) {
        if (items[j].tile_type == spots.belt) {
            belt_items.push([items[j], j]); // index may be incorrect depending on npc removing stuff hmm
        }
    }

    if (current_timer >= max_belt_timer) { // delays behind items if early, but syncs up after a second or two
        if (p1.on_belt) {
            let belt = belts[p1.bid];
            p1.px = belt.x * 8;
            p1.py = belt.y * 8;
            p1.bid = belt.nid;
        }
    
        if (p2.on_belt) {
            let belt = belts[p2.bid];
            p2.px = belt.x * 8;
            p2.py = belt.y * 8;
            p2.bid = belt.nid;
        }
    }

    if (belt_items.length !== 0) { //  flipped these conditions around pls check 
        belt_items = npcCheck(belt_items);
        if (current_timer >= max_belt_timer) {
            let temp_even = [];
            let temp_odd = [];
            
            for (let i = 0; i < belts.length; i++) {
                for (let k = 0; k < belt_items.length; k++) {
                    if (belts[i].id == belt_items[k][0].current_tile) {
                        if (i % 2 == 0) {
                            temp_even.push(belt_items[k]);
                        } else {
                            temp_odd.push(belt_items[k]);
                        }
                    }
                }
            }

            for (let l = 0; l < temp_even.length; l++) {
                const old_x = temp_even[l][0].x;
                const old_y = temp_even[l][0].y;
                let b = belts[temp_even[l][0].current_tile];
                let nb = belts[b.nid];
                temp_even[l][0].x = nb.x;
                temp_even[l][0].y = nb.y;
                temp_even[l][0].current_tile = nb.id;

                b.full = false;

                removeMapTile(map_counter_item, old_x, old_y);
            }

            for (let l = 0; l < temp_odd.length; l++) {
                const old_x = temp_odd[l][0].x;
                const old_y = temp_odd[l][0].y;
                let b = belts[temp_odd[l][0].current_tile];
                let nb = belts[b.nid];
                temp_odd[l][0].x = nb.x;
                temp_odd[l][0].y = nb.y;
                temp_odd[l][0].current_tile = nb.id;

                b.full = false;

                removeMapTile(map_counter_item, old_x, old_y);
            }

            for (let l = 0; l < temp_even.length; l++) {
                let b = belts[temp_even[l][0].current_tile];
                b.full = true; 
                setMapTile(map_counter_item, temp_even[l][0].spr, temp_even[l][0].x, temp_even[l][0].y);
            }

            for (let m = 0; m < temp_odd.length; m++) {
                let b = belts[temp_odd[m][0].current_tile];
                b.full = true;
                setMapTile(map_counter_item, temp_odd[m][0].spr, temp_odd[m][0].x, temp_odd[m][0].y);
            }

            current_timer = 0;
        }

         else {
            current_timer++;
        }
    }
} 