import React, { Component } from 'react';
import Konva from 'konva';
import { render } from 'react-dom';
import { Stage, Layer, Star, Text, Rect, Group} from 'react-konva';
import { Game } from './game';
import { GAME_LEVELS } from './gameLevels';
import { Player, Coin, Lava, GameActors, State, Level, GameActor } from './gameObjects';

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
  actors: GameActors;
  level: Level;
}

class App extends Component<{}, AppState> {
  game: Game;
  viewportWidth = 600;
  viewportHeight = 450;

  state = {
    scale: 20,
    actors: [] as GameActors,
    level: { rows: [] } as Level,
  };

  componentWillMount() {
    this.game = new Game(GAME_LEVELS, this);
    this.game.runGame();
  }

  syncState(state: State) {
    this.drawActors(state.actors);
    this.setState({ level: state.level });
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
    // let center = player.pos.plus(player.size.times(0.5)).times(scale);
  
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
    // const level = this.game.getLevelByPlan(simpleLevelPlan);

    return (
      <Stage width={this.viewportWidth} height={this.viewportHeight}>
        <GameLevel level={this.state.level} scale={this.state.scale} />
        <Layer>
          { this.state.actors.map((actor, index) =>
            <Actor actor={actor} scale={this.state.scale} key={`${index}-${actor.type}`} />
          ) }
        </Layer>
      </Stage>
    );
  }
}

interface GameActorProps {
  actor: GameActor;
  scale: number;
}

class Actor extends React.Component<GameActorProps, {}> {
  shouldComponentUpdate(nextProps: GameActorProps) {
    return nextProps.actor.pos.x !== this.props.actor.pos.x || nextProps.actor.pos.y !== this.props.actor.pos.y;
  }

  render() {
    const { actor, scale } = this.props;

    if (actor instanceof Player) {
      return (
        <Rect
          width={actor.size.x * scale}
          height={actor.size.y * scale}
          x={actor.pos.x * scale}
          y={actor.pos.y * scale}
          fill="#000000"
          opacity={1}
        />
      );
    }

    if (actor instanceof Coin) {
      return <Rect
        width={actor.size.x * scale}
        height={actor.size.x * scale}
        x={actor.pos.x * scale}
        y={actor.pos.y * scale}
        fill="#FFDF00"
        opacity={1}
      />
    }

    if (actor instanceof Lava) {
      return <Rect
        width={actor.size.x * scale}
        height={actor.size.x * scale}
        x={actor.pos.x * scale}
        y={actor.pos.y * scale}
        fill="#FF0000"
        opacity={1}
      />
    }

    return null;
  }
}

interface GameLevelProps {
  level: Level;
  scale: number;
}

class GameLevel extends React.Component<GameLevelProps, {}> {
  shouldComponentUpdate(nextProps: GameLevelProps) {
    return this.props.level.plan !== nextProps.level.plan;
  }

  render() {
    const scale = this.props.scale;

    return (
      <Layer>
          { this.props.level.rows.map((r, colIdx) => {
            return r.map((elt, rowIndex) => {
              const key = `${colIdx}-${rowIndex}`;
              let fill = '';
              switch (elt) {
                case 'empty': {
                  return <Rect
                  key={key}
                  width={scale}
                  height={scale}
                  x={rowIndex * scale}
                  y={colIdx * scale}
                  fill="#777"
                  opacity={1}
                />;
                }
                case 'wall': {
                  return <Rect
                  key={key}
                  width={scale}
                  height={scale}
                  x={rowIndex * scale}
                  y={colIdx * scale}
                  fill="#ddd"
                  opacity={1}
                />;
                }
                case 'lava': {
                  return <Rect
                  key={key}
                  width={scale}
                  height={scale}
                  x={rowIndex * scale}
                  y={colIdx * scale}
                  fill="#ff0000"
                  opacity={1}
                />;
                }

                return (
                  <Rect
                    key={key}
                    width={scale}
                    height={scale}
                    x={rowIndex * scale}
                    y={colIdx * scale}
                    fill={fill}
                    opacity={1}
                  />
                );
              }

              return null;
            });
          }) }
        </Layer>
    );
  }
}

render(<App />, document.getElementById('root'));
