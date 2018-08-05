export interface ControlKeys {
  ArrowLeft: boolean;
  ArrowRight: boolean;
  ArrowUp: boolean;
};

const playerXSpeed = 7;
const gravity = 30;
const jumpSpeed = 17;

export class Vec {
  constructor(public x: number, public y: number) {}
  plus(other: Vec) {
    return new Vec(this.x + other.x, this.y + other.y);
  }
  times(factor: number) {
    return new Vec(this.x * factor, this.y * factor);
  }
}

export class Player {
  size = new Vec(0.8, 1.5);

  constructor(public pos: Vec, public speed: Vec) {}

  get type() {
    return "player";
  }

  static create(pos: Vec) {
    return new Player(
      pos.plus(new Vec(0, -0.5)),
      new Vec(0, 0)
    );
  }
  public update(time: number, state: State, keys: ControlKeys) {
    let xSpeed = 0;
    if (keys.ArrowLeft) {
      xSpeed -= playerXSpeed;
    }
    if (keys.ArrowRight) {
      xSpeed += playerXSpeed;
    }
    let pos = this.pos;
    let movedX = pos.plus(new Vec(xSpeed * time, 0));
    if (!state.level.touches(movedX, this.size, "wall")) {
      pos = movedX;
    }
  
    let ySpeed = this.speed.y + time * gravity;
    let movedY = pos.plus(new Vec(0, ySpeed * time));
    if (!state.level.touches(movedY, this.size, "wall")) {
      pos = movedY;
    } else if (keys.ArrowUp && ySpeed > 0) {
      ySpeed = -jumpSpeed;
    } else {
      ySpeed = 0;
    }
    return new Player(pos, new Vec(xSpeed, ySpeed));
  };
}

export class Lava {
  size = new Vec(1, 1);

  constructor(
    public pos: Vec,
    public speed: Vec,
    public reset?: Vec,
  ) {}

  get type() {
    return "lava";
  }

  static create(pos: Vec, ch: string) {
    if (ch == "=") {
      return new Lava(pos, new Vec(2, 0));
    } else if (ch == "|") {
      return new Lava(pos, new Vec(0, 2));
    } else if (ch == "v") {
      return new Lava(pos, new Vec(0, 3), pos);
    }
  }

  update(time: number, state: State, keys: ControlKeys) {
    let newPos = this.pos.plus(this.speed.times(time));
    if (!state.level.touches(newPos, this.size, "wall")) {
      return new Lava(newPos, this.speed, this.reset);
    } else if (this.reset) {
      return new Lava(this.reset, this.speed, this.reset);
    } else {
      return new Lava(this.pos, this.speed.times(-1));
    }
  }

  collide(state: State) {
    return new State(state.level, state.actors, GameStatus.Lost);
  }
}

export class Coin {
  size = new Vec(0.6, 0.6);

  readonly wobbleSpeed = 8;
  readonly wobbleDist = 0.07;

  constructor(
    public pos: Vec,
    public basePos: Vec,
    public wobble: number
  ) {}

  get type() {
    return "coin";
  }

  static create(pos: Vec) {
    let basePos = pos.plus(new Vec(0.2, 0.1));
    return new Coin(basePos, basePos,
      Math.random() * Math.PI * 2);
  }

  collide(state: State) {
    let filtered = state.actors.filter(a => a != this);
    let status = state.status;
    if (!filtered.some(a => a.type === "coin")) {
      status = GameStatus.Won;
    }

    return new State(state.level, filtered, status);
  }

  update(time: number, state: State, keys: ControlKeys) {
    let wobble = this.wobble + time * this.wobbleSpeed;
    let wobblePos = Math.sin(wobble) * this.wobbleDist;

    return new Coin(
      this.basePos.plus(new Vec(0, wobblePos)),
      this.basePos,
      wobble
    );
  }
}

enum GameStatus {
  Playing = 'playing',
  Lost = 'lost',
  Won = 'won',
}

export class State {
  constructor(
    public level: Level,
    public actors: Array<Coin | Lava | Player>,
    public status: GameStatus,
  ) {}

  static start(level: Level) {
    return new State(level, level.startActors, GameStatus.Playing);
  }

  get player() {
    return this.actors.find(a => a.type === "player");
  }

  update(time: number, keys: ControlKeys) {
    let actors = this.actors.map(actor => actor.update(time, this, keys));
    let newState = new State(this.level, actors, this.status);
  
    if (newState.status !== GameStatus.Playing) return newState;
  
    let player = newState.player;
    if (this.level.touches(player.pos, player.size, "lava")) {
      return new State(this.level, actors, GameStatus.Lost);
    }
  
    for (let actor of actors) {
      if (actor !== player && overlap(actor, player)) {
        newState = (actor as Coin | Lava).collide(newState);
      }
    }
    return newState;
  };
  
}

export function trackKeys(keys: ControlKeys[]) {
  let down = Object.create(null);

  function track(event: any) {
    if (keys.includes(event.key)) {
      down[event.key] = event.type == "keydown";
      event.preventDefault();
    }
  }
  window.addEventListener("keydown", track);
  window.addEventListener("keyup", track);
  return down;
}

function overlap(actor1: { pos: { x: number, y: number }, size: { x: number, y: number }}, actor2: { pos: { x: number, y: number }, size: { x: number, y: number }}) {
  return actor1.pos.x + actor1.size.x > actor2.pos.x &&
    actor1.pos.x < actor2.pos.x + actor2.size.x &&
    actor1.pos.y + actor1.size.y > actor2.pos.y &&
    actor1.pos.y < actor2.pos.y + actor2.size.y;
}

const levelChars: {[key: string]: any } = {
  ".": "empty",
  "#": "wall",
  "+": "lava",
  "@": Player,
  "o": Coin,
  "=": Lava,
  "|": Lava,
  "v": Lava,
};

export type GameActors = Array<Player | Coin | Lava>;

export class Level {
  rows: any[][];
  height: number;
  width: number;
  startActors: Array<Player | Coin | Lava>;
  constructor(plan: string) {
    let rows = plan.trim().split("\n").map(l => [...l]);
    this.height = rows.length;
    this.width = rows[0].length;
    this.startActors = [];

    this.rows = rows.map((row, y) => {
      return row.map((ch, x) => {
        let type = levelChars[ch];

        if (typeof type == "string") {
          return type;
        }

        this.startActors.push(type.create(new Vec(x, y), ch));

        return "empty";
      });
    });
  }
  touches(pos: Vec, size: Vec, type: string) {
    let xStart = Math.floor(pos.x);
    let xEnd = Math.ceil(pos.x + size.x);
    let yStart = Math.floor(pos.y);
    let yEnd = Math.ceil(pos.y + size.y);
  
    for (var y = yStart; y < yEnd; y++) {
      for (var x = xStart; x < xEnd; x++) {
        let isOutside = x < 0 || x >= this.width ||
          y < 0 || y >= this.height;
        let here = isOutside ? "wall" : this.rows[y][x];
        if (here == type) return true;
      }
    }
    return false;
  };
}
