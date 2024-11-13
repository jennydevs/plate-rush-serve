import { npc_spots, npc_list, direction, drink_orders, food_orders, score, item_scores } from "./idkeys.js";
import { getMapTile, map_item, map_npc, map_furniture } from "./map.js";
import { addItem, throwAwayItem, item_tiles, items, getItemOnTile, addItemWithScore } from "./item.js";
import { belts } from "./belt.js";

let npcs = [];
const seats = [];
const single_seats = [];
const walkable = [];
let walk_counter = 0;
const spawn_area = [];
const tables = [];

let spawn_timer = 150; // change this time to increase/decrease chance for NPC to spawn
let spawn_current_timer = 0;

let open_single_seats = [];
let open_table_seats = [];


export function setUpNPC() {
    setUpTileIds();
    setUpWalkSpace();
    setUpSingleSeating();
    setUpTables();
    setUpOpenSeats();

    createNPC();
    createNPC();
    createNPC();
    createNPC();
    createNPC();
}

export function updateNPC() {
    for (let i = 0; i < npcs.length; i++){
        if (npcs[i].current_timer >= npcs[i].timer) { 
            if (!npcs[i].sitting) {
                if (npcs[i].table_seat && npcs[i].served) {
                    let table = tables[npcs[i].seat_num];
                    if (table.people_served == table.current_people) { // confirm all were served
                        npcs[i].table_seat = false;
                        table.current_people--; // remove one by one
                        table.people_served--;// maybe clear table and just put money in one corner

                        let tile = getMapTile(map_item, npcs[i].front[0], npcs[i].front[1]);

                        for (let j = 0; j < items.length; j++) { // need to add removeitem thing
                            if (items[j].x == npcs[i].front[0] && items[j].y == npcs[i].front[1]){ 
                                throwAwayItem(j);
                                break;
                            }
                        }
                        // addItem(score.money, item_tiles[tile.id]);
                        addItemWithScore(score.money, item_tiles[tile.id], npcs[i].pay);

                        if (table.current_people == 0) {
                            table.full = false;
                            open_table_seats.push(npcs[i].seat_num);
                        }
                    }
                }
                else if (npcs[i].served) { // they go home
                    npcs[i].x = npcs[i].prev_path[npcs[i].current_prev_path][0];
                    npcs[i].y = npcs[i].prev_path[npcs[i].current_prev_path][1];

                    npcs[i].current_prev_path--;

                    if (npcs[i].current_prev_path < 0) {
                        npcs.splice(i, 1);
                    } else {
                        npcs[i].current_timer = 0;
                    }
                }
                else {
                    // npcs[i].x !== npcs[i].dx && npcs[i].y !== npcs[i].dy
                    if (npcs[i].prev_path.length == 1) { // just spawned // changed from 0 to 1
                        let x_check = npcs[i].dx - npcs[i].x; // redo this
                        // let y_check = npcs[i].dy - npcs[i].y; //use y


                        // let y_check = npcs[i].dy - npcs[i].dx; // if some amount move upwards, or move downwards

                        if (x_check >= 0) { // on the left move to the right
                            npcs[i].prev_path.push([npcs[i].x, npcs[i].y]);
                            npcs[i].x++;
                            npcs[i].prev_path.push([npcs[i].x, npcs[i].y]);
                            npcs[i].walk_id = getMapTile(map_npc, npcs[i].x, npcs[i].y).id;

                            let result = confirmSeating(walkable[npcs[i].walk_id].npc_look, npcs[i].x, npcs[i].y, npcs[i].dx, npcs[i].dy, npcs[i].table_seat, npcs[i].seat_num);
                            
                            if (result[0] !== -1) { 
                                if (!npcs[i].table_seat) {
                                    npcs[i].x = result[0];
                                    npcs[i].y = result[1];
                                    npcs[i].prev_path.push([npcs[i].x, npcs[i].y]);
                                    npcs[i].sitting = true;
                                    npcs[i].current_prev_path = npcs[i].prev_path.length - 1;
                                }
                                else {
                                    npcs[i].x = npcs[i].dx;
                                    npcs[i].y = npcs[i].dy;
                                    npcs[i].prev_path.push([npcs[i].x, npcs[i].y]);
                                    npcs[i].sitting = true;
                                    npcs[i].current_prev_path = npcs[i].prev_path.length - 1;
                                }
                            } 
                            else {
                                let walk = npcs[i].walk_id;
                                let next_spot = walkable[walk].nid;
                                let next_next_spot = walkable[next_spot].nid; // 2 spots left
                                let left = walkable[next_next_spot];

                                let prev_spot = walkable[walk].pid;
                                let prev_prev_spot = walkable[prev_spot].pid;
                                let right = walkable[prev_prev_spot];

                                let left_result = Math.sqrt(Math.pow((npcs[i].dx - left.x), 2) + Math.pow((npcs[i].dy - left.y), 2));

                                let right_result = Math.sqrt(Math.pow((npcs[i].dx - right.x), 2) + Math.pow((npcs[i].dy - right.y), 2));
                                if (left_result > right_result) { // flipped it for the left side
                                    npcs[i].walk_dir = direction.left;
                                }
                                else {
                                    npcs[i].walk_dir = direction.right;
                                }

                                npcs[i].spawn_dir = direction.left;
                            } 
                        }
                        else { // on the right move to the left
                            npcs[i].prev_path.push([npcs[i].x, npcs[i].y]);
                            npcs[i].x--;
                            npcs[i].prev_path.push([npcs[i].x, npcs[i].y]);
                            npcs[i].walk_id = getMapTile(map_npc, npcs[i].x, npcs[i].y).id;

                            let result = confirmSeating(walkable[npcs[i].walk_id].npc_look, npcs[i].x, npcs[i].y, npcs[i].dx, npcs[i].dy, npcs[i].table_seat, npcs[i].seat_num);

                            if (result[0] !== -1) { 
                                if (!npcs[i].table_seat) {
                                    npcs[i].x = result[0];
                                    npcs[i].y = result[1];
                                    npcs[i].prev_path.push([npcs[i].x, npcs[i].y]);
                                    npcs[i].sitting = true;
                                    npcs[i].current_prev_path = npcs[i].prev_path.length - 1;
                                }
                                else {
                                    npcs[i].x = npcs[i].dx;
                                    npcs[i].y = npcs[i].dy;
                                    npcs[i].prev_path.push([npcs[i].x, npcs[i].y]);
                                    npcs[i].sitting = true;
                                    npcs[i].current_prev_path = npcs[i].prev_path.length - 1;
                                }
                            } 
                            else {
                                let walk = npcs[i].walk_id;
                                let next_spot = walkable[walk].nid;
                                let next_next_spot = walkable[next_spot].nid; // 2 spots left
                                let left = walkable[next_next_spot];
        
                                let prev_spot = walkable[walk].pid;
                                let prev_prev_spot = walkable[prev_spot].pid;
                                let right = walkable[prev_prev_spot];
        
                                let left_result = Math.sqrt(Math.pow((npcs[i].dx - left.x), 2) + Math.pow((npcs[i].dy - left.y), 2));
        
                                let right_result = Math.sqrt(Math.pow((npcs[i].dx - right.x), 2) + Math.pow((npcs[i].dy - right.y), 2));
                                if (left_result < right_result) {
                                    npcs[i].walk_dir = direction.left;
                                }
                                else {
                                    npcs[i].walk_dir = direction.right;
                                }
        
                                npcs[i].spawn_dir = direction.right;
                            }
                        }
                    } else {
                        if (!npcs[i].sitting) {
                            if (npcs[i].walk_dir == direction.right) {
                                if (npcs[i].spawn_dir == direction.right) {
                                    let walk = walkable[npcs[i].walk_id];
                                    npcs[i].walk_id = walk.pid;
                                    let walk_forward = walkable[npcs[i].walk_id];
                                    npcs[i].x = walk_forward.x;
                                    npcs[i].y = walk_forward.y;
                                    npcs[i].prev_path.push([npcs[i].x, npcs[i].y]);

                                    let result = confirmSeating(walk_forward.npc_look, npcs[i].x, npcs[i].y, npcs[i].dx, npcs[i].dy, npcs[i].table_seat, npcs[i].seat_num);

                                    if (result[0] !== -1) {
                                        if (!npcs[i].table_seat) {
                                            npcs[i].x = result[0];
                                            npcs[i].y = result[1];
                                            npcs[i].prev_path.push([npcs[i].x, npcs[i].y]);
                                            npcs[i].sitting = true;
                                            npcs[i].current_prev_path = npcs[i].prev_path.length - 1;
                                        }
                                        else {
                                            npcs[i].x = npcs[i].dx;
                                            npcs[i].y = npcs[i].dy;
                                            npcs[i].prev_path.push([npcs[i].x, npcs[i].y]);
                                            npcs[i].sitting = true;
                                            npcs[i].current_prev_path = npcs[i].prev_path.length - 1;
                                        }
                                    }
                                }

                                else if (npcs[i].spawn_dir == direction.left) {
                                    let walk = walkable[npcs[i].walk_id];
                                    npcs[i].walk_id = walk.nid;
                                    let walk_forward = walkable[npcs[i].walk_id];
                                    npcs[i].x = walk_forward.x;
                                    npcs[i].y = walk_forward.y;
                                    npcs[i].prev_path.push([npcs[i].x, npcs[i].y]);

                                    let result = confirmSeating(walk_forward.npc_look, npcs[i].x, npcs[i].y, npcs[i].dx, npcs[i].dy, npcs[i].table_seat, npcs[i].seat_num);

                                    if (result[0] !== -1) {
                                        if (!npcs[i].table_seat) {
                                            npcs[i].x = result[0];
                                            npcs[i].y = result[1];
                                            npcs[i].prev_path.push([npcs[i].x, npcs[i].y]);
                                            npcs[i].sitting = true;
                                            npcs[i].current_prev_path = npcs[i].prev_path.length  -1;
                                        }
                                        else {
                                            npcs[i].x = npcs[i].dx;
                                            npcs[i].y = npcs[i].dy;
                                            npcs[i].prev_path.push([npcs[i].x, npcs[i].y]);
                                            npcs[i].sitting = true;
                                            npcs[i].current_prev_path = npcs[i].prev_path.length - 1;
                                        }
                                        
                                    }
                                }
                            }
                            else if (npcs[i].walk_dir == direction.left) {
                                if (npcs[i].spawn_dir == direction.right) {
                                    let walk = walkable[npcs[i].walk_id];
                                    npcs[i].walk_id = walk.nid;
                                    let walk_forward = walkable[npcs[i].walk_id];
                                    npcs[i].x = walk_forward.x;
                                    npcs[i].y = walk_forward.y;
                                    npcs[i].prev_path.push([npcs[i].x, npcs[i].y]);

                                    let result = confirmSeating(walk_forward.npc_look, npcs[i].x, npcs[i].y, npcs[i].dx, npcs[i].dy, npcs[i].table_seat, npcs[i].seat_num);

                                    if (result[0] !== -1) {
                                        if (!npcs[i].table_seat) {
                                            npcs[i].x = result[0];
                                            npcs[i].y = result[1];
                                            npcs[i].prev_path.push([npcs[i].x, npcs[i].y]);
                                            npcs[i].sitting = true;
                                            npcs[i].current_prev_path = npcs[i].prev_path.length - 1;
                                        }
                                        else {
                                            npcs[i].x = npcs[i].dx;
                                            npcs[i].y = npcs[i].dy;
                                            npcs[i].prev_path.push([npcs[i].x, npcs[i].y]);
                                            npcs[i].sitting = true;
                                            npcs[i].current_prev_path = npcs[i].prev_path.length -1;
                                        }
                                    }
                                }
                                else if (npcs[i].spawn_dir == direction.left) {
                                    let walk = walkable[npcs[i].walk_id];
                                    npcs[i].walk_id = walk.pid;
                                    let walk_forward = walkable[npcs[i].walk_id];
                                    npcs[i].x = walk_forward.x;
                                    npcs[i].y = walk_forward.y;
                                    npcs[i].prev_path.push([npcs[i].x, npcs[i].y]);

                                    let result = confirmSeating(walk_forward.npc_look, npcs[i].x, npcs[i].y, npcs[i].dx, npcs[i].dy, npcs[i].table_seat, npcs[i].seat_num);

                                    if (result[0] !== -1) {
                                        if (!npcs[i].table_seat) {
                                            npcs[i].x = result[0];
                                            npcs[i].y = result[1];
                                            npcs[i].prev_path.push([npcs[i].x, npcs[i].y]);
                                            npcs[i].sitting = true;
                                            npcs[i].current_prev_path = npcs[i].prev_path.length - 1;
                                        }
                                        else {
                                            npcs[i].x = npcs[i].dx;
                                            npcs[i].y = npcs[i].dy;
                                            npcs[i].prev_path.push([npcs[i].x, npcs[i].y]);
                                            npcs[i].sitting = true;
                                            npcs[i].current_prev_path = npcs[i].prev_path.length - 1;
                                        }
                                    }

                                    
                                }
                            }
                        }
                    }
                    npcs[i].current_timer = 0;
                }

                // npcs[i].current_timer = 0;
            }
        } else {
            npcs[i].current_timer++; // for moving
        }
    }
}

