import { 
	direction, spots, storage_type, item_key,
	stove_recipes, fryer_recipes, one_ingredient_recipes, 
	liquid_fridge_contents, solid_fridge_contents, veggie_fridge_contents, dry_storage_contents, 
	fryer_recipes_order, stove_recipes_order, setUpKeyNames, key_name,
} from "./idkeys.js";
import { 
	getMapTile, setMapTile, removeMapTile, map_item, 
	map_furniture, map_counter_item, map_floor_item, clearMap
} from "./map.js";

export var items = {};

export const item_tiles = {};
const storages = {};

export function setUpItems() {
	setUpKeyNames();
    addItemTileIds();

	spawnBeltItems();
	spawnSpotItems();
}

export function spawnBeltItems() {
	addItem(item_key["infinite_plates"], item_tiles[getItemKey(7, 3)], -1);
}

function spawnSpotItems() {
	addItem(item_key["pot"], item_tiles[getItemKey(7,9)], -1);
	addItem(item_key["fry_tray"], item_tiles[getItemKey(8,9)], -1);
	addItem(item_key["pot"], item_tiles[getItemKey(9, 9)], -1);
	addItem(item_key["fryer_book"], item_tiles[getItemKey(6,9)], -1);
	addItem(item_key["stove_book"], item_tiles[getItemKey(5, 9)], -1);
}

export function setItemToMap(on_counter, spr, x, y) {
	on_counter ? setMapTile(map_counter_item, spr, x, y) : setMapTile(map_floor_item, spr, x, y);
}

export function removeItemFromMap(on_counter, x, y) {
	on_counter ? removeMapTile(map_counter_item, x, y) : removeMapTile(map_floor_item, x, y);
}

function clearItemMaps() {
	clearMap(map_counter_item);
	clearMap(map_floor_item);
}

function Item(item_spr) {
	return {
		"name": key_name[item_spr],
		"spr": item_spr,
		"current_tile": -1,
		"tile_type": -1,
		"on_counter": false,
		"x": -8,
		"y": -8,
		"type": "",
		"subtype": "",
	};
}

export function addItem(item_spr, spot, score) {
	if (spot == undefined) {
		return;
	}

	let item = Item(item_spr);

	if (spot !== -1) {
		item.current_tile = getItemKey(spot.x, spot.y);
		item.tile_type = spot.tile_type;
		item.on_counter = spot.is_counter;
		item.x = spot.x;
		item.y = spot.y;
		spot.full = true;
	}

	if (item_spr == item_key["money"]) {
		if (score !== -1) {
			item.type = "money";
			item.score = score;
		}
	}
	else if (item_spr == item_key["pot"]
		|| item_spr == item_key["fry_tray"]) {
		item.contents = [];
		item.cooked = false;
		item.full = false;
		item.burned = false;
		item.chef = -1;
		item.type = "cookery";

		if (item_spr == item_key["pot"]) {
			item.subtype = "pot";
		}
		else if (item_spr == item_key["fry_tray"]) {
			item.subtype = "fry_tray";
		}
	}
	else if (item_spr == item_key["bowl"]) {
		item.contents = [];
		item.full = false;
		item.type = "cookery";
		item.subtype = "container";
	}
	else if (item_spr == item_key["stove_book"]
		|| item_spr == item_key["fryer_book"]) {

		item.current_selection = 0;
		item.max_choice = 0;
		item.type = "book";

		if (item_spr == item_key["fryer_book"]) {
			item.pages = fryer_recipes_order;
			item.recipes = fryer_recipes;
			item.max_choice = fryer_recipes_order.length;
			item.subtype = "fryer";
		}
		else if (item_spr == item_key["stove_book"]) {
			item.pages = stove_recipes_order;
			item.recipes = stove_recipes;
			item.max_choice = stove_recipes_order.length;
			item.subtype = "stove";
		}
	}
	else if (item_spr == item_key["infinite_plates"]){ 

	}
	else if (item_spr == item_key["plate"]) {
		item.type = "serve"; // ?
		item.subtype = "plate";
	}
	else { // remove hmm
		item.cooked = false; // for ingredients and stuff
	}

	if (spot == -1) { // give item directly
		return item;
	}
	
	items[getItemKey(item.x, item.y)] = item;
	setItemToMap(item.on_counter, item.spr, item.x, item.y);
}

