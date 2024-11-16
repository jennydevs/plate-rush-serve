import { 
	direction, spots, storage_type, item_key,
	stove_recipes, fryer_recipes, one_ingredient_recipes, 
	liquid_fridge_contents, solid_fridge_contents, veggie_fridge_contents, dry_storage_contents, 
	fryer_recipes_order, stove_recipes_order,
} from "./idkeys.js";
import { 
	getMapTile, setMapTile, removeMapTile, map_item, 
	map_furniture, map_counter_item, map_floor_item, clearMap
} from "./map.js";
import { belts } from "./belt.js";
import { removeHeldItem } from "./player.js";

export let items = {};

export const item_tiles = [];
const storage = [];
const cookery = [];

export function setUpItems() {
    addItemTileIds();

	addItem(item_key["pot"], belts[0]);
	addItem(item_key["pot"], belts[3]);
	addItem(item_key["fry_tray"], belts[8]);
	addItem(item_key["fryer_book"], belts[5]);
	addItem(item_key["stove_book"], belts[10]);
	addItem(item_key["infinite_plates"], belts[12]);
}


function setItemToMap(on_counter, spr, x, y) {
	on_counter ? setMapTile(map_counter_item, spr, x, y) : setMapTile(map_floor_item, spr, x, y);
}


function removeItemFromMap(on_counter, x, y) {
	on_counter ? removeMapTile(map_counter_item, x, y) : removeMapTile(map_floor_item, x, y);
}


function clearItemMaps() {
	clearMap(map_counter_item);
	clearMap(map_floor_item);
}

export function addItemWithScore(item_spr, spot, score) {
	if (spot == undefined) {
		return;
	}

	let bottom_tile = checkBottomTile(spot);
	
	let item = {
		"spr": item_spr,
		"current_tile": bottom_tile[0],
		"tile_type": bottom_tile[1],
		"on_counter": bottom_tile[2],
		"x": spot.x,
		"y": spot.y,
		"score": score,
		"type": "money",
		"subtype": "",
	};

	spot.full = true; // hmm

	items[getItemKey(item.x, item.y)] = item;
	setItemToMap(item.on_counter, item.spr, item.x, item.y);
}

export function addItem(item_spr, spot) {
	if (spot == undefined) {
		return;
	}

	let bottom_tile = checkBottomTile(spot);

	let item = {
		"spr": item_spr,
		"current_tile": bottom_tile[0],
		"tile_type": bottom_tile[1],
		"on_counter": bottom_tile[2],
		"x": -8,
		"y": -8,
		"type": "",
		"subtype": "",
	};

	if (spot !== -1) {
		item.x = spot.x;
		item.y = spot.y;
		spot.full = true;
	}
	
	if (item_spr == item_key["pot"]
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

		cookery.push(item);
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


function checkBottomTile(spot) {
	if (typeof spot.id == "number") {
		return [spot.id, spot.tile_type, spot.is_counter]; 
	}
	
	return [-1, -1, false];
}

function addItemTileIds() {
	let map_width = 16;
	let map_height = 16;

    let id_counter = 0;
	let storage_counter = 0;
    
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
					tile.id = id_counter;

					tile_spot.id = id_counter;
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

                	id_counter++;
					
                	item_tiles.push(tile_spot);
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

					tile_spot.id = storage_counter;
					tile.id = storage_counter;

					storage_counter++;
					storage.push(tile_spot);
				}
			}
        }
    }
}

function checkCanPlace(spot, item_subtype) {
	if (spot.full) {
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

function checkCanPickUp(spot) {
	if (spot == -1) {
		return false;
	}

	return spot.full;
}


function plateFood(p_id, holding_item, held_item, check_item) {
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
				let result = removeHeldItem();
				return [result.holding_item, result.held_item, check_item];
			}
		}
	}

	return [holding_item, held_item, check_item];
}

// function pourIngredientsIn(held_item, check_item) {
// 	if (check_item == -1) {
// 		return [held_item, check_item];
// 	}