function confirmSeating(dir, nx, ny, dx, dy, table_seat, seat_num) {
    if (table_seat) {
        if (dir == direction.left) {
            let table = tables[seat_num];

            let x = nx - 1;
            let y = ny;
    
    
            if (x == table.x && y == table.y) {
                return [x,y];
            }

            x = nx - 2;
            y = ny;

            if (x == table.x && y == table.y) {
                return [x,y];
            }
        }
        else if (dir == direction.right) {
            let table = tables[seat_num];

            let x = nx + 1;
            let y = ny;
    
    
            if (x == table.x && y == table.y) {
                return [x,y];
            }

            x = nx + 2;
            y = ny;

            if (x == table.x && y == table.y) {
                return [x,y];
            }
        }
        else if (dir == direction.up) {
            let table = tables[seat_num];

            let x = nx;
            let y = ny - 1;
    
    
            if (x == table.x && y == table.y) {
                return [x,y];
            }

            x = nx;
            y = ny - 2;

            if (x == table.x && y == table.y) {
                return [x,y];
            }
        }
        else if (dir == direction.down) {
            let table = tables[seat_num];

            let x = nx;
            let y = ny + 1;
    
    
            if (x == table.x && y == table.y) {
                return [x,y];
            }

            x = nx;
            y = ny + 2;

            if (x == table.x && y == table.y) {
                return [x,y];
            }

        }
    } else {
        if (dir == direction.left) {
            let x = nx - 1;
            let y = ny;
    
            if (x == dx && y == dy) {
                return [x,y];
            }
        }
        if (dir == direction.right) {
            let x = nx + 1;
            let y = ny;
    
            if (x == dx && y == dy) {
                return [x,y];
            }
        }
    
        if (dir == direction.up) {
            let x = nx;
            let y = ny - 1;
    
            if (x == dx && y == dy) {
                return [x,y];
            }
        }
    
        if (dir == direction.down) {
            let x = nx;
            let y = ny + 1;
    
            if (x == dx && y == dy) {
                return [x,y];
            }
        }
    }
    return [-1, -1];
}