function addItemTileIds() {
	let map_width = 16;
	let map_height = 16;
    
    for (let i = 0; i < map_width; i++) {
        for (let j  = 0; j < map_height; j++) {
            let tile = getMapTile(map_item, j, i);
			let counter_check = getMapTile(map_furniture, j, i);
			
			if (tile !== -1) {
				let tile_spot = {
					"tile_type": tile.sprite,
					"x": tile.x,
					"y": tile.y,
					"full": false,
					"type": "",
					"subtype": "",
				};

				if (tile.sprite == spots.item_spot 
					|| tile.sprite == spots.stove 
					|| tile.sprite == spots.fryer) {

					tile_spot.is_counter = false;
					tile_spot.type = "place";

					if (counter_check.sprite == spots.counter 
						|| counter_check.sprite == spots.side_counter
						|| tile.sprite == spots.belt_outer_table
						|| tile.sprite == spots.belt_table) {
						tile_spot.is_counter = true;
					}

					if ( tile.sprite == spots.stove 
						|| tile.sprite == spots.fryer) {
						tile_spot.is_counter = true;
						tile_spot.subtype = "utility";
					}
					
                	item_tiles[getItemKey(tile_spot.x, tile_spot.y)] = tile_spot;
					items[getItemKey(tile_spot.x, tile_spot.y)] = -1;
				}
				else if (tile.sprite == spots.storage) {
					let storage_tile = getMapTile(map_furniture, j, i); 

					if (storage_tile.sprite == storage_type.liquid) {
						tile_spot.contents = liquid_fridge_contents;
						tile_spot.max_choice = liquid_fridge_contents.length;
					}
					else if (storage_tile.sprite == storage_type.veggie) {
						tile_spot.contents = veggie_fridge_contents;
						tile_spot.max_choice = veggie_fridge_contents.length;
					}
					else if (storage_tile.sprite == storage_type.solid) {
						tile_spot.contents = solid_fridge_contents;
						tile_spot.max_choice = solid_fridge_contents.length;
					}
					else if (storage_tile.sprite == storage_type.dry) {
						tile_spot.contents = dry_storage_contents;
						tile_spot.max_choice = dry_storage_contents.length;
					}

					// tile_spot.contents = [];
					tile_spot.open = false;
					tile_spot.current_selection = 0;

					storages[getItemKey(tile_spot.x, tile_spot.y)] = tile_spot;
				}
				else if (tile.sprite == spots.belt) {
					tile_spot.type = "place";
            		tile_spot.subtype = "";
					tile_spot.is_counter = true;

					item_tiles[getItemKey(tile_spot.x, tile_spot.y)] = tile_spot;
					items[getItemKey(tile_spot.x, tile_spot.y)] = -1;
				}
			}
        }
    }
}

export function checkCanPlace(spot, item_subtype) {
	if (spot == undefined || spot.full) {
		return false;
	}

	const tile_type = spot.tile_type;
	const tile_subtype = spot.subtype;
	
	if (tile_type == spots.stove 
		&& item_subtype == "pot") {
		return true;
	}

	if (tile_type == spots.fryer 
		&& item_subtype == "fry_tray") {
		return true;
	}

	if (spot.type == "place" 
		&& tile_subtype != "utility") {
		return true;
	}

	return false;
}

export function checkCanPickUp(spot) {
	if (spot == undefined || spot == -1) { return false; }

	return spot.full;
}


