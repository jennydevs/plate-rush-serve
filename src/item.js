import { direction, spots, storage_type, 
	stove_recipes, fryer_recipes, one_ingredient_recipes, 
	liquid_fridge_contents, solid_fridge_contents, veggie_fridge_contents,
	dry_storage_contents, item_key, fryer_recipes_order, stove_recipes_order,
} from "./idkeys.js";
import { getMapTile, setMapTile, removeMapTile, map_item, 
	map_furniture, map_counter_item, map_floor_item, clearMap
} from "./map.js";
import { belts } from "./belt.js";

export let items = [];

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


function takeItemFromMap(on_counter, x, y) {
	on_counter ? removeMapTile(map_counter_item, x, y) : removeMapTile(map_floor_item, x, y);
}


function clearItemMaps() {
	clearMap(map_counter_item);
	clearMap(map_floor_item);
}

export function addItemWithScore(item_spr, spot, score) {
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

	spot.full = true;

	items.push(item);
	setItemToMap(item.on_counter, item.spr, item.x, item.y);

	return items.length - 1;
}


export function addItem(item_spr, spot) {
	let bottom_tile = checkBottomTile(spot);
	
	let item = {
		"spr": item_spr,
		"current_tile": bottom_tile[0],
		"tile_type": bottom_tile[1],
		"on_counter": bottom_tile[2],
		"type": "",
		"subtype": "",
	};

	if (spot == -1) { // hand
		item.x = -8; // no flickering when placed into hand
		item.y = -8; // temp out of screen
		item.on_counter = false;
	} else { // floor / counter
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
			item.book_pages = fryer_recipes_order;
			item.book_recipes = fryer_recipes;
			item.max_choice = fryer_recipes_order.length;
		}
		else if (item_spr == item_key["stove_book"]) {
			item.book_pages = stove_recipes_order;
			item.book_recipes = stove_recipes;
			item.max_choice = stove_recipes_order.length;
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

	items.push(item);
	setItemToMap(item.on_counter, item.spr, item.x, item.y);

	return items.length - 1; // testing
}


function checkBottomTile(spot) {
	if (typeof spot.id == "number") {
		return [spot.id, spot.tile_type, spot.is_counter]; 
	}
	
	return [-1, -1]; // problem here
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
				}
				else if (tile.sprite == spots.storage) {
					let storage_tile = getMapTile(map_furniture, j, i); 

					if (storage_tile.sprite == storage_type.liquid) {
						tile_spot.storage_contents = liquid_fridge_contents;
						tile_spot.max_choice = liquid_fridge_contents.length;
					}
					else if (storage_tile.sprite == storage_type.veggie) {
						tile_spot.storage_contents = veggie_fridge_contents;
						tile_spot.max_choice = veggie_fridge_contents.length;
					}
					else if (storage_tile.sprite == storage_type.solid) {
						tile_spot.storage_contents = solid_fridge_contents;
						tile_spot.max_choice = solid_fridge_contents.length;
					}
					else if (storage_tile.sprite == storage_type.dry) {
						tile_spot.storage_contents = dry_storage_contents;
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

function checkCanPlace(spot_type, item_type) {
	if (spot_type == spots.stove && item_type == "pot") {
		return true;
	}

	if (spot_type == spots.fryer && item_type == "fry_tray") {
		return true;
	}

	if (spot_type !== spots.sink && (spot_type == spots.item_spot || spot_type == spots.belt)) {
		return true;
	}

	return false;
}


function plateFood(holding_item, held_item, check_item) {
	if (check_item.subtype == "pot" || check_item.subtype == "fry_tray") {
		if (check_item.cooked) {
			held_item.spr = check_item.contents; // number
			held_item.subtype = "food";

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
				setItemToMap(check_item.on_counter, check_item.spr, check_item.x, check_item.y);
				throwAwayItem(locateHeldItemIndex());
				return [false, -1, check_item];
			}
		}
	}

	return [holding_item, held_item, check_item];
}

function pourIngredientsIn(held_item, check_item) {
	if (check_item == -1) {
		return [held_item, check_item];
	}

	for (let i = 0; i < held_item.contents.length; i++) {
		check_item.contents.push(held_item.contents[i]);
	}

	held_item.contents = [];
	held_item.full = false;

	if (check_item.contents.length !== 0) {
		check_item.full = true;
	}

	return [held_item, check_item];
}

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
	throwAwayItem(locateHeldItemIndex()); // simplify this
	held_item = -1;
	holding_item = false;

	return [holding_item, held_item, check_item];
}


function pickUpItem(holding_item, held_item, check_item, spot) {
	if (check_item == -1 || spot == -1) {
		return [held_item, check_item, spot];
	}

	if (check_item.spr == item_key["infinite_plates"]) { // hmm
		return [true, items[addItem(item_key["plate"], -1)], check_item, spot];
	}

	held_item = check_item;
	holding_item = true;
	
	held_item.tile_type = -1; // here too
	held_item.current_tile = -1;
	held_item.on_counter = false;

	takeItemFromMap(spot.is_counter, spot.x, spot.y);

	spot.full = false;

	return [holding_item, held_item, check_item, spot];
}


export function throwAwayItem(index) { // figure this out
	if ( index == -1 || typeof items[index] == "undefined") {
		console.log("Can't throw away", index)
		return;	
	}

	if (items[index].current_tile == -1 && items[index].tile_type == -1) {
		items.splice(index, 1);
	} else {
		let tile = getMapTile(map_item, items[index].x, items[index].y);
		tile.full = false;
		takeItemFromMap(items[index].on_counter, items[index].x, items[index].y);
		let test = items.splice(index, 1);
		console.log("Thrown away: ",test)
	}
}

function trashCanSpot(holding_item, held_item) {
	if (!holding_item || held_item.type == "book") {
		return [holding_item, held_item];
	}

	if (held_item.type == "cookery") {
		if (held_item.subtype == "container") {
			held_item.contents = [];
			held_item.full = false;

			return [holding_item, held_item];
		}


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

	throwAwayItem(locateHeldItemIndex()); // update hmm

	holding_item = false;
	held_item = -1;
	
	return [holding_item, held_item];
}


function addPlateProperties() {

}

function placeHeldItem(held_item, spot) {
	held_item.x = spot.x;
	held_item.y = spot.y;
	held_item.current_tile = spot.id;
	held_item.tile_type = spot.tile_type;
	held_item.on_counter = spot.is_counter;

	setItemToMap(held_item.on_counter, held_item.spr, held_item.x, held_item.y);

	return true;
}


function interactSpot(tile_spots, tile_id, holding_item, held_item) {
	let spot = tile_spots[tile_id];

	if (holding_item) {
		if (!spot.full) {
			if (checkCanPlace(spot.tile_type, held_item.subtype)) {
				spot.full = placeHeldItem(held_item, spot);
				
				return [false, -1];
			}
		}

		if (spot.full) {
			let check_item = collectItem(spot.id, spot.tile_type);

			if (check_item == -1) {
				return [holding_item, held_item];
			}

			if (check_item.type == "cookery") {
				if (held_item.type == "cookery"
					|| held_item.type == "book"
					|| held_item.type == "food") {
					return [holding_item, held_item];
				}

				if (held_item.subtype == "plate") {
					let result = plateFood(holding_item, held_item, check_item);
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
				let result = plateFood(holding_item, held_item, check_item);
				holding_item = result[0];
				held_item = result[1];
				check_item = result[2];

				return [holding_item, held_item];
			}
		}
	}

	if (!holding_item) {
		if (spot.full) {
			let check_item = collectItem(spot.id, spot.tile_type);
			
			if (check_item == -1) { // when the spot was not set to full this was the issue check_item
				return [holding_item, held_item];
			}

			let result = pickUpItem(holding_item, held_item, check_item, spot);
			holding_item = result[0];
			held_item = result[1];
			check_item = result[2];
			spot = result[3];

			return [holding_item, held_item];
		}
	}

	return [holding_item, held_item];
}

export function checkStorage(tile, holding_item) {
	if (tile.sprite == spots.storage) {
		if (!holding_item) {
			for (let i = 0; i < storage.length; i++) {
				if (storage[i].id == tile.id && !storage[i].open) {
					storage[i].open = true;
					return storage[i].id;
				}
			}
		}
	}
	return -1;
}

export function confirmFront(tile, held_item, holding_item) {	
	if (tile.sprite == spots.trashcan) {
		return trashCanSpot(holding_item, held_item);
	}
	else if (tile.sprite == spots.stove 
		|| tile.sprite == spots.fryer 
		|| tile.sprite == spots.item_spot) {
		return interactSpot(item_tiles, tile.id, holding_item, held_item);
	}
	else if (tile.sprite == spots.belt) {
		return interactSpot(belts, tile.id, holding_item, held_item);
	}

    return [holding_item, held_item];
}

export function grabStorageItem(storage_id) {
	const current_storage = storage[storage_id];
	const current_storage_contents = current_storage.storage_contents;
	const currently_selected = current_storage.current_selection;

	const index = addItem(current_storage_contents[currently_selected], -1);

	current_storage.open = false;

	return [true, items[index], false];
}


export function leaveStorage(storage_id) {
	const current_storage = storage[storage_id];
	current_storage.open = false;
}


export function moveStorageSelection(storage_id, move) {
	const current_storage = storage[storage_id];
	if (current_storage.open) {
		let selection = storage[storage_id].current_selection;
		const min_choice = 0;
		const max_choice = storage[storage_id].max_choice;

		if (move == direction.right) {
			selection++;
			if (selection >= max_choice) { selection = max_choice - 1; }
		}
		else if (move == direction.left) {
			selection--;
			if (selection < min_choice) { selection = min_choice; }
		}

		current_storage.current_selection = selection;
	}
}

export function moveBookSelection(move, selection, max_choice) {
	const min_choice = 0;

	if (move == direction.right) {
		selection++;
		if (selection >= max_choice) { selection = max_choice - 1; }
	}
	else if (move == direction.left) {
		selection--;
		if (selection < min_choice) { selection = min_choice; }
	}
    
	return selection;
}





export function getItemOnTile(x, y) {
	for (let i = 0; i < items.length; i++) {
		if (x == items[i].x && y == items[i].y) {
			return i;
		}
	}
	
	return -1;
}

function collectItem(spot_id, spot_type) {
	for (let i = 0; i < items.length; i++) {
		if (items[i].current_tile == spot_id && items[i].tile_type == spot_type) {
			return items[i];
		}
	}
}


export function locateHeldItemIndex() { // for hand atm // get the index of the item first?
	for (let i = 0; i < items.length; i++) {
		if (items[i].current_tile == -1 && items[i].tile_type == -1) {
			return i;
		}
	}
	return -1;
}




// player interaction
export function cookTheItems(p_id, tile_id) {
	let tile = item_tiles[tile_id];

	if ((tile.tile_type == spots.fryer || tile.tile_type == spots.stove) && tile.full) {
		for (let i = 0; i < cookery.length; i++) {
			if (cookery[i].x == tile.x && cookery[i].y == tile.y) {
				if (!cookery[i].cooked) {
					cookery[i] = cookItems(p_id, cookery[i]);
					setItemToMap(cookery[i].on_counter, cookery[i].spr, cookery[i].x, cookery[i].y);
					break;
				}
			}
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
	if (!container.full || container.cooked) {
		return container;
	}

	let recipe = -1;

	if (container.subtype == "pot") {
		recipe = checkRecipe(container.contents, stove_recipes);
	}
	else if (container.subtype == "fry_tray") {
		recipe = checkRecipe(container.contents, fryer_recipes);
	}

	return addFoodToContainer(p_id, recipe, container);
}


function checkRecipe(contents, recipe_type) {
	let item_recipes = recipe_type;

	for (const [key, recipe] of Object.entries(item_recipes)) {
		if (contents.length == recipe.length) {
			for (let j = 0; j < contents.length; j++) {
				let c1 = contents.filter((ingredient) => ingredient.spr == contents[j].spr);
				let c2 = recipe.filter((ingredient) => ingredient == contents[j].spr);

				if ((c1.length == 0 || c2.length == 0) || (c1.length != c2.length)) {
					break;
				}

				if (j == recipe.length - 1) {
					return key;
				}
			}
		}
	}

	return -1;
}


function drawStorageMenu() {
	for (let i = 0; i < storage.length; i++) {
		if (storage[i].open) {
			const current_storage = storage[i].storage_contents;
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

export function drawRecipe(held_item) {
    const book_recipe_pages = held_item.book_pages;
	const book_recipes = held_item.book_recipes;
	const min_choice = 0;
    const max_choice = book_recipe_pages.length;

    const currently_selected = held_item.current_selection;
    const recipe = book_recipe_pages[currently_selected];
	const recipe_contents = book_recipes[recipe];
    const recipe_image = item_key[recipe];
    const recipe_length = recipe_contents.length;

    const left_side = Math.floor(recipe_length / 2);
    let offset_x = 0;
    const offset_y = -8;
    const image_offset_y = -16;
	const bg = 48;
	const arrow = 131;

	// Recipe with arrows

    if (currently_selected !== min_choice) { // left
        sprite(arrow, held_item.x - 8, held_item.y + image_offset_y, true);
    }
	if (currently_selected !== max_choice - 1) { // right
        sprite(arrow, held_item.x + 8, held_item.y + image_offset_y);
    }

    sprite(bg, held_item.x, held_item.y + image_offset_y);
    sprite(recipe_image, held_item.x, held_item.y + image_offset_y);

	// Recipe contents

    if (recipe_length % 2 == 0) { // Even ingredients
        offset_x = 9;
        let starting_offset = (held_item.x - 4) - (offset_x * (left_side - 1));

        for (let i = 0; i < recipe_length; i++) {
            sprite(bg, starting_offset, held_item.y + offset_y);
            sprite(recipe_contents[i], starting_offset, held_item.y + offset_y);
            starting_offset += offset_x;
        }
    }
    else { // Odd ingredients
        offset_x = 9;
        let starting_offset = held_item.x - (offset_x * left_side);

        for (let i = 0; i < recipe_length; i++) {
            sprite(bg, starting_offset, held_item.y + offset_y);
            sprite(recipe_contents[i], starting_offset, held_item.y + offset_y);
            starting_offset += offset_x;
        }
    }  
}

// can split into another function

export function drawItemsInContainer(held_item) {
	const bg = 48;
	
    if (typeof held_item.contents == "number"){ // finished dish
        sprite(bg, held_item.x, held_item.y - 8);
        sprite(held_item.contents, held_item.x, held_item.y - 8);

        return;
    }

	// Ingredients

    let num = held_item.contents.length;
    if (num == 0) {
        return;
    }

    const left_side = Math.floor(num / 2);
    let offset_x = 0;
    let offset_y = -8;

    if (num % 2 == 0) {
        offset_x = 9;
        let extra_offset = 0;

        let starting_offset = (held_item.x - 4) - (offset_x * (left_side - 1));

        for (let i = 0; i < num; i++) {
            sprite(bg, starting_offset + extra_offset, held_item.y + offset_y);
            sprite(held_item.contents[i].spr, starting_offset + extra_offset, held_item.y + offset_y);

            starting_offset += offset_x;
        }
    }
    else {
        offset_x = 9;

        let starting_offset = held_item.x - (offset_x * left_side);

        for (let i = 0; i < num; i++) {
            sprite(48, starting_offset, held_item.y + offset_y);
            sprite(held_item.contents[i].spr, starting_offset, held_item.y + offset_y);
            starting_offset += offset_x;
        }
    }
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