function setUpTileIds() {
    const map_width = 16;
    const map_height = 16; 

    let seat_id = 0;
    let table_id = 0;
    let spawn_id = 0;

    let got_first_spot = false;

    for (let i = 0; i < map_width; i++) {
        for (let j = 0; j < map_height; j++) {
            let tile = getMapTile(map_npc, j, i);

            let tile_spot = {
                "tile_type": tile.sprite,
                "x": tile.x,
                "y": tile.y,
                "full": false,
            };

            if (tile.sprite == npc_spots.spawnable) {
                tile_spot.id = spawn_id;
                tile.id = spawn_id;
                spawn_id++;

                spawn_area.push(tile_spot);
            }
            else if (tile.sprite == npc_spots.seat) {
                tile_spot.id = seat_id;
                tile.id = seat_id;
                seat_id++;
                seats.push(tile_spot);
            }
            else if (tile.sprite == npc_spots.table) {
                tile_spot.group = [];
                tile_spot.id = table_id;
                tile.id = table_id;
                table_id++;

                tables.push(tile_spot);
            }
            else if (tile.sprite == npc_spots.walk) {
                if (!got_first_spot) {
                    tile_spot.id = 0;
                    tile_spot.nid = 1;
                    tile.id = 0;
                    walkable.push(tile_spot);
                    got_first_spot = true;
                    walk_counter++;
                }
                else {
                    walk_counter++;
                }
            }
        }
    }
}

