# Phrase Pocket design

An illustrated English adventure with seven topic-led worlds. The learner enters a small scene, discovers expressions, recalls them and uses them in conversation. A recurring lime speech-bubble companion, Dot, connects each world. No fox, snowy journal styling, paper stickers or hard offset card shadows.

The core identity is charcoal ink #242331, white surfaces, rounded panels, generous spacing and lime #D7EF91 for Dot. The topic changes the page tint, action color, selected navigation color and illustrated surroundings. Monday is Coffee Corner, Tuesday Riverside Walk, Wednesday Idea Studio, Thursday Rooftop Club, Friday Rainy Day Room, Saturday Next Stop Station and Sunday After Hours Arcade. Each illustration has distinct scenery rather than just a recolored background. Action colors are deliberately darker than illustration accents.

Palette roles follow the inspected Realtime Colors guidance (https://www.realtimecolors.com/): neutral text and surfaces, a readable primary action and separate decorative accents. Actual candidates are in src/styles/scene-palettes.css. Evaluate them in the real scenes and measure action/text contrast; palette swatches alone are not approval.

The current Brisbane day selects the home and quest world. Daily Three follows the selected lesson, including historical lessons; a missing new lesson never pretends that old content is new. Active practice retains its starting theme. Navigation, learning controls, memory-state colors and storage remain stable across worlds.

Desktop keeps a dark compact sidebar. Mobile keeps three thumb-accessible bottom destinations and safe-area spacing. Daily scenes lead into the existing three expressions. Dot offers an English conversation starter when tapped. Ambient motion can be paused and follows reduced-motion preferences. A completed scene celebrates participation; delayed independent recall remains the measure of memory.

All interface and educational copy is English. The first release includes seven scenes, companion interaction, a three-stage practice path and completion animation. Optional later additions include explorable maps and collectible outfits. They are not needed for the learning loop.

Phone-first refinements: the daily start action precedes the scene, saved days form a horizontal swipe strip, phrase cards use a readable single column, and text inputs are at least 16px to avoid focus zoom in iOS Safari. Decorative scenes are capped in height on phones; they never overlay answer controls. Desktop expands the daily scene and mission side by side.
