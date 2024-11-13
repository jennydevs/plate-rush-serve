export var map_logic = getMap("logic");
export var map_solid = getMap("solids");
export var map_item = getMap("items");
export var map_furniture = getMap("furniture");
export var map_counter_item = getMap("counter_item");
export var map_floor_item = getMap("floor_item");
export var map_npc = getMap("npc");

var map_floor = getMap("floor");
var map_wall = getMap("walls");

export function drawMap() {
    cls();
    draw(map_floor, 0,0);
    draw(map_furniture,0,0);
    draw(map_wall, 0,0);
}

export function setColors() {
    paper(1);
    pen(0);
}

// only use pixel coordinates
export function getTile(map, x, y) {
    let tx = Math.floor(x / 8);
    let ty = Math.floor(y / 8);
    
    let min_boundary = 0;
    let max_boundary = 16;
    let max_offset = 1;
    let non_tile = -1;
 
    if (tx < min_boundary) { tx = min_boundary; }
    else if (tx >= max_boundary) { tx = max_boundary - max_offset; }
    
    if (ty < min_boundary) { tx = min_boundary; }
    else if (tx >= max_boundary) { tx = max_boundary - max_offset; }
    
    let tile = map.get(tx, ty);
    
    if (tile == null) { return non_tile; }
    
    return tile;
}


// Only for tiles with map coordinates
export function getMapTile(map, x, y) {
    let tx = x;
    let ty = y;

    let min_boundary = 0;
    let max_boundary = 16;
    let max_offset = 1;
    
    if (tx < min_boundary) { tx = min_boundary; }
    else if (tx >= max_boundary) { tx = max_boundary - max_offset; }
    
    if (ty < min_boundary) { tx = min_boundary; }
    else if (tx >= max_boundary) { tx = max_boundary - max_offset; }
    
    let tile = map.get(tx, ty);
    
    if (tile == null) { return -1; }
    
    return tile;
}

// map coords only
export function setMapTile(map, spr, x, y) {
    // map.set(x, y, tile, flipH, flipV, flipR, flagA, flagB);
    map.set(x, y, spr);
}

// map coords only
export function removeMapTile(map, x, y) {
    map.remove(x, y);
}

export function setTile(map, spr, x, y) {
    let tx = Math.floor(x / 8);
    let ty = Math.floor(y / 8);
    
    map.set(spr, tx, ty);
}

export function removeTile(map, x, y) {
    let tx = Math.floor(x / 8);
    let ty = Math.floor(y / 8);
    
    map.set(tx, ty);
}

export function clearMap(map) {
    map.clear();
}