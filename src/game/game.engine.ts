// Global Variables
export enum DIRECTION {
  IDLE = 0,
  UP = 1,
  DOWN = 2,
  LEFT = 3,
  RIGHT = 4,
}

const ROUNDS: number[] = [7];
const COLORS = ['#1abc9c', '#2ecc71', '#3498db', '#8c52ff', '#9b59b6'];

const Ball = {
  new: function (
    this: { canvas: HTMLCanvasElement },
    incrementedSpeed?: number,
  ) {
    return {
      width: 18,
      height: 18,
      x: this.canvas.width / 2 - 9,
      y: this.canvas.height / 2 - 9,
      moveX: DIRECTION.IDLE,
      moveY: DIRECTION.IDLE,
      speed: incrementedSpeed || 7,
    };
  },
};

type Side = 'left' | 'right';

type BallType = {
  width: number;
  height: number;
  x: number;
  y: number;
  moveX: number;
  moveY: number;
  speed: number;
};

export type GameType = {
  host: PlayerType;
  guest: PlayerType;
  ball: BallType;
  running: boolean;
  turn: PlayerType | undefined;
  timer: number;
  color: string;
  over: boolean;
  round: number;
};

type PlayerType = {
  width: number;
  height: number;
  x: number;
  y: number;
  score: number;
  move: DIRECTION;
  speed: number;
};

// The ai object (The two lines that move up and down)
const PongPlayer = {
  new: function (this: { canvas: HTMLCanvasElement }, side: Side) {
    return {
      width: 18,
      height: 180,
      x: side === 'left' ? 150 : this.canvas.width - 150,
      y: this.canvas.height / 2 - 35,
      score: 0,
      move: DIRECTION.IDLE,
      speed: 8,
    };
  },
};

export class CGame {
  public canvas: HTMLCanvasElement;
  public context: CanvasRenderingContext2D | null;
  public host: PlayerType;
  public guest;
  public ball;
  public running;
  public turn: PlayerType | null;
  public timer;
  public color: string;
  public over: boolean;
  public round: number;
  public intervalId: NodeJS.Timeout | null;

  getGameData = (): GameType => {
    return {
      host: this.host,
      guest: this.guest,
      ball: this.ball,
      running: this.running,
      turn: this.turn,
      timer: this.timer,
      color: this.color,
      over: this.over,
      round: this.round,
    };
  };

  constructor() {
    this.canvas.width = 1400;
    this.canvas.height = 1000;

    this.canvas.style.width = this.canvas.width / 2 + 'px';
    this.canvas.style.height = this.canvas.height / 2 + 'px';

    this.host = PongPlayer.new.call(this, 'left');
    this.guest = PongPlayer.new.call(this, 'right');
    this.ball = Ball.new.call(this);

    this.guest.speed = 5;
    this.running = this.over = false;
    this.turn = this.guest;
    this.timer = this.round = 0;
    this.color = '#8c52ff';
  }

  makeInit = () => {
    this.canvas = document.querySelector('canvas')!;
    this.context = this.canvas.getContext('2d');

    this.canvas.width = 1400;
    this.canvas.height = 1000;

    this.canvas.style.width = this.canvas.width / 2 + 'px';
    this.canvas.style.height = this.canvas.height / 2 + 'px';

    this.host = PongPlayer.new.call(this, 'left');
    this.guest = PongPlayer.new.call(this, 'right');
    this.ball = Ball.new.call(this);

    this.guest.speed = 5;
    this.running = this.over = false;
    this.turn = this.guest;
    this.timer = this.round = 0;
    this.color = '#8c52ff';
  };

  // initialize = () => {
  //   this.menu();
  //   this.listen();
  // };

  endGameMenu = (text: string) => {
    if (this.context) {
      // Change the canvas font size and color
      this.context.font = '45px Courier New';
      this.context.fillStyle = this.color;

      // Draw the rectangle behind the 'Press any key to begin' text.
      this.context.fillRect(
        this.canvas.width / 2 - 350,
        this.canvas.height / 2 - 48,
        700,
        100,
      );

      // Change the canvas color;
      this.context.fillStyle = '#ffffff';

      // Draw the end game menu text ('Game Over' and 'Winner')
      this.context.fillText(
        text,
        this.canvas.width / 2,
        this.canvas.height / 2 + 15,
      );

      setTimeout(() => {
        this.makeInit();
        // document.removeEventListener('keydown', this.keydownfunction);
        // document.removeEventListener('keyup', this.keyupfunction);
        // this.initialize();
      }, 3000);
    } else {
      console.error('context is null');
    }
  };

