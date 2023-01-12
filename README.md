# Movable Squares for the Foundry VTT

This module highlights the squares a token can move to. The highlight respects the vision and lighting of the scene and the selected token.

To highlight the movable area, select a token and press down the hot key (default H). The squares will stay lighlighted while the key is pressed down.

Additionally, a movement ruler can be placed down by clicking while the highlight is active. The ruler will behave normally thereafter, i.e. stay until right clicked away or moved along by pressing space.

### Settings

- The maximum number of steps of movement to check. This is mostly a computational requirement, but can be used by the GM to limit the extent of the effect. (GM only setting)
- For the dnd5e system, an option is available to limit the squares to those that are reachable using the fastest movement type of the token. (GM only setting)
- Also for the dnd5e system, a reading indicating the distance to the square hovered is displayed if the corresponding setting is enabled.
- The degree of fade applied to the highlight with distance can be set. If you are having trouble seeing the furthest squares, turn the fade down.
- The highlight is by default done in white, but you can change the color. This can sometimes help to better bring out the highlight or to contrast it with the background.

### Limitations and caveats

The highlight calculation is pretty computation intensive and I made some effort to keep it light. For this reason, it can occasionally get a square wrong when limiting to movement. The number displayed and the ruler drawn should always be accurate, however.

GMs should try this out on previously created scenes before adopting it for their game. There is very little in the regular module selection that would make the players
able to see some wall structures, e.g. some placed temporarily to not allow the PCs to move to a location tied to an event or some piece of narration. The highlight created by this module will give those things away if the players see the movable area end where they clearly have vision beyond.
