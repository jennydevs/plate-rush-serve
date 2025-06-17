import { npc_spots, npc_list, direction, drink_orders, food_orders, score, item_scores } from "./idkeys.js";
import { getMapTile, map_item, map_npc, map_furniture } from "./map.js";
import { checkCanPickUp, addItem, removeItem, item_tiles, items, getItemKey } from "./item.js";
import { addScore } from "./player.js";

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

    spawnNPCS();
}

function spawnNPCS() {
    createNPC();
    createNPC();
    createNPC();
    createNPC();
    createNPC();
}

function NPC(spr, move_timer) {
    const random_spawn = random(spawn_area.length);

    return {
        "spr": spr == -1? npc_list[random(npc_list.length)] : spr,
        "order": -1,
        "seat_num": -1,
        "dx": -8,
        "dy": -8,
        "dir": -1,
        "x": spawn_area[random_spawn].x,
        "y": spawn_area[random_spawn].y,
        "front": -1,
        "sitting": false,
        "served": false,
        "walk_id": -1,
        "timer": move_timer,
        "current_timer": 0,
        "prev_path": [[-1, -1]], // one spot buffer don't disappear one spot early when leaving
        "walk_dir": -1,
        "table_seat": false,
        "current_prev_path": 0,
    };
}

export function addNPC() {
    if (spawn_current_timer >= spawn_timer){
        createNPC();
        spawn_current_timer = 0;
    }
    else { spawn_current_timer++; }
}

function createNPC() {
    if (open_single_seats.length == 0 
        && open_table_seats.length == 0) {
        return;
    }

    const coin_flip = 2;
    const dining_type = random(coin_flip); // 0 for single, 1 for table 

    let random_seating = -1;
    let seating_id = -1;
    let seating = -1;
    let npc_amt = 0;
    let timer = 30;
    let table_seat = false;

    if (dining_type == 0 && open_single_seats.length != 0) {
        random_seating = random(open_single_seats.length);
        seating_id = open_single_seats[random_seating];
        seating = single_seats[seating_id];
        npc_amt = 1;
        table_seat = false;
    }
    else if (dining_type == 1 && open_table_seats.length != 0) {
        random_seating = random(open_table_seats.length);
        seating_id = open_table_seats[random_seating];
        seating = tables[seating_id];

        let seat_count = seating.group.seating_group.length;
        npc_amt = Math.floor(Math.random() * ((seat_count + 1) - 2) + 2); // hmm

        if (npc_amt > seat_count) { npc_amt = seat_count; }

        seating.current_people = npc_amt;
        seating.people_served = 0;

        table_seat = true;
    }

    for (let i = 0; i < npc_amt; i++) {
        let npc = NPC(-1, timer);
        npc.seat_num = seating_id;
        if (!table_seat) {
            npc.dx = seating.x;
            npc.dy = seating.y;
            npc.dir = seating.dir;
            npc.front = seating.bid;
            npc.table_seat = false;
        }
        else {
            npc.dx = seating.group.seating_group[i].chair[0];
            npc.dy = seating.group.seating_group[i].chair[1];
            npc.dir = seating.group.seating_group[i].chair[2];
            npc.front = seating.group.seating_group[i].table;
            npc.table_seat = true;

            npc.belt = seating.bid;

            timer += 5;
        }
    
        npc.order = orderItem();
        npcs.push(npc);
    }

    if (npc_amt !== 0) {
        if (!table_seat) {
            open_single_seats.splice(random_seating, 1);
        } 
        else {
            open_table_seats.splice(random_seating, 1);
        }
    }
}