  // Update all objects (move the player, ai, ball, increment the score, etc.)
  update = () => {
    if (!this.over) {
      // If the ball collides with the bound limits - correct the x and y coords.
      if (this.ball.x <= 0) this._resetTurn(this.guest, this.host);
      if (this.ball.x >= this.canvas.width - this.ball.width)
        this._resetTurn(this.host, this.guest);
      if (this.ball.y <= 0) this.ball.moveY = DIRECTION.DOWN;
      if (this.ball.y >= this.canvas.height - this.ball.height)
        this.ball.moveY = DIRECTION.UP;

      // Move player if they player.move value was updated by a keyboard event
      if (this.host.move === DIRECTION.UP) this.host.y -= this.host.speed;
      else if (this.host.move === DIRECTION.DOWN)
        this.host.y += this.host.speed;

      // On new serve (start of each turn) move the ball to the correct side
      // and randomize the direction to add some challenge.
      if (this._turnDelayIsOver() && this.turn) {
        this.ball.moveX =
          this.turn === this.host ? DIRECTION.LEFT : DIRECTION.RIGHT;
        this.ball.moveY = [DIRECTION.UP, DIRECTION.DOWN][
          Math.round(Math.random())
        ];
        this.ball.y =
          Math.floor(Math.random() * this.canvas.height - 200) + 200;
        this.turn = null;
      }

      // If the player collides with the bound limits, update the x and y coords.
      if (this.host.y <= 0) this.host.y = 0;
      else if (this.host.y >= this.canvas.height - this.host.height)
        this.host.y = this.canvas.height - this.host.height;

      // Move ball in intended direction based on moveY and moveX values
      if (this.ball.moveY === DIRECTION.UP)
        this.ball.y -= this.ball.speed / 1.5;
      else if (this.ball.moveY === DIRECTION.DOWN)
        this.ball.y += this.ball.speed / 1.5;
      if (this.ball.moveX === DIRECTION.LEFT) this.ball.x -= this.ball.speed;
      else if (this.ball.moveX === DIRECTION.RIGHT)
        this.ball.x += this.ball.speed;

      // Handle ai (AI) UP and DOWN movement
      if (this.guest.y > this.ball.y - this.guest.height / 2) {
        if (this.ball.moveX === DIRECTION.RIGHT)
          this.guest.y -= this.guest.speed / 1.5;
        else this.guest.y -= this.guest.speed / 4;
      }
      if (this.guest.y < this.ball.y - this.guest.height / 2) {
        if (this.ball.moveX === DIRECTION.RIGHT)
          this.guest.y += this.guest.speed / 1.5;
        else this.guest.y += this.guest.speed / 4;
      }

      // Handle ai (AI) wall collision
      if (this.guest.y >= this.canvas.height - this.guest.height)
        this.guest.y = this.canvas.height - this.guest.height;
      else if (this.guest.y <= 0) this.guest.y = 0;

      // Handle Player-Ball collisions
      if (
        this.ball.x - this.ball.width <= this.host.x &&
        this.ball.x >= this.host.x - this.host.width
      ) {
        if (
          this.ball.y <= this.host.y + this.host.height &&
          this.ball.y + this.ball.height >= this.host.y
        ) {
          this.ball.x = this.host.x + this.ball.width;
          this.ball.moveX = DIRECTION.RIGHT;
        }
      }

      // Handle ai-ball collision
      if (
        this.ball.x - this.ball.width <= this.guest.x &&
        this.ball.x >= this.guest.x - this.guest.width
      ) {
        if (
          this.ball.y <= this.guest.y + this.guest.height &&
          this.ball.y + this.ball.height >= this.guest.y
        ) {
          this.ball.x = this.guest.x - this.ball.width;
          this.ball.moveX = DIRECTION.LEFT;
        }
      }
    }

    // Handle the end of round transition
    // Check to see if the player won the round.
    if (this.host.score === 7) {
      // Check to see if there are any more rounds/levels left and display the victory screen if
      // there are not.
      if (!ROUNDS[this.round + 1]) {
        this.over = true;

        // setTimeout(() => {
        //   this.endGameMenu('Winner!');
        // }, 1000);
      } else {
        // If there is another round, reset all the values and increment the round number.
        this.color = this._generateRoundColor();
        this.host.score = this.guest.score = 0;
        this.host.speed += 0.5;
        this.guest.speed += 1;
        this.ball.speed += 1;
        this.round += 1;
      }
    }
    // Check to see if the ai/AI has won the round.
    else if (this.guest.score === 7) {
      this.over = true;

      // setTimeout(() => {
      //   this.endGameMenu('Game Over!');
      // }, 1000);
    }
  };

  // Reset the ball location, the player turns and set a delay before the next round begins.
  _resetTurn = (victor: PlayerType, loser: PlayerType) => {
    this.ball = Ball.new.call(this, this.ball.speed);
    this.turn = loser;
    this.timer = new Date().getTime();

    victor.score++;
  };

  // Wait for a delay to have passed after each turn.
  _turnDelayIsOver = () => {
    return new Date().getTime() - this.timer >= 1000;
  };

  // Select a random color as the background of each level/round.
  _generateRoundColor = (): string => {
    const newColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    if (newColor === this.color) return this._generateRoundColor();
    return newColor;
  };
}

// const Pong = new CGame();

// Pong.initialize();
