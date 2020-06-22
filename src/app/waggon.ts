import {Track} from './track';

export class Waggon {

  public waggonNumber: string;
  public track: Track;
  public length: number;

  public selected: boolean = false;

  constructor(aWaggonNumber: string, aLength: number) {
    this.waggonNumber = aWaggonNumber;
    this.length = aLength;
  }
}
