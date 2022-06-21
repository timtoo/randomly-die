/* Handle dice notation parsing and rolls 

See: [Dice notation](https://en.wikipedia.org/wiki/Dice_notation)

For details on our extensions, see README.md

Note on `results` array. 

- Each row represents the results of one throw (one repeat). 
- Each row contains: `[total with modifier/multiplier, die 1, die 2, die 3, ...]`
- the `result` variable will have a sum of the totals

*/

const DEFAULT_MIN = 1;
const DEFAULT_MAX = 6;
const DEFAULT_DICE = 1;
const DEFAULT_MULT = 1;
const DEFAULT_MOD = 0;
const DEFAULT_REPEAT = 1;

const MULTIPY_CHARS = 'Xx×*';
const DIVIDE_CHARS = '/÷';

const DieRegExp = new RegExp(
  `\\b((?<repeat>\\d+)[${MULTIPY_CHARS}]\\(?)?(?<rolls>\\d*)[dD](?<max>-?\\d*)(>(?<min>-?\\d+))?((?<mult>[${MULTIPY_CHARS}${DIVIDE_CHARS}]\\d+)(?<mod>[+-]\\d+)|(?<mod1>[+-]\\d+)(?<mult1>[${MULTIPY_CHARS}${DIVIDE_CHARS}]\\d+)|(?<mod2>[+-]\\d+)|(?<mult2>[${MULTIPY_CHARS}${DIVIDE_CHARS}]\\d+))?(?<flag1>[xXzZ])?(?<flag2>[xXzZ])?\\b`
);

class Die {
  min: number;
  max: number;
  dice: number;
  mod: number;
  mult: number;
  repeat: number;
  zerobase: boolean;
  exclusive: boolean;

  parsedText: string;
  result: number | null;
  results: number[][];
  rid: number;

  constructor(
    min: number | string = DEFAULT_MIN,
    max = DEFAULT_MAX,
    dice = DEFAULT_DICE,
    mod = DEFAULT_MOD,
    mult = DEFAULT_MULT,
    repeat = DEFAULT_REPEAT,
    exclusive = false,
    zerobase = false
  ) {
    this.min = DEFAULT_MIN; // default minimum allowed
    this.max = max; // sides of dice
    this.dice = dice; // number of times to roll dice
    this.mod = mod; // positive or negative modifier
    this.mult = mult; // multiplier (decimal to divide)
    this.repeat = repeat; // how many times to roll the above

    this.zerobase = zerobase; // zero is lowest instead of one
    this.exclusive = exclusive; // subtract 1 from highest dice number

    this.result = null;
    this.results = [];
    this.parsedText = "";

    if (typeof min === "string") {
      const result = this.parse(min);
      if (result === null) throw new Error("Invalid dice notation");
    } else {
      this.min = min;
    }

    this.rid = Math.random(); // meaningless random number
  }

  // the up side is you always get a number, down side is it's always -1 if not rolled
  getResult(): number {
    return this.result === null ? -1 : this.result;
  }

  // return just the dice values for the given throw (note: 1-based)
  getThrow(repeat=1): number[] {
    if (this.results.length >= repeat) return this.results[repeat-1].slice(1);
    return [];
  }

  // the actual possible range to roll
  // note: probabilty distribution may not be even if repeats?
  // single: single die only (if more than one)
  getRange(single=false): [number, number] {
    let min = this.min
    let max = this.max
    if (!single) {
      min = (Math.ceil(this.dice * this.mult) + this.mod) * this.repeat;
      max = (Math.ceil(this.max * this.dice * this.mult) + this.mod) * this.repeat;
    }
    if (this.exclusive) max--;
    return [min, max];
  }

  // single: range for just a single die only, 
  // absolute: actual range, don't use exclusive indicator
  getRangeString(single=false, separator=",", absolute=false): string {
    const [min, max] = this.getRange(single)
    return "[" + min + separator + ((absolute || (!this.exclusive)) ? "" + max + "]" : "" + (max+1) + ')')
  }