export function updateNPC() {
    for (let i = 0; i < npcs.length; i++){
        let npc = npcs[i];

        if (npc.current_timer >= npc.timer) { 
            if (npc.served && !npc.sitting) {
                if (npc.table_seat) {
                    let table = tables[npc.seat_num];
                    if (table.people_served == table.current_people) { // confirm served, remove from the table, prepare to leave
                        npc.table_seat = false;
                        table.current_people--;
                        table.people_served--;

                        if (checkCanPickUp(item_tiles[getItemKey(npc.front[0], npc.front[1])])) {
                            removeItem(npc.front[0], npc.front[1]);
                        }

                        addItem(score.money, item_tiles[getItemKey(npc.front[0], npc.front[1])], npc.order.pay, true);

                        if (table.current_people == 0) {
                            open_table_seats.push(npc.seat_num);
                        }
                    }
                }
                else { // going home
                    npc.x = npc.prev_path[npc.current_prev_path][0];
                    npc.y = npc.prev_path[npc.current_prev_path][1];

                    npc.current_prev_path--;

                    if (npc.current_prev_path < 0) { npcs.splice(i, 1); } 
                    else { npc.current_timer = 0; }
                }
            }
            else if (!npc.sitting) { // move towards their seat
                if (npc.prev_path.length == 1) { // just spawned
                    // npcs[i].x !== npcs[i].dx && npcs[i].y !== npcs[i].dy
                    let x_check = npc.dx - npc.x; // redo this

                    npc.prev_path.push([npc.x, npc.y]);

                    if (x_check >= 0) { 
                        npc.x++; 
                        npc.spawn_dir = direction.left;
                    } // on the left side move to the right
                    else { 
                        npc.x--; 
                        npc.spawn_dir = direction.right;
                    }

                    npc.prev_path.push([npc.x, npc.y]);
                    npc.walk_id = getMapTile(map_npc, npc.x, npc.y).id;

                    let result = confirmSeating(walkable[npc.walk_id].npc_look, npc.x, npc.y, npc.dx, npc.dy, npc.table_seat, npc.seat_num);

                    if (result[0] !== -1) { 
                        if (!npc.table_seat) {
                            npc.x = result[0];
                            npc.y = result[1];
                        }
                        else {
                            npc.x = npc.dx;
                            npc.y = npc.dy;
                        }

                        npc.prev_path.push([npc.x, npc.y]);
                        npc.sitting = true;
                        npc.current_prev_path = npc.prev_path.length - 1;
                    } 
                    else {
                        let walk = npc.walk_id;
                        let next_spot = walkable[walk].nid;
                        let next_next_spot = walkable[next_spot].nid; // 2 spots left
                        let left = walkable[next_next_spot];

                        let prev_spot = walkable[walk].pid;
                        let prev_prev_spot = walkable[prev_spot].pid;
                        let right = walkable[prev_prev_spot];

                        let left_result = Math.sqrt(Math.pow((npc.dx - left.x), 2) + Math.pow((npc.dy - left.y), 2));
                        let right_result = Math.sqrt(Math.pow((npc.dx - right.x), 2) + Math.pow((npc.dy - right.y), 2));

                        if (x_check >= 0) {
                            if (left_result > right_result) { npc.walk_dir = direction.left; }
                            else { npc.walk_dir = direction.right; }
                        }
                        else {
                            if (left_result < right_result) { npc.walk_dir = direction.left; }
                            else { npc.walk_dir = direction.right; }
                        }
                    }
                }
                else {
                    let walk = walkable[npc.walk_id];

                    if (npc.spawn_dir == direction.right) { 
                        if (npc.walk_dir == direction.right) {
                            npc.walk_id = walk.pid; 
                        }
                        else if (npc.walk_dir == direction.left) {
                            npc.walk_id = walk.nid; 
                        }
                    }
                    else if (npc.spawn_dir == direction.left) { 
                        if (npc.walk_dir == direction.right) {
                            npc.walk_id = walk.nid; 
                        }
                        else if (npc.walk_dir == direction.left) {
                            npc.walk_id = walk.pid;
                        }
                    }

                    let walk_forward = walkable[npc.walk_id];
                    npc.x = walk_forward.x;
                    npc.y = walk_forward.y;
                    npc.prev_path.push([npc.x, npc.y]);

                    let result = confirmSeating(walk_forward.npc_look, npc.x, npc.y, npc.dx, npc.dy, npc.table_seat, npc.seat_num);

                    if (result[0] !== -1) {
                        if (!npc.table_seat) {
                            npc.x = result[0];
                            npc.y = result[1];
                        }
                        else {
                            npc.x = npc.dx;
                            npc.y = npc.dy;
                        }

                        npc.prev_path.push([npc.x, npc.y]);
                        npc.sitting = true;
                        npc.current_prev_path = npc.prev_path.length - 1;
                    }
                }

                npc.current_timer = 0;
            }
        } 
        else { npc.current_timer++; } // for moving
    }
}

