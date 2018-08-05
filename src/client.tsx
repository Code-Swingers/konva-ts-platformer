import React, { Component } from 'react';
import Konva from 'konva';
import { render } from 'react-dom';
import { Stage, Layer, Star, Text, Rect, Group} from 'react-konva';
import { Game } from './game';
import { GAME_LEVELS } from './gameLevels';
import { Player, Coin, Lava, GameActors, State } from './gameObjects';

let simpleLevelPlan = `
......................
..#................#..
..#..............=.#..
..#.........o.o....#..
..#.@......#####...#..
..#####............#..
......#++++++++++++#..
......##############..
......................`;

interface AppState {
  actors: GameActors
}

class App extends Component<{}, AppState> {
  game: Game;
  viewportWidth = 600;
  viewportHeight = 450;

  state = {
    scale: 20,
    actors: [] as GameActors,
  };

  componentWillMount() {
    this.game = new Game(GAME_LEVELS, this);
    this.game.runGame();
  }

  syncState(state: State) {
    this.drawActors(state.actors);
    this.scrollPlayerIntoView(state);
  }

  scrollPlayerIntoView(state: State) {
    let width = this.viewportWidth;
    let height = this.viewportHeight;
    let margin = width / 3;
  
    // The viewport
    // let left = this.dom.scrollLeft;
    // let right = left + width;

    // let top = this.dom.scrollTop;
    // let bottom = top + height;
  
    // let player = state.player;
    // let center = player.pos.plus(player.size.times(0.5)).times(this.state.scale);
  
    // if (center.x < left + margin) {
    //   this.dom.scrollLeft = center.x - margin;
    // } else if (center.x > right - margin) {
    //   this.dom.scrollLeft = center.x + margin - width;
    // }
    // if (center.y < top + margin) {
    //   this.dom.scrollTop = center.y - margin;
    // } else if (center.y > bottom - margin) {
    //   this.dom.scrollTop = center.y + margin - height;
    // }
  }

  drawActors(actors: GameActors) {
    this.setState({ actors });
    // return elt("div", {}, ...actors.map(actor => {
    //   let rect = elt("div", {
    //     class: `actor ${actor.type}`
    //   });
    //   rect.style.width = `${actor.size.x * scale}px`;
    //   rect.style.height = `${actor.size.y * scale}px`;
    //   rect.style.left = `${actor.pos.x * scale}px`;
    //   rect.style.top = `${actor.pos.y * scale}px`;
    //   return rect;
    // }));
  }
  
  clear() {

  }

  render() {
    const level = this.game.getLevelByPlan(simpleLevelPlan);

    return (
      <Stage width={this.viewportWidth} height={this.viewportHeight}>
        <Layer>
          { level.rows.map((r, colIdx) => {
            return r.map((elt, rowIndex) => {
              const key = `${colIdx}-${rowIndex}`;
              switch (elt) {
                case 'empty': {
                  return <Rect
                  key={key}
                  width={this.state.scale}
                  height={this.state.scale}
                  x={rowIndex * this.state.scale}
                  y={colIdx * this.state.scale}
                  fill="#777"
                  opacity={1}
                />;
                }
                case 'wall': {
                  return <Rect
                  key={key}
                  width={this.state.scale}
                  height={this.state.scale}
                  x={rowIndex * this.state.scale}
                  y={colIdx * this.state.scale}
                  fill="#ddd"
                  opacity={1}
                />;
                }
                case 'lava': {
                  return <Rect
                  key={key}
                  width={this.state.scale}
                  height={this.state.scale}
                  x={rowIndex * this.state.scale}
                  y={colIdx * this.state.scale}
                  fill="#ff0000"
                  opacity={1}
                />;
                }
              }

              return null;
            });
          }) }
        </Layer>
        <Layer>
        { this.state.actors.map((actor, index) => {
            if (actor instanceof Player) {
              return (
                <Rect
                  key={index}
                  width={actor.size.x * this.state.scale}
                  height={actor.size.y * this.state.scale}
                  x={actor.pos.x * this.state.scale}
                  y={actor.pos.y * this.state.scale}
                  fill="#000000"
                  opacity={1}
                />
              );
            }

            if (actor instanceof Coin) {
              return <Rect
                key={index}
                width={actor.size.x * this.state.scale}
                height={actor.size.x * this.state.scale}
                x={actor.pos.x * this.state.scale}
                y={actor.pos.y * this.state.scale}
                fill="#FFDF00"
                opacity={1}
              />
            }

            if (actor instanceof Lava) {
              return <Rect
                key={index}
                width={20}
                height={20}
                x={actor.pos.x * 20}
                y={actor.pos.y * 20}
                fill="#FF0000"
                opacity={1}
              />
            }
          }) }
        </Layer>
      </Stage>
    );
  }
}

render(<App />, document.getElementById('root'));