function setUpWalkSpace() {
    let walk_space = walkable[0];
    let tile = getMapTile(map_npc, walk_space.x, walk_space.y);

    let result = getWalkSpaceDir(tile);
    walk_space.dir = result[0];
    walk_space.npc_look = result[1];

    for (let i = 1; i < walk_counter; i++) {
        tile = getNextWalkSpace(walk_space);

        let tile_spot = {
            "tile_type": tile.sprite,
            "x": tile.x,
            "y": tile.y,
            "full": false,
            "pid": i - 1, // could do this for belt for going in reverse
            "id": i,
            "nid": i + 1,
        };

        if (tile_spot.nid == walk_counter) {
            tile_spot.nid = 0;
        }

        result = getWalkSpaceDir(tile);

        tile_spot.dir = result[0];
        tile_spot.npc_look = result[1];
        tile_spot.id = i;

        walk_space = tile_spot;
        walkable.push(tile_spot);
    }

    walkable[0].pid = walkable.length - 1;
    setUpWalkSpaceTileIds();
}

function setUpWalkSpaceTileIds() {
    for (let i = 0; i < walkable.length; i++) {
        let tile = getMapTile(map_npc, walkable[i].x, walkable[i].y);
        tile.id = walkable[i].id;
    }
}

function getWalkSpaceDir(walk_space) {
    const fH = walk_space.flipH;
    const fV = walk_space.flipV;
    const fR = walk_space.flipR;

    if (fH && fV && fR) {
        let dir = direction.right;
        let npc_look = direction.down;
        return [dir, npc_look];
    }

    if (!fH && !fV && !fR) {
        let dir  = direction.down;
        let npc_look = direction.left;
        return [dir, npc_look];
    }

    if (!fH && !fV && fR) {
        let dir = direction.left;
        let npc_look = direction.up;
        return [dir, npc_look];
    }

    if (fH && fV && !fR) {
        let dir = direction.up;
        let npc_look = direction.right;
        return [dir, npc_look];
    }
}

