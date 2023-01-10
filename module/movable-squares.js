
Hooks.on("init", () => {
    game.keybindings.register("movable-squares", "highlight", {
        name: "movable-squares.keybinding-highlight",
        editable: [
            { key: "KeyH" }
        ],
        onDown: (ctx) => {
            highlightSquares(canvas.tokens.controlled.find(t => t.document.sight.enabled) || (canvas.tokens.controlled.length && canvas.tokens.controlled[0]));
        },
        onUp: (ctx) => {
            releaseHighlight();
        }
    });

    game.settings.register("movable-squares", "step-count", {
        name: "movable-squares.setting-step-count",
        scope: "world",
        config: true,
        type: Number,
        range: {
            min: 1,
            max: 50,
            step: 1
        },
        default: 15
    });
    if (game.system.id === "dnd5e") {
        game.settings.register("movable-squares", "movement-limit", {
            name: "movable-squares.setting-movement-limit",
            scope: "world",
            config: true,
            type: Boolean,
            default: true
        });
    }
    game.settings.register("movable-squares", "fade-target", {
        name: "movable-squares.setting-fade-target",
        scope: "client",
        config: true,
        type: Number,
        range: {
            min: 0,
            max: 1,
            step: 0.1
        },
        default: 0.8
    });
    game.settings.register("movable-squares", "highlight-color", {
        name: "movable-squares.setting-highlight-color",
        scope: "client",
        config: true,
        type: String,
        choices: {
            white: "movable-squares.setting-color-white",
            red: "movable-squares.setting-color-red",
            yellow: "movable-squares.setting-color-yellow",
            orange: "movable-squares.setting-color-orange",
            green: "movable-squares.setting-color-green",
            cyan: "movable-squares.setting-color-cyan",
            blue: "movable-squares.setting-color-blue",
            purple: "movable-squares.setting-color-purple"
        },
        default: "white"
    });


});

const colors = {
    white: 0xffffff,
    red: 0xeb3434,
    yellow: 0xebeb34,
    orange: 0xeb9834,
    green: 0x4feb34,
    cyan: 0x34ebeb,
    blue: 0x3434eb,
    purple: 0xe534eb
};

let maxSteps = 15;
let fadeTarget = 0.8;
let color = 0xffffff;

async function highlightSquares(token) {
    if (canvas.grid.type !== CONST.GRID_TYPES.SQUARE) { return }
    if (!token || token.document.width != 1 || token.document.height != 1) { return }

    maxSteps = game.settings.get("movable-squares", "step-count") + 1;
    fadeTarget = game.settings.get("movable-squares", "fade-target");
    color = colors[game.settings.get("movable-squares", "highlight-color")] || colors.white;

    let steps = maxSteps;
    if (game.system.id === "dnd5e" && game.settings.get("movable-squares", "movement-limit")) {
        const movement = token.actor?.system.attributes.movement;
        const speeds = Object.keys(CONFIG.DND5E.movementTypes).map(k => movement[k]).filter(m => m);
        const speed = (Math.max(...speeds) || 0) / canvas.dimensions.distance;
        steps = speed + 1;
    }

    const gs = canvas.grid.size;

    const visitedSet = new Set([`${token.center.x}.${token.center.y}`]);
    let candidates = extendPositions(token.center, visitedSet, token);
    let step = 1;

    let matching = [];
    let delegated = [];
    while (candidates.length && step < steps) {
        matching = [];
        delegated = [];
        for (const candidate of candidates) {
            const dist = Math.floor(canvas.grid.measureDistance(token.center, candidate, { gridSpaces: true }) / canvas.dimensions.distance);
            if (dist <= step) {
                matching.push(candidate);
            } else {
                delegated.push(candidate);
            }
        }

        const alpha = (1 - (step-1)/(steps-1) * fadeTarget) * 0.5;
        doHighlight(step, matching, token, alpha);
        await delay(30);

        candidates = [...delegated, ...matching.flatMap(c => extendPositions(c, visitedSet, token))];

        step++;
    }
}

async function releaseHighlight() {
    for (let i = 1; i < maxSteps+1; i++) {
        const layerName = `movable-squares-${i}`;
        canvas.grid.destroyHighlightLayer(layerName);

        await delay(30);
    }
}

async function doHighlight(step, positions, token, alpha) {
    if (!positions || !positions.length) { return }
    const layerName = `movable-squares-${step}`;
    const hl = canvas.grid.addHighlightLayer(layerName);
    for (const pos of positions) {
        const x = pos.x - token.w * 0.5;
        const y = pos.y - token.h * 0.5;
        canvas.grid.grid.highlightGridPosition(hl, { x, y, color, alpha });
    }
    await delay(300);
}

function extendPositions(pos, visited, token) {
    const dims = canvas.dimensions;
    
    const adj = [
        { x: pos.x - dims.size, y: pos.y - dims.size },
        { x: pos.x            , y: pos.y - dims.size },
        { x: pos.x + dims.size, y: pos.y - dims.size },
        { x: pos.x - dims.size, y: pos.y             },
        { x: pos.x + dims.size, y: pos.y             },
        { x: pos.x - dims.size, y: pos.y + dims.size },
        { x: pos.x            , y: pos.y + dims.size },
        { x: pos.x + dims.size, y: pos.y + dims.size }
    ];
    const isSceneLit = !canvas.scene.tokenVision || (canvas.scene.globalLight && canvas.scene.darkness < 1);
    const res = adj.filter(p => {
        const isInsideScene = p.x >= 0 && p.x < dims.width && p.y >= 0 && p.y < dims.height;
        const isVisited = visited.has(`${p.x}.${p.y}`);
        const isMoveBlocked = CONFIG.Canvas.losBackend.testCollision(pos, p, { mode: "any", type: "move", source: token.document });
        const isVisionBlocked = CONFIG.Canvas.losBackend.testCollision(token.center, p, { mode: "any", type: "sight", source: token.document });
        const isDestinationVisible = canvas.effects.visibility.testVisibility(p, { tolerance: dims.size * 0.25 });

        return isInsideScene && !isVisited && !isMoveBlocked && (!token.hasSight || (!isVisionBlocked && (isSceneLit || isDestinationVisible)));
    });
    res.forEach(r => visited.add(`${r.x}.${r.y}`));
    return res;
}

async function delay(ms) {
    return new Promise(resolve => {
        setTimeout(() => resolve(), ms);
    })
}
