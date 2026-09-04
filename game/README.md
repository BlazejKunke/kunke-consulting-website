# Metro

Build an underground railway for a large English city that has never had one and
does not obviously deserve one. The station names are terrible on purpose.

## Running it

Two ways, both offline. No build step, no dependencies, no internet.

**Double-click.** Open `game/index.html` in any modern browser. That is it.

**Or serve it**, which some browsers prefer:

```bash
npm run game            # from the repository root
# or
node game/serve.mjs     # then open http://localhost:4322
```

Progress is saved in the browser's local storage, on that machine only. It saves
at midnight of each game day, when you press `S`, and when you close the tab.

## The game

You start on 4 September 2025 with a budget and no railway. Twelve game hours
pass in six real minutes at 1x speed, so a full day takes twelve minutes.

Every journey you carry earns a fare plus a per-passenger subsidy from the
council, both paid out at midnight along with the running costs. **You cannot go
bankrupt.** If you end a day short, the borough quietly tops you up and never
mentions it again. You can only grow quickly or slowly.

The city has three kinds of district, and people move between them by hour of the
day, day of the week and time of year:

- **homes** send commuters out in the morning and take them back in the evening
- **commercial** fills up at 08:00 and empties at 17:00, and is busy all Saturday
- **industry** runs on shifts, starts earlier and is nearly dead on a Sunday

September is the busiest month of the year. August is the quietest. Nobody goes
anywhere on a Sunday morning.

People will walk about a kilometre to a station and no further, and they give up
if they queue for more than about twenty minutes. Giving up costs you money and
reputation, and reputation feeds back into how many people bother trying at all.

### Controls

| | |
|---|---|
| `Space` | pause and unpause (you can build while paused) |
| `1` `2` `3` `4` | 1x, 2x, 4x, 8x |
| `L` | new line |
| `Esc` | stop building |
| `A` `D` `N` | districts, demand overlay, station names |
| `S` | save |
| drag / scroll | pan / zoom |

Click **New line**, then click the map. Each click adds a station; click an
existing station to connect to it and make an interchange. The line grows from
whichever end is nearer your cursor. Track follows 45-degree geometry because
metro maps do, and crossing the river needs a bridge, which costs extra.

A line with no trains is drawn hollow and carries nobody.

### Names

Everything is renameable: click the city name, a line name, or a station. The
dice button next to each rolls a new one.

`game/data/names.js` holds 560-odd handwritten station names plus the parts the
generator recombines into several million more, along with the city names, line
names, newspaper headlines and daily events. It is plain data. Edit it, add your
own, delete the ones that go too far, and reload.

## Layout

```
game/
  index.html        the whole interface
  serve.mjs         dependency-free static server
  data/names.js     all the daft names, headlines and events
  src/config.js     every number worth arguing about: costs, fares, demand curves
  src/rng.js        seeded random + the name generator
  src/city.js       procedural city: river, districts, population
  src/network.js    stations, octilinear track, journey planning
  src/sim.js        clock, demand, trains, money  (no DOM: runs headless)
  src/render.js     the map
  src/ui.js         panels, dialogs, mouse and keyboard
  src/main.js       boot and the loop
  tools/balance.mjs a robot mayor that plays the game so the economy can be checked
```

To sanity-check the economy after changing anything in `config.js`:

```bash
node game/tools/balance.mjs 30      # 30 game days, printed one line per day
```

This is a standalone toy. It has nothing to do with the website in the rest of
this repository, shares no code with it, and is not deployed anywhere.