function getNextWalkSpace(walk_space) {
    const offset_1 = -1;
    const offset_2 = 1;

    if (walk_space.dir == direction.right) {
        return getMapTile(map_npc, walk_space.x + offset_2, walk_space.y);
    }
    else if (walk_space.dir == direction.left) {
        return getMapTile(map_npc, walk_space.x + offset_1, walk_space.y);
    }
    else if (walk_space.dir == direction.up) {
        return getMapTile(map_npc, walk_space.x, walk_space.y + offset_1);
    }
    else if (walk_space.dir == direction.down) {
        return getMapTile(map_npc, walk_space.x, walk_space.y + offset_2);
    }

    return -1;
}

function setUpTables() {
    for (let i = 0; i < tables.length; i++) {
        let result = checkBeltDirection(tables[i].x, tables[i].y); // there was a 3rd parameter issue
        tables[i].bid = result[0];
        tables[i].dir = result[1];

        tables[i].group = formTable(tables[i].id, tables[i].x, tables[i].y);
    }
}


function formTable(table_id, table_x, table_y) {
    const offset_1 = -1;
    const offset_2 = 1;

    let cx = table_x;
    let cy = table_y;

    const belt_table = 55;
    const belt_chair = 41; // single seating
    const belt_inner_chair = 57; // double seating

    let result = {
        "id": table_id,
        "seating_group": [],
    };

    let right = getMapTile(map_furniture, cx + offset_2, cy);

    if (right !== -1) {
        let group = -1;
        if (right.sprite == belt_inner_chair) { // right double vertical seating // o x
            group = [right.x, right.y, direction.left];                         //  o x
            result.seating_group.push({ // right chair
                "chair": group,
                "table": [cx, cy],
            });

            group = [right.x, right.y + offset_2, direction.left];
            result.seating_group.push({ // bottom right chair
                "chair": group,
                "table": [cx, cy + offset_2],
            });
            return result;
        }

        if (right.sprite == belt_table) { // double table horizontally   // x o o x
            let right_chair = getMapTile(map_furniture, cx + offset_2 + offset_2, cy);

            if (right_chair.sprite == belt_chair) { // right single chair
                group = [right_chair.x, right_chair.y, direction.left];
                result.seating_group.push({
                    "chair": group,
                    "table": [right.x, right.y],
                });

                let left_chair = getMapTile(map_furniture, cx + offset_1, cy); // left single chair
                if (left_chair !== -1) {
                    if (left_chair.sprite == belt_chair) { // single seating 
                        group = [left_chair.x, left_chair.y, direction.right];
                        result.seating_group.push({
                            "chair": group,
                            "table": [cx, cy],
                        });
                    }
                }
                return result;
            }


            if (right_chair.sprite == belt_inner_chair) { // double seating table of four // x o o x
                group = [right_chair.x, right_chair.y, direction.left];            // x o o x
                result.seating_group.push({ // top right chair
                    "chair": group,
                    "table": [right.x, right.y],
                });

                group = [right_chair.x, right_chair.y + offset_2, direction.left]; // bottom right chair
                result.seating_group.push({
                    "chair": group,
                    "table": [right.x, right.y + offset_2],
                });

                group = [cx + offset_1, cy + offset_2, direction.right]; // bottom left chair
                result.seating_group.push({
                    "chair": group,
                    "table": [cx, cy + offset_2],
                });

                group = [cx + offset_1, cy, direction.right]; // top left chair
                result.seating_group.push({
                    "chair": group,
                    "table": [cx, cy],
                });

                return result;
            }
        }

        if (right.sprite == belt_chair) { // single seating no tables on the left // o x
            let group = [right.x, right.y, direction.left];
            result.seating_group.push({ // right single chair
                "chair": group,
                "table": [cx, cy],
            });
            return result;
        }
    }

    let left = getMapTile(map_furniture, cx + offset_1, cy);

    if (left !== -1) {
        let group = -1;
        if (left.sprite == belt_inner_chair) { // left double vertical seating // x o
            group = [left.x, left.y, direction.right];                        //  x o
            result.seating_group.push({ // left chair
                "chair": group,
                "table": [cx, cy],
            });

            group = [left.x, left.y + offset_2, direction.right];
            result.seating_group.push({ // bottom left chair
                "chair": group,
                "table": [cx, cy + offset_2],
            });
            return result;
        }

        if (left.sprite == belt_chair) { // single seating no tables on the left // x o 
            let group = [left.x, left.y, direction.right];
            result.seating_group.push({ // left single chair
                "chair": group,
                "table": [cx, cy],
            });
            return result;
        }
    }
}

