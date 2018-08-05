import { Level, State, trackKeys, ControlKeys } from "./gameObjects";

export class Game {
  arrowKeys: ControlKeys;
  constructor(
    public plans: string[],
    public render: any,
  ) {
    this.arrowKeys = trackKeys(["ArrowLeft", "ArrowRight", "ArrowUp"] as any);
  }

  async runGame() {
    for (let level = 0; level < this.plans.length;) {
      const lvl = new Level(this.plans[level]);
      
      let status = await this.runLevel(lvl, this.render);
      if (status === "won") level++;
    }
    console.log("You've won!");
  }

  public getLevelByPlan(plan: string) {
    return new Level(plan);
  }

  runAnimation(frameFunc: (time: number) => boolean) {
    let lastTime: number | null = null;
  
    function frame(time: number) {
      
      if (lastTime != null) {
        let timeStep = Math.min(time - lastTime, 100) / 1000;

        if (frameFunc(timeStep) === false) {
          return;
        }
      }

      lastTime = time;

      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }
  
  runLevel(level: Level, display: any) {
    let state = State.start(level);
    let ending = 1;

    return new Promise(resolve => {
      this.runAnimation(time => {
        state = state.update(time, this.arrowKeys);
        display.syncState(state);
        if (state.status == "playing") {
          return true;
        } else if (ending > 0) {
          ending -= time;
          return true;
        } else {
          display.clear();
          resolve(state.status);
          return false;
        }
      });
    });
  }
}