function plateFood(p_id, held_item, check_item) {
	if (check_item.subtype == "pot" || check_item.subtype == "fry_tray") {
		if (check_item.cooked) {
			held_item.spr = check_item.contents; // number
			held_item.subtype = "food";
			held_item.chef = check_item.chef;

			check_item.full = false;
			check_item.cooked = false;
			check_item.burned = false;
			check_item.chef = -1;
			check_item.contents = [];
			check_item.spr = item_key[check_item.subtype];

			setItemToMap(check_item.on_counter, check_item.spr, check_item.x, check_item.y);
		}
	}
	else if (check_item.subtype == "plate") {
		for (const [key, ingredient] of Object.entries(one_ingredient_recipes)) {
			if (ingredient == held_item.spr) {
				check_item.spr = item_key[key];
				check_item.subtype = "food";
				check_item.chef = p_id;
				setItemToMap(check_item.on_counter, check_item.spr, check_item.x, check_item.y);
				return {"held_item": -1, "check_item": check_item};
			}
		}
	}

	return {"held_item": held_item, "check_item": check_item};
}

function putIngredientIn(held_item, check_item) {
	if (check_item == -1 || (check_item.cooked || check_item.burned)) {
		return {"held_item": held_item, "check_item": check_item};
	}

	if (!check_item.full) {
		check_item.spr = item_key[check_item.subtype + "_full"];
	}

	setItemToMap(check_item.on_counter, check_item.spr, check_item.x, check_item.y);

	check_item.contents.push(held_item);
	check_item.full = true;

	return {"held_item": -1, "check_item": check_item};
}


function pickUpItem(spot) {
	let front_item = getItem(spot.x, spot.y);

	if (front_item == undefined || front_item == -1) {
		return -1;
	}

	if (front_item.spr == item_key["infinite_plates"]) {
		return addItem(item_key["plate"], -1, -1);
	}

	removeItem(front_item.x, front_item.y);

	front_item.current_tile = -1;
	front_item.tile_type = -1;
	front_item.on_counter = false;
	front_item.x = -8;
	front_item.y = -8;

	return front_item;
}


function trashCanSpot(holding_item, held_item) {
	if (!holding_item || held_item.type == "book") {
		return held_item;
	}

	if (held_item.type == "cookery") {
		held_item.spr = item_key[held_item.subtype];
		held_item.contents = [];
		held_item.full = false;
		held_item.cooked = false;
		held_item.burned = false;
		held_item.chef = -1;

		return held_item;
	}

	if (held_item.subtype == "food") {
		held_item.spr = item_key["plate"];
		held_item.type = "serve";
		held_item.subtype = "plate";

		return held_item;
	}
	
	return -1;
}

export function placeItem(item, spot) {
	if (item == undefined || item == -1) {
		return;
	}

	item.x = spot.x;
	item.y = spot.y;
	item.current_tile = getItemKey(spot.x, spot.y);
	item.tile_type = spot.tile_type;
	item.on_counter = spot.is_counter;

	items[getItemKey(spot.x, spot.y)] = item;
	item_tiles[getItemKey(spot.x, spot.y)].full = true;

	setItemToMap(item.on_counter, item.spr, item.x, item.y);
}


function interactSpot(p_id, tile_key, holding_item, held_item) {
	let spot = item_tiles[tile_key];

	if (holding_item) {
		if (checkCanPlace(spot, held_item.subtype)) {
			placeItem(held_item, spot);
			return -1;
		}

		if (spot.full) {
			let check_item = getItem(spot.x, spot.y);

			if (check_item.type == "cookery") {
				if (held_item.type == "cookery"
					|| held_item.type == "book"
					|| held_item.type == "food") {
					return held_item;
				}

				if (held_item.subtype == "plate") {
					let result = plateFood(p_id, held_item, check_item);
					held_item = result.held_item;
					check_item = result.check_item;
				}
				else {
					let result = putIngredientIn(held_item, check_item);
					held_item = result.held_item;
					check_item = result.check_item;
				}

				return held_item;
			}

			if (check_item.subtype == "plate") {
				let result = plateFood(p_id, held_item, check_item);
				held_item = result.held_item;
				check_item = result.check_item;

				return held_item;
			}
		}
	}

	if (!holding_item 
		&& checkCanPickUp(spot)) {
		held_item = pickUpItem(spot);

		return held_item;
	}

	return held_item;
}

