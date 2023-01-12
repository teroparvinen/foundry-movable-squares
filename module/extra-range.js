
const handlers = {}

let uiText = null;

export function startRanges() {
    handlers.mm = event => {
        uiText?.destroy();
        uiText = null;
    
        const token = canvas.tokens.controlled[0];
        if (token) {
            const gs = canvas.grid.size;
            const hs = gs * 0.5;
            const center = event.data.getLocalPosition(canvas.templates);
            const snapped = canvas.grid.getSnappedPosition(center.x, center.y, 2);
            const pos = { x: snapped.x, y: snapped.y };
            const distance = canvas.grid.measureDistance(token.center, pos, { gridSpaces: true });

            const units = canvas.scene.grid.units;
            const label = `${Math.round(distance * 100) / 100} ${units}`;
            uiText = canvas.interface.addChild(new PIXI.Text(label, CONFIG.canvasTextStyle));
            uiText.position.set(pos.x - uiText.width * 0.5, pos.y - uiText.height * 0.5);
        }
    }

    canvas.stage.on("mousemove", handlers.mm);
}

export function endRanges() {
    uiText?.destroy();
    uiText = null;
    canvas.stage.off("mousemove", handlers.mm);
}
