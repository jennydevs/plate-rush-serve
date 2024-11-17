export const item_key = {
    "bowl_full": 84,
    "fry_tray": 114,
    "fry_tray_burned": 116,
    "fry_tray_cooked": 117,
	"fry_tray_full": 115,
    "pot": 119,
    "pot_cooked": 121,
    "pot_burned": 105,
    "pot_full": 120,
    "bowl": 83,
    "plate": 91,
    "drink_book": 112,
    "fryer_book": 113,
    "stove_book": 129,
    "apple_plate": 227,
    "cake_slice": 230,
    "candy_plate": 232,
    "cherry_plate": 228,
    "cupcake": 231,
    "egg_rice": 224,
	"flan": 233,
    "fried_egg": 237,
    "fried_shrimp": 225,
    "kebab": 234,
    "not_food": 236,
	"pizza": 235,
    "soup": 229,
	"sushi": 226,
    "coffee": 160,
    "ice_cream": 165,
	"milk": 162,
    "soda": 161,
    "tea": 166,
    "water": 163,
    "wine": 164,
    "apple": 198,
    "butter": 177,
    "candy": 204,
    "cheese": 197,
    "chocolate": 184,
    "cherry": 199,
    "coffee_beans": 196,
	"crab_meat": 185,
    "cucumber": 176,
    "egg": 182,
    "flour": 195,
    "frosting": 186,
    "oil": 191,
	"sugar": 167,
    "ketchup": 183,
    "meat": 201,
    "milk": 162,
    "nori": 181,
    "pepper": 189,
    "rice": 194,
	"salt": 179,
    "shrimp": 192,
    "spring_onion": 190,
    "tomato": 188,
	"water": 163,
    "money": 154,
    "infinite_plates": 75,
};

export const key_name = {};

export function setUpKeyNames() {
    for (const [key, item] of Object.entries(item_key)) {
        key_name[item] = key;
    }
}

export const direction = {
    "right": 0,
    "left": 1,
    "up": 2,
    "down": 3,
};

// physical places
export const spots = {
    "belt": 37,
    "item_spot": 7,
    "storage": 8,
    "fryer": 23,
    // "seat": 34,
    "stove": 22,
    "trashcan": 21,
    "sink": 38,
    "counter": 135, // not part of the arrows
    "side_counter": 151, // not part of the arrows
    "belt_table": 55,  // not part of the arrows
    "belt_outer_table": 53,  // not part of the arrows

};


export const storage_type = {
	"liquid": 82,
	"solid": 96,
    "veggie": 80,
    "dry": 133,
};

export const fryer_recipes_order = [
    "fried_shrimp",
];

export const stove_recipes_order = [
    "cake_slice",
    "egg_rice",
	"flan",
    "fried_egg",
    "kebab",
	"pizza",
    "soup",
	"sushi",
];

export const stove_recipes = {
    "cake_slice": [item_key.flour, item_key.egg, item_key.milk, item_key.frosting],
    "egg_rice": [item_key.egg, item_key.ketchup, item_key.rice],
    "flan": [item_key.egg, item_key.milk, item_key.sugar],
    "fried_egg": [item_key.egg],
    "kebab": [item_key.meat, item_key.tomato, item_key.spring_onion],
    "pizza": [item_key.flour, item_key.cheese, item_key.tomato],
    "soup": [item_key.egg, item_key.tomato, item_key.water],
    "sushi": [item_key.nori, item_key.crab_meat, item_key.rice],
};

export const fryer_recipes = {
    "fried_shrimp": [item_key.shrimp, item_key.flour],
};

export const one_ingredient_recipes = {
    "cherry_plate": item_key.cherry,
    "apple_plate": item_key.apple,
    "candy_plate": item_key.candy,
};


// storage contents list

export const liquid_fridge_contents = [
    item_key.coffee,
    item_key.ice_cream,
    item_key.milk,
	item_key.soda,
	item_key.tea,
    item_key.water,
    item_key.wine,
];

export const solid_fridge_contents = [
    item_key.butter,
    item_key.cheese,
    item_key.crab_meat,
    item_key.egg,
    item_key.frosting,
    item_key.meat,
    item_key.rice,
	item_key.shrimp,
];

export const dry_storage_contents = [
    item_key.candy,
    item_key.flour,
    item_key.ketchup,
    item_key.nori,
    item_key.sugar,
];

export const veggie_fridge_contents = [
    item_key.apple,
    item_key.cherry,
    item_key.spring_onion,
    item_key.tomato,
];


// storage contents end


export const npc_list = [
    78,
    79,
    // 94,
    95,
    109,
    111,
    // 124,
    125,
    141,
    142,
    143,
    // 157,
    158,
    159,
];

export const npc_spots = {
    "seat": 34,
    "walk": 23,
    "spawnable": 22,
    "belt": 37,
    "table":7,
};

export const food_orders = [
    item_key.apple_plate,
    item_key.cake_slice,
    item_key.candy_plate,
    item_key.cherry_plate,
    item_key.egg_rice,
	item_key.flan,
    item_key.fried_egg,
    item_key.fried_shrimp,
    item_key.kebab,
	item_key.pizza,
    item_key.soup,
	item_key.sushi,
];

export const drink_orders = [
    item_key.coffee,
    item_key.soda,
    item_key.milk,
    item_key.water,
    item_key.wine,
    item_key.ice_cream,
    item_key.tea,
];

export const item_scores = {};
item_scores[item_key.apple_plate] = 1;
item_scores[item_key.cake_slice] = 6;
item_scores[item_key.candy_plate] = 1
item_scores[item_key.cherry_plate] = 1;
item_scores[item_key.egg_rice] = 4;
item_scores[item_key.flan] = 4;
item_scores[item_key.fried_egg] = 2;
item_scores[item_key.fried_shrimp] = 3;
item_scores[item_key.kebab] = 4;
item_scores[item_key.pizza] = 4;
item_scores[item_key.soup] = 4;
item_scores[item_key.sushi] = 4;
item_scores[item_key.coffee] = 1;
item_scores[item_key.soda] = 1;
item_scores[item_key.milk] = 1;
item_scores[item_key.water] = 1;
item_scores[item_key.wine] = 1;
item_scores[item_key.ice_cream] = 1;
item_scores[item_key.tea] = 1;


export const score = {
    "money": 154,
};