function setUpSingleSeating() {
    let single_seat = 42;
    for (let i = 0; i < seats.length; i++) {
        let tile = getMapTile(map_furniture, seats[i].x, seats[i].y);

        if (tile.sprite == single_seat) {
            let result = checkBeltDirection(tile.x, tile.y);
            seats[i].bid = result[0];
            seats[i].dir = result[1];

            single_seats.push(seats[i]);
        }
    }
}

function setUpOpenSeats() {
    for (let i = 0; i < single_seats.length; i++) {
        open_single_seats.push(i); // ids are no good for chair since there are certain single seats that are separate from the seats group, order of index is different than id
    }

    for (let j = 0; j < tables.length; j++) { // this works since the ids are in order and are the same...
        open_table_seats.push(tables[j].id);
    }
}


function checkBeltDirection(cx, cy) { // not given a direction
    const offset_1 = -1;
    const offset_2 = 1;
    
    let t1 = getMapTile(map_item, cx + offset_2, cy); // right
    let t2 = getMapTile(map_item, cx + offset_1,cy); // left
    let t3 = getMapTile(map_item, cx, cy + offset_1); // up
    let t4 = getMapTile(map_item, cx, cy + offset_2);  // down
    
    if (t1 !== -1 && t1.sprite == npc_spots.belt) {
        return [t1.id, direction.right];
    }

    if (t2 !== -1 && t2.sprite == npc_spots.belt) {
        return [t2.id, direction.left];
    }

    if (t3 !== -1 && t3.sprite == npc_spots.belt) {
        return [t3.id, direction.up];
    }

    if (t4 !== -1 && t4.sprite == npc_spots.belt) {
        return [t4.id, direction.down];
    }

    return [-1, -1];
}


