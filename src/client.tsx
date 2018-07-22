import React, { Component } from 'react';
import Konva from 'konva';
import { render } from 'react-dom';
import { Stage, Layer, Star, Text, Rect} from 'react-konva';
import { Game } from './game';
import { GAME_LEVELS } from './gameLevels';
import { Player, Coin, Lava } from './gameObjects';

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

class App extends Component {
  game: Game;
  componentWillMount() {
    this.game = new Game(GAME_LEVELS, null);
  }
  handleDragStart = (e: any) => {
    e.target.setAttrs({
      shadowOffset: {
        x: 15,
        y: 15
      },
      scaleX: 1.1,
      scaleY: 1.1
    });
  };
  handleDragEnd = (e: any) => {
    e.target.to({
      duration: 0.5,
      easing: Konva.Easings.ElasticEaseOut,
      scaleX: 1,
      scaleY: 1,
      shadowOffsetX: 5,
      shadowOffsetY: 5
    });
  };
  render() {
    const level = this.game.getLevelByPlan(simpleLevelPlan);

    return (
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          { level.rows.map((r, colIdx) => {
            return r.map((elt, rowIndex) => {
              const key = `${colIdx}-${rowIndex}`;
              switch (elt) {
                case 'empty': {
                  return <Rect
                  key={key}
                  width={20}
                  height={20}
                  x={rowIndex * 20}
                  y={colIdx * 20}
                  fill="#777"
                  opacity={1}
                />;
                }
                case 'wall': {
                  return <Rect
                  key={key}
                  width={20}
                  height={20}
                  x={rowIndex * 20}
                  y={colIdx * 20}
                  fill="#ddd"
                  opacity={1}
                />;
                }
                case 'lava': {
                  return <Rect
                  key={key}
                  width={20}
                  height={20}
                  x={rowIndex * 20}
                  y={colIdx * 20}
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
        { level.startActors.map((actor, index) => {
            if (actor instanceof Player) {
              return <Rect
                key={index}
                width={20}
                height={20}
                x={actor.pos.x * 20}
                y={actor.pos.y * 20}
                fill="#000000"
                opacity={1}
              />
            }

            if (actor instanceof Coin) {
              return <Rect
                key={index}
                width={20}
                height={20}
                x={actor.pos.x * 20}
                y={actor.pos.y * 20}
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