function confirmSeating(dir, nx, ny, dx, dy, table_seat, seat_num) {
    let mx = dx;
    let my = dy; 

    if (table_seat) {
        let table = tables[seat_num];
        mx = table.x; // move x
        my = table.y;
    }

    if (dir == direction.left) {
        if (nx - 1 == mx && ny == my) { return [nx - 1, ny]; }
        if (table_seat && nx - 2 == mx && ny == my) { return [nx - 2, ny]; }
    }
    else if (dir == direction.right) {
        if (nx + 1 == mx && ny == my) { return [nx + 1, ny]; }
        if (table_seat && nx + 2 == mx && ny == my) { return [nx + 2, ny]; }
    }
    else if (dir == direction.up) {
        if (nx == mx && ny - 1 == my) { return [nx, ny - 1]; }
        if (table_seat && nx == mx && ny - 2 == my) { return [nx, ny - 2]; }
    }
    else if (dir == direction.down) {
        if (nx == mx && ny + 1 == my) { return [nx, ny + 1]; }
        if (table_seat && nx == mx && ny + 2 == my) { return [nx, ny + 2]; }
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
                "type": "",
				"subtype": "",
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
    walk_space.dir = result.dir;
    walk_space.npc_look = result.npc_look;

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

        tile_spot.dir = result.dir;
        tile_spot.npc_look = result.npc_look;
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
        return {"dir": direction.right, "npc_look": direction.down};
    }
    if (!fH && !fV && !fR) {
        return {"dir": direction.down, "npc_look": direction.left};
    }
    if (!fH && !fV && fR) {
        return {"dir": direction.left, "npc_look": direction.up};
    }
    if (fH && fV && !fR) {
        return {"dir": direction.up, "npc_look": direction.right};
    }

    return -1;
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
        let result = checkBeltDirection(tables[i].x, tables[i].y);
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


function checkBeltDirection(cx, cy) {
    const offset_1 = -1;
    const offset_2 = 1;
    
    let t1 = getMapTile(map_item, cx + offset_2, cy); // right
    let t2 = getMapTile(map_item, cx + offset_1,cy); // left
    let t3 = getMapTile(map_item, cx, cy + offset_1); // up
    let t4 = getMapTile(map_item, cx, cy + offset_2);  // down
    
    if (t1 !== -1 && t1.sprite == npc_spots.belt) {
        return [getItemKey(t1.x, t1.y), direction.right];
    }

    if (t2 !== -1 && t2.sprite == npc_spots.belt) {
        return [getItemKey(t2.x, t2.y), direction.left];
    }

    if (t3 !== -1 && t3.sprite == npc_spots.belt) {
        return [getItemKey(t3.x, t3.y), direction.up];
    }

    if (t4 !== -1 && t4.sprite == npc_spots.belt) {
        return [getItemKey(t4.x, t4.y), direction.down];
    }

    return [-1, -1];
}


function orderItem() {
    const order_type = random(2);
    let order_menu_item = -1;

    if (order_type == 0) {
        order_menu_item = food_orders[random(food_orders.length)];
    }
    else if (order_type == 1) {
        order_menu_item = drink_orders[random(drink_orders.length)];
    }
    return {"pay": item_scores[order_menu_item], "food": order_menu_item}
}


export function drawNPC()  {
    for (let i = npcs.length - 1; i >= 0; i--) {
        if (npcs[i].sitting) {
            let id = npcs[i].front;
            let flipped = false;

            if (npcs[i].table_seat) { id = npcs[i].belt; }
            if (npcs[i].dir == direction.left) { flipped = true };

            sprite(npcs[i].spr, npcs[i].x * 8, npcs[i].y * 8 - 2, flipped);
            sprite(90, item_tiles[id].x * 8, item_tiles[id].y * 8);
        }
        else if (npcs[i].table_seat && npcs[i].served) {
            let flipped = false;
            if (npcs[i].dir == direction.left) { flipped = true };
            sprite(npcs[i].spr, npcs[i].x * 8, npcs[i].y * 8 - 2, flipped);
        }
        else {
            sprite(npcs[i].spr, npcs[i].x * 8, npcs[i].y * 8);
        }
    }
}

export function drawNPCOrders() {
    for (let i = npcs.length - 1; i >= 0; i--) {
        if (!npcs[i].served && npcs[i].sitting) {
            let npc_x = npc_x = npcs[i].x;
            let npc_y = npc_y = npcs[i].y;
            let offset = -8;

            if (npcs[i].table_seat) {
                npc_x = npcs[i].front[0];
                npc_y = npcs[i].front[1];
                offset = 0;
            }

            sprite(49, npc_x * 8, npc_y * 8 - 2 + offset);
            sprite(npcs[i].order.food, npc_x * 8, npc_y * 8 - 2 + offset); 
        }
    }
}

export function npcCheck(belt_items) {
    for (let i = 0; i < npcs.length; i++) {
        for (const [key, b] of Object.entries(belt_items)) {
            let bid = b.current_tile;
            let npc = npcs[i];
            let belt_id = npc.front;

            if (npc.table_seat) { belt_id = npc.belt; }

            if (belt_id == bid) {
                if (npc.sitting && !npc.served && npc.order.food == b.spr) {
                    npc.served = true;
                    npc.sitting = false;
                    
                    if (!npc.table_seat) {
                        if (checkCanPickUp(item_tiles[getItemKey(b.x, b.y)])) {
                            addScore(b.chef, npc.order.pay);
                            removeItem(b.x, b.y);
                            b = -1;
                        };

                        addItem(score.money, item_tiles[bid], npc.order.pay, true);
                        b = items[getItemKey(b.x, b.y)];
                        open_single_seats.push(npc.seat_num);
                    }
                    else {
                        let table = tables[npc.seat_num];
                        table.people_served++;
    
                        let table_item = items[getItemKey(npc.front[0], npc.front[1])];
                        if (table_item !== undefined && table_item !== -1) { removeItem(table_item); } // remove items on table before serving
    
                        addScore(b.chef, npc.order.pay);
                        addItem(b.spr, item_tiles[getItemKey(npc.front[0], npc.front[1])], {"chef": b.chef}, false);

                        if (checkCanPickUp(item_tiles[getItemKey(b.x, b.y)])) {
                            removeItem(b.x, b.y);
                        }
    
                        belt_items[key] = -1; // no double orders for the table
                        b = -1;
                    }
                }
            }
        }
    }

    return belt_items;
}

export function resetNPCS() {
    npcs = [];
    open_single_seats = [];
    open_table_seats = [];

    setUpOpenSeats();

    spawn_current_timer = 0;

    spawnNPCS();
}
