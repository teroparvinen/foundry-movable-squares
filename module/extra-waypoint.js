
const handlers = {}

export function startWaypoints() {
    handlers.lc = event => {
        const token = canvas.tokens.controlled[0];
        if (token) {
            const isStarted = canvas.controls.ruler.waypoints.length;
            if (!isStarted) {
                canvas.controls.ruler._addWaypoint(token.center);
            }

            canvas.controls.ruler._addWaypoint(event.data.origin);
            canvas.controls.ruler.measure(event.data.origin);
        }
    }

    handlers.rc = event => {
        if (canvas.controls.ruler.waypoints.length > 1) {
            canvas.controls.ruler._removeWaypoint(canvas.controls.ruler.waypoints[canvas.controls.ruler.waypoints.length - 2]);
        } else {
            canvas.controls.ruler._endMeasurement();
        }
    }

    canvas.stage.removeAllListeners("rightdown");
    canvas.stage.on("mousedown", handlers.lc);
    canvas.stage.on("rightdown", handlers.rc);
}

export function endWaypoints() {
    canvas.stage.off("mousedown", handlers.lc);
    canvas.stage.off("rightdown", handlers.rc);
    canvas.mouseInteractionManager._activateClickEvents();
}