function createNPC() {
    if (open_single_seats.length == 0 && open_table_seats.length == 0) {
        return;
    }

    const coin_flip = 2;
    const dining_type = random(coin_flip); // 0 for single, 1 for table 

    if (dining_type == 0 && open_single_seats.length == 0) {
        return;
    }

    if (dining_type == 1 && open_table_seats.length == 0) {
        return;
    }

    if (dining_type == 0) {
        let random_spawn = random(spawn_area.length);
        let random_seat = random(open_single_seats.length);

        let seat_id = open_single_seats[random_seat];
        let seat = single_seats[seat_id];

        if (!seat.full) {
            let npc = {
                "spr": npc_list[random(npc_list.length)],
                "seat_num": seat_id,
                "dx": seat.x,
                "dy": seat.y,
                "dir": seat.dir,
                "x": spawn_area[random_spawn].x,
                "y": spawn_area[random_spawn].y,
                "front": seat.bid,
                "sitting": false,
                "served": false,
                "walk_id": -1,
                "timer": 30, // faster
                "current_timer": 0,
                "prev_path": [[-1, -1]], // makes it so they don't disappear one block early when leaving
                "walk_dir": -1,
                "table_seat": false,
                "current_prev_path": 0,
            };

            const order_type = random(2);

            if (order_type == 0) {
                let r = random(food_orders.length);
                npc.order = food_orders[r];
                npc.pay = item_scores[npc.order];
            }
            else {
                let r = random(drink_orders.length);
                npc.order = drink_orders[r];
                npc.pay = item_scores[npc.order];
            }

            seat.full = true;
            open_single_seats.splice(random_seat, 1);

            npcs.push(npc);
        }
    }
    else if (dining_type == 1) { // table
        let random_spawn = random(spawn_area.length);

        let random_table = random(open_table_seats.length);

        let table_id = open_table_seats[random_table];
        let table = tables[table_id];

        if (!table.full) { // can remove these conditions
            let seat_count = table.group.seating_group.length;

            let random_people = Math.floor(Math.random() * ((seat_count + 1) - 2) + 2);

            if (random_people > seat_count) {
                random_people = seat_count;
            }

            let timer = 30;

            // table.people = []; // work here
            table.current_people = 0;
            table.people_served = 0;


            for (let i = 0; i < random_people; i++) {
                let npc = {
                    "spr": npc_list[random(npc_list.length)],
                    "seat_num": table.id,
                    "dx": table.group.seating_group[i].chair[0],
                    "dy": table.group.seating_group[i].chair[1],
                    "dir": table.group.seating_group[i].chair[2],
                    "x": spawn_area[random_spawn].x,
                    "y": spawn_area[random_spawn].y,
                    "front": table.group.seating_group[i].table, // should consider keepin together or sepateing x y [xy]
                    "belt": table.bid,
                    "sitting": false,
                    "served": false,
                    "walk_id": -1,
                    "timer": timer,
                    "current_timer": 0,
                    "prev_path": [[-1,-1]],
                    "walk_dir": -1,
                    "table_seat": true,
                    "current_prev_path": 0,
                    "order_index": -1,
                };


                timer += 5;
    
                const order_type = random(2);
    
                if (order_type == 0) {
                    let r = random(food_orders.length);
                    npc.order = food_orders[r];
                    npc.pay = item_scores[npc.order];
                }
                else {
                    let r = random(drink_orders.length);
                    npc.order = drink_orders[r];
                    npc.pay = item_scores[npc.order];
                }

                table.current_people++;

                npcs.push(npc);
            }

            table.full = true;
            open_table_seats.splice(random_table, 1);
        }
    }
}