export function checkStorage(tile, holding_item) {
	if (tile.sprite == spots.storage 
		&& !holding_item) {
		storages[getItemKey(tile.x, tile.y)].open = true;
		return getItemKey(tile.x, tile.y);
	}

	return -1;
}

export function interactFront(p_id, tile, holding_item, held_item) {
	if (tile.sprite == spots.stove 
		|| tile.sprite == spots.fryer 
		|| tile.sprite == spots.item_spot
		|| tile.sprite == spots.belt) {
		return interactSpot(p_id, getItemKey(tile.x, tile.y), holding_item, held_item);
	}
	else if (tile.sprite == spots.trashcan) {
		return trashCanSpot(holding_item, held_item);
	}

    return held_item;
}

export function grabStorageItem(storage_id) {
	const storage = storages[storage_id];
	storage.open = false;

	return addItem(storage.contents[storage.current_selection], -1, -1);
}

export function leaveStorage(storage_id) {
	storages[storage_id].open = false;
}

export function moveStorageSelection(storage_id, move) {
	const storage = storages[storage_id];

	if (storage.open) {
		const min_choice = 0;
		const max_choice = storage.max_choice - 1;
		let selection = storage.current_selection;

		if (move == direction.right) { selection++; }
		else if (move == direction.left) { selection--; }

		if (selection > max_choice) { selection = min_choice; }
		if (selection < min_choice) { selection = max_choice; }

		storage.current_selection = selection;
	}
}

export function moveBookSelection(move, selection, max_choice) {
	const min_choice = 0;

	if (move == direction.right) { selection++; }
	else if (move == direction.left) { selection--; }

	if (selection >= max_choice) { selection = max_choice - 1; }
	if (selection < min_choice) { selection = min_choice; }
    
	return selection;
}

export function getItemKey(x, y) {
	return ("" + x + "," + y); // key
}

export function getItem(x, y) {
	return items[getItemKey(x, y)];
}

export function removeItem(x, y) {
	let key = getItemKey(x, y);
	let tile = item_tiles[key];

	if (tile == undefined || tile == -1) {
		return;
	}

	removeItemFromMap(tile.is_counter, tile.x, tile.y);
	items[getItemKey(x, y)] = -1;
	item_tiles[getItemKey(x, y)].full = false;
}


// Player interaction cooking

export function cookTheItems(p_id, tile_key) {
	let tile = item_tiles[tile_key];

	if ((tile.tile_type == spots.fryer || tile.tile_type == spots.stove) && tile.full) {
		let cookery = items[getItemKey(tile.x, tile.y)];
		
		if (!cookery.cooked) {
			cookery = cookItems(p_id, cookery); // hmm confirm please
			setItemToMap(cookery.on_counter, cookery.spr, cookery.x, cookery.y);
		}
	}
}

function addFoodToContainer(p_id, recipe, container) {
	if (recipe == -1) {
		container.contents = item_key["not_food"];
		container.burned = true;
		container.spr = item_key[container.subtype + "_burned"];
	}
	else {
		container.contents = item_key[recipe];
		container.spr = item_key[container.subtype + "_cooked"];
	}
	
	container.chef = p_id;
	container.cooked = true;

	return container;
}

function cookItems(p_id, container) {
	if (!container.full || container.cooked) { return container; }

	let recipe = -1;

	if (container.subtype == "pot") {
		recipe = checkRecipe(container.contents, stove_recipes);
	}
	else if (container.subtype == "fry_tray") {
		recipe = checkRecipe(container.contents, fryer_recipes);
	}

	return addFoodToContainer(p_id, recipe, container);
}

