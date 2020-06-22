import {Waggon} from './waggon';

export class Track {

  public trackNumber: string;
  public xFrom: number;
  public yFrom: number;
  public xTo: number;
  public yTo: number;

  public waggons: Waggon[];

  public parentTrack: Track;

  constructor(aTrackNumber: string, aXFrom: number, aYFrom: number, aXTo: number, aYTo: number, aWaggons: Waggon[], aParentTrack: Track) {

    this.trackNumber = aTrackNumber;
    this.xFrom = aXFrom;
    this.yFrom = aYFrom;
    this.xTo = aXTo;
    this.yTo = aYTo;
    this.waggons = aWaggons;
    if (aWaggons != null) {
      for (const wg of aWaggons) {
        wg.track = this;
      }
    }
    this.parentTrack = aParentTrack;
  }

  getOriginX(): number {
    if (this.parentTrack != null) {
      return this.parentTrack.xTo;
    }
    return this.xFrom;
  }

  getOriginY(): number {
    if (this.parentTrack != null) {
      return this.parentTrack.yTo;
    }
    return this.yFrom;
  }
}
