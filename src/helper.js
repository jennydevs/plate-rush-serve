var previousTime = Date.now();

export function delta() {
    var now = Date.now();
    var deltaTime = now - previousTime;
    previousTime = now;
    
    return deltaTime * 0.01;
}


export function countProperties(obj) {
    let counter = 0;

    for (const [key, item] of Object.entries(obj)) {
        counter++;
    }

    return counter;
}