  // throw the dice, just once, return results in array
  throw(): number[] {
    const row: number[] = [0];
    const upper = this.exclusive ? this.max : this.max + 1;

    for (let i=0; i<this.dice; i++) {
      row.push(Math.floor(Math.random() * (upper - this.min)) + this.min);
      row[0] += row[row.length-1]
    }

    row[0] = Math.ceil(row[0] * this.mult); // D&D manaul says round up?
    row[0] += this.mod

    return row;
  }

  // throw the dice as many times as needed, update object with results, return object
  roll(): Die {
    this.results = [this.throw()]
    this.result = this.results[0][0]
    if (this.repeat > 1) {
      for (let i = 1; i < this.repeat; i++) {
        this.results.push(this.throw())
        this.result += this.results[this.results.length-1][0]
      }
    }
    return this;
  }

  // return a new dice object with same settings, with optional overrides
  clone(
    min?: number,
    max?: number,
    dice?: number,
    mod?: number,
    mult?: number,
    repeat?: number,
    exclusive?: boolean,
    zerobase?: boolean
  ) {
    const d = new Die(
      min || this.min,
      max || this.max,
      dice || this.dice,
      mod || this.mod,
      mult || this.mult,
      repeat || this.repeat,
      exclusive || this.exclusive,
      zerobase || this.zerobase
    );
    return d;
  }

  equals(d: Die) {
    return (
      this.min === d.min &&
      this.max === d.max &&
      this.dice === d.dice &&
      this.mod === d.mod &&
      this.mult === d.mult &&
      this.repeat === d.repeat &&
      this.exclusive === d.exclusive &&
      this.zerobase === d.zerobase
    );
  }

  toString(compact = false): string {
    let value = `${this.dice}d${this.max}`;

    //if (this.min !== 1) value += ">" + this.min;
    //if (this.min !== 1 || (this.min === 0 && (! this.zerobase))) value += ">" + this.min;
    if (this.min !== 1) {
      if (!(this.min === 0 && this.zerobase)) value += ">" + this.min;
    }
    if (this.mult > 1) value += "x" + this.mult;
    if (this.mult > 0 && this.mult < 1)
      value += "/" + Math.round(1 / this.mult);

    if (this.mod > 0) value += "+" + this.mod;
    if (this.mod < 0) value += this.mod;

    if (this.repeat > 1) value = `${this.repeat}x(${value})`;

    if (compact) {
      if (this.max === 6) value = value.replace("d6", "d");
      if (this.dice === 1) value = value.replace("1d", "d");
    }

    if (this.exclusive) value += "x";
    if (this.min === 0 && this.zerobase) value += "z";

    return value;
  }

  parse(s: string): Die | null {
    const match = DieRegExp.exec(s);

    if (match) {
      //console.log(match.groups);
      this.parsedText = s;
      this.repeat = match.groups?.repeat
        ? +match.groups.repeat
        : DEFAULT_REPEAT;
      this.dice = match.groups?.rolls ? +match.groups.rolls : DEFAULT_DICE;
      this.mod = +(
        match.groups?.mod2 ||
        match.groups?.mod1 ||
        match.groups?.mod ||
        DEFAULT_MOD
      );
      this.max = match.groups?.max ? +match.groups.max : DEFAULT_MAX;
      this.min = match.groups?.min ? +match.groups.min : DEFAULT_MIN;

      if (this.min > this.max) [this.min, this.max] = [this.max, this.min];

      this.mult = DEFAULT_MULT;
      const mult: string | undefined =
        match.groups?.mult2 || match.groups?.mult1 || match.groups?.mult;
      if (mult) {
        DIVIDE_CHARS.indexOf(mult[0]) >= 0
          ? (this.mult = 1 / +mult.slice(1))
          : (this.mult = +mult.slice(1));
      }

      this.exclusive = false;
      this.zerobase = false;

      [match.groups?.flag1, match.groups?.flag2].map((e) => {
        if (e) {
          if (e.toLowerCase() === "x") this.exclusive = true;
          // zero base is ignored if any non-zero min is explictly set
          if (
            e.toLowerCase() === "z" &&
            (match.groups?.min === undefined || this.min === 0)
          ) {
            this.zerobase = true;
            this.min = 0;
          }
        }
        return e;
      });

      this.rid = Math.random();
      return this;
    }
    return null;
  }
}

export { Die, DieRegExp };