// 	for (let i = 0; i < held_item.contents.length; i++) {
// 		check_item.contents.push(held_item.contents[i]);
// 	}

// 	held_item.contents = [];
// 	held_item.full = false;

// 	if (check_item.contents.length !== 0) {
// 		check_item.full = true;
// 	}

// 	return [held_item, check_item];
// }

function putIngredientIn(holding_item, held_item, check_item) {
	if (check_item == -1 || (check_item.cooked || check_item.burned)) {
		return [holding_item, held_item, check_item];
	}

	if (!check_item.full) {
		check_item.spr = item_key[check_item.subtype + "_full"];
	}

	setItemToMap(check_item.on_counter, check_item.spr, check_item.x, check_item.y);

	check_item.contents.push(held_item);
	check_item.full = true;
	let result = removeHeldItem();

	return [result.holding_item, result.held_item, check_item];
}


function pickUpItem(spot) {
	let front_item = getItem(spot.x, spot.y);

	if (front_item.spr == item_key["infinite_plates"]) {
		return [addItem(item_key["plate"], -1), true];
	}

	removeItem(spot, front_item.x, front_item.y);

	front_item.current_tile = -1;
	front_item.tile_type = -1;
	front_item.x = -8;
	front_item.y = -8;
	front_item.on_counter = false;

	return [front_item, false];
}


function trashCanSpot(holding_item, held_item) {
	if (!holding_item || held_item.type == "book") {
		return [holding_item, held_item];
	}

	if (held_item.type == "cookery") {
		// if (held_item.subtype == "container") {
		// 	held_item.contents = [];
		// 	held_item.full = false;

		// 	return [holding_item, held_item];
		// }

		held_item.spr = item_key[held_item.subtype];
		held_item.contents = [];
		held_item.full = false;
		held_item.cooked = false;
		held_item.burned = false;
		held_item.chef = -1;

		return [holding_item, held_item];
	}

	if (held_item.subtype == "food") {
		held_item.spr = item_key["plate"];
		held_item.type = "serve";
		held_item.subtype = "plate";

		return [holding_item, held_item];
	}

	let result = removeHeldItem();
	
	return [result.holding_item, result.held_item];
}


function addPlateProperties() {

}

function placeItem(item, spot) {
	item.x = spot.x;
	item.y = spot.y;
	item.current_tile = spot.id;
	item.tile_type = spot.tile_type;
	item.on_counter = spot.is_counter;

	items[getItemKey(spot.x, spot.y)] = item;

	setItemToMap(item.on_counter, item.spr, item.x, item.y);

	return true;
}


function interactSpot(p_id, tile_spots, tile_id, holding_item, held_item) {
	let spot = tile_spots[tile_id];

	if (holding_item) {
		if (checkCanPlace(spot, held_item.subtype)) {
			spot.full = placeItem(held_item, spot);
			return [false, -1];
		}

		if (spot.full) {
			let check_item = getItem(spot.x, spot.y);

			if (check_item.type == "cookery") {
				if (held_item.type == "cookery"
					|| held_item.type == "book"
					|| held_item.type == "food") {
					return [holding_item, held_item];
				}

				if (held_item.subtype == "plate") {
					let result = plateFood(p_id, holding_item, held_item, check_item);
					holding_item = result[0];
					held_item = result[1];
					check_item = result[2];
				}
				else {
					let result = putIngredientIn(holding_item, held_item, check_item);
					holding_item = result[0];
					held_item = result[1];
					check_item = result[2];
				}

				return [holding_item, held_item];
			}

			if (check_item.subtype == "plate") {
				let result = plateFood(p_id, holding_item, held_item, check_item);
				holding_item = result[0];
				held_item = result[1];
				check_item = result[2];

				return [holding_item, held_item];
			}
		}
	}

	if (!holding_item 
		&& checkCanPickUp(spot)) {
		let result = pickUpItem(spot);
		held_item = result[0];
		spot.full = result[1];

		return [true, held_item];
	}

	return [holding_item, held_item];
}

