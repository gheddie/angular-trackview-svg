import {Track} from './track';

export class Waggon {

  public waggonNumber: string;
  public track: Track;
  public length: number;

  constructor(aWaggonNumber: string, aTrack: Track, aLength: number) {
    this.waggonNumber = aWaggonNumber;
    this.track = aTrack;
    this.length = aLength;
  }
}
