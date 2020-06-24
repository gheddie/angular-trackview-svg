import {Track} from './track';

export class SvgTrackModel {

  height: number;
  width: number;
  tracks: Track[] = [];

  constructor(aHeight: number, aWdith: number, aTracks: Track[]) {
    this.height = aHeight;
    this.width = aWdith;
    this.tracks = aTracks;
  }
}