export function checkStorage(tile, holding_item) {
	if (tile.sprite == spots.storage 
		&& !holding_item) {
		for (let i = 0; i < storage.length; i++) {
			if (storage[i].id == tile.id && !storage[i].open) {
				storage[i].open = true;
				return storage[i].id;
			}
		}
	}

	return -1;
}

export function confirmFront(p_id, tile, held_item, holding_item) {	
	if (tile.sprite == spots.stove 
		|| tile.sprite == spots.fryer 
		|| tile.sprite == spots.item_spot) {
		return interactSpot(p_id, item_tiles, tile.id, holding_item, held_item);
	}
	else if (tile.sprite == spots.belt) {
		return interactSpot(p_id, belts, tile.id, holding_item, held_item);
	}
	else if (tile.sprite == spots.trashcan) {
		return trashCanSpot(holding_item, held_item);
	}

    return [holding_item, held_item];
}

export function grabStorageItem(storage_id) {
	const current_storage = storage[storage_id];
	const current_storage_contents = current_storage.contents;
	const currently_selected = current_storage.current_selection;

	const item = addItem(current_storage_contents[currently_selected], -1);

	current_storage.open = false;

	return [true, item, false];
}

export function leaveStorage(storage_id) {
	storage[storage_id].open = false;
}

export function moveStorageSelection(storage_id, move) {
	const current_storage = storage[storage_id];

	if (current_storage.open) {
		const min_choice = 0;
		const max_choice = current_storage.max_choice - 1;
		let selection = current_storage.current_selection;

		if (move == direction.right) { selection++; }
		else if (move == direction.left) { selection--; }

		if (selection >= max_choice) { selection = max_choice; }
		if (selection < min_choice) { selection = min_choice; }

		current_storage.current_selection = selection;
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

export function removeItem(spot, x, y) {
	// getMapTile(map_item, x, y).full = false;

	spot.full = false; // hmm
	removeItemFromMap(spot.is_counter, spot.x, spot.y); // hmmm
	items[getItemKey(x, y)] = -1;
}


// Player interaction cooking

export function cookTheItems(p_id, tile_id) {
	let tile = item_tiles[tile_id];

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
	for (let i = 0; i < storage.length; i++) {
		if (storage[i].open) {
			const current_storage = storage[i].contents;
			const bg = 48;
			const arrow = 131;

			const currently_selected = storage[i].current_selection;
			const min_choice = 0;
			const max_choice = storage[i].max_choice;

			if (currently_selected !== min_choice) { // left
				sprite(arrow, storage[i].x * 8 - 8, storage[i].y * 8 - 8, true);
			}
			if (currently_selected !== max_choice - 1) { // right
				sprite(arrow, storage[i].x * 8 + 8, storage[i].y * 8 - 8);
			}

			sprite(bg, storage[i].x * 8, storage[i].y * 8 - 8);
			sprite(current_storage[currently_selected], storage[i].x * 8, storage[i].y * 8 - 8);
		}
	}
}

export function drawRecipe(book) {
    const recipe_pages = book.pages;
	const recipes = book.recipes;
	const min_choice = 0;
    const max_choice = recipe_pages.length;

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
	if (currently_selected !== max_choice - 1) { // right
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

export function printItems() {
	console.log(items);
}

export function resetItems() {
	clearItemMaps();
	items = [];

	for (let i = 0; i < item_tiles.length; i++) {
		item_tiles[i].full = false;
	}

	addItem(item_key["pot"], belts[0]);
	addItem(item_key["pot"], belts[3]);
	addItem(item_key["fry_tray"], belts[8]);
	addItem(item_key["fryer_book"], belts[5]);
	addItem(item_key["stove_book"], belts[10]);
	addItem(item_key["infinite_plates"], belts[12]);
}