function checkRecipe(contents, item_recipes) {
	for (const [key, recipe] of Object.entries(item_recipes)) {
		if (contents.length == recipe.length) {
			for (let j = 0; j < contents.length; j++) {
				let c1 = contents.filter((ingredient) => ingredient.spr == contents[j].spr);
				let c2 = recipe.filter((ingredient) => ingredient == contents[j].spr);

				if ((c1.length == 0 || c2.length == 0) 
					|| (c1.length != c2.length)) { 
					break; 
				}

				if (j == recipe.length - 1) { return key; }
			}
		}
	}

	return -1;
}


// DRAW START


function drawStorageMenu() {
	for (const [key, storage] of Object.entries(storages)) {
		if (storage.open) {
			const bg = 48;
			const arrow = 131;
			const offset_2 = -8;

			const currently_selected = storage.current_selection;

			sprite(arrow, storage.x * 8 - 8, storage.y * 8 + offset_2, true);
			sprite(arrow, storage.x * 8 + 8, storage.y * 8 + offset_2);

			sprite(bg, storage.x * 8, storage.y * 8 - 8);
			sprite(storage.contents[currently_selected], storage.x * 8, storage.y * 8 + offset_2);
		}
	}
}

export function drawRecipe(book) {
    const recipe_pages = book.pages;
	const recipes = book.recipes;
	const min_choice = 0;
    const max_choice = recipe_pages.length - 1;

    const currently_selected = book.current_selection;
    const recipe = recipe_pages[currently_selected];
	const recipe_contents = recipes[recipe];
    const recipe_image = item_key[recipe];

    const image_offset_y = -16;
	const bg = 48;
	const arrow = 131;

	// Recipe with arrows

    if (currently_selected !== min_choice) { // left
        sprite(arrow, book.x - 8, book.y + image_offset_y, true);
    }
	if (currently_selected !== max_choice) { // right
        sprite(arrow, book.x + 8, book.y + image_offset_y);
    }

    sprite(bg, book.x, book.y + image_offset_y);
    sprite(recipe_image, book.x, book.y + image_offset_y);

    drawContents(recipe_contents, bg, book.x, book.y, "book");
}

function drawContents(contents, bg, hx, hy, type) { // could just draw on a map and offset 
    const offset_y = -8;

	let offset_x = 9;
	let left_side = Math.floor(contents.length / 2);

	if (contents.length % 2 == 0) {
		left_side -= 1;
		hx -= 4;
	}

	let starting_offset = hx - (offset_x * left_side);

	if (type == "book") {
		for (let i = 0; i < contents.length; i++) {
			sprite(bg, starting_offset, hy + offset_y);
			sprite(contents[i], starting_offset, hy + offset_y);
			starting_offset += offset_x;
		}
	}
	else if (type == "cookery") {
		for (let i = 0; i < contents.length; i++) {
			sprite(bg, starting_offset, hy + offset_y);
			sprite(contents[i].spr, starting_offset, hy + offset_y);
			starting_offset += offset_x;
		}
	}
}

export function drawItemsInContainer(container) {
	const bg = 48;
	
    if (typeof container.contents == "number"){ // finished dish
        sprite(bg, container.x, container.y - 8);
        sprite(container.contents, container.x, container.y - 8);
        return;
    }

    if (container.contents.length == 0) { return; }

	drawContents(container.contents, bg, container.x, container.y, "cookery");
}

export function drawMenus() {
	drawStorageMenu();
}

export function drawTopItems() {
	draw(map_counter_item, 0, -2);
}

export function drawBottomItems() {
    draw(map_floor_item, 0, 0);
}

// DRAW END

export function resetItems() {
	for (const [key, item] of Object.entries(items)) {
		item = -1;
	}

	for (const [key, item_tile] of Object.entries(item_tiles)) {
		item_tile.full = false;
	}

	clearItemMaps();

	for (const [key, s] of Object.entries(storages)) {
		s.open = false;
		s.current_selection = 0;
	}

	spawnSpotItems();
}