export class Helper {
  static random(min: number, max: number, round?: boolean): number {
    const num = Math.random() * (max - min) + min;
    return round ? Math.round(num) : num;
  }

  // static getAngle(posx1: number, posy1: number, posx2: number, posy2: number): number {
  //   return Math.atan2(posy2 - posy1, posx2 - posx1) * (180 / Math.PI) + 180;
  // }
}