// pls fix npc not sitting down when served but whole group not done
export function drawNPC()  {
    for (let i = npcs.length - 1; i >= 0; i--) {
        if (npcs[i].sitting) {
            if (npcs[i].dir == direction.left) {
                sprite(npcs[i].spr, npcs[i].x * 8, npcs[i].y * 8, true);
                if (npcs[i].table_seat) { // draws more than it should really
                    sprite(90, belts[npcs[i].belt].x * 8, belts[npcs[i].belt].y * 8);
                }
                else {
                    sprite(90, belts[npcs[i].front].x * 8, belts[npcs[i].front].y * 8);
                }
            }
            if(npcs[i].dir == direction.right) {
                sprite(npcs[i].spr, npcs[i].x * 8, npcs[i].y * 8);
                if (npcs[i].table_seat) { // draws more than it should really
                    sprite(90, belts[npcs[i].belt].x * 8, belts[npcs[i].belt].y * 8);
                }
                else {
                    sprite(90, belts[npcs[i].front].x * 8, belts[npcs[i].front].y * 8);
                }
            }
        }
        else {
            sprite(npcs[i].spr, npcs[i].x * 8, npcs[i].y * 8);
        }
    }
}

export function drawNPCOrders() {
    for (let i = npcs.length - 1; i >= 0; i--) {
        if (!npcs[i].served && npcs[i].sitting) { // make the orders on top of the npc// TODO to not cover the belt, should draw sprite above head based on direction
            sprite(49, npcs[i].x * 8, (npcs[i].y * 8) - 8);
            sprite(npcs[i].order, npcs[i].x * 8, (npcs[i].y * 8) - 8);
        }
    }
}

export function npcCheck(belt_items) {
    let b_t = belt_items;

    for (let i = 0; i < npcs.length; i++) {
        for (let j = 0; j < b_t.length; j++) {
            let belt_id = b_t[j][0].current_tile;
            if (npcs[i].table_seat && npcs[i].sitting && !npcs[i].served) { // TABLE
                if (npcs[i].belt == belt_id) {
                    if (npcs[i].order == b_t[j][0].spr) {
                        let tile = getMapTile(map_item, npcs[i].front[0], npcs[i].front[1]);

                        let table = tables[npcs[i].seat_num];
                        table.people_served++;

                        npcs[i].served = true;
                        npcs[i].sitting = false;

                        throwAwayItem(b_t[j][1]); // put remove item in it
                        let table_item = getItemOnTile(tile.x, tile.y);
                        if (table_item !== -1) { // throw away anything sitting on the table if served
                            throwAwayItem(table_item);
                        }
                        addItem(b_t[j][0].spr, tile);
                        belts[belt_id].full = false;
                        b_t.splice(j, 1); // no double orders for the table
                    }
                }
            }
            else if (npcs[i].sitting && !npcs[i].served) { // SINGLE SEAT
                if (npcs[i].front == belt_id) {
                    if (npcs[i].order == b_t[j][0].spr) {
                        throwAwayItem(b_t[j][1]);
                        // addItem(score.money, belts[belt_id]);
                        addItemWithScore(score.money, belts[belt_id], npcs[i].pay);

                        npcs[i].served = true;
                        npcs[i].sitting = false;
                        single_seats[npcs[i].seat_num].full = false;
                        open_single_seats.push(npcs[i].seat_num);
                    }
                }
            }
        }
    }

    return b_t;
}

export function addNPC() {
    if (spawn_current_timer >= spawn_timer){
        createNPC();
        spawn_current_timer = 0;
    }
    else {
        spawn_current_timer++;
    }
}

export function resetNPCS() {
    npcs = [];
    open_single_seats = [];
    open_table_seats = [];

    setUpOpenSeats();

    for (let i = 0 ; i < tables.length; i++) {
        tables[i].full = false;
    }

    for (let j = 0 ; j < single_seats.length; j++) {
        single_seats[j].full = false;
    }

    spawn_current_timer = 0;

    createNPC();
    createNPC();
    createNPC();
    createNPC();
    createNPC();
}