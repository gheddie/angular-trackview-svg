import {Track} from './track';

export class SvgTrackModel {

  height: number;
  width: number;
  tracks: Track[] = [];

  constructor(aHeight: number, aWdith: number) {
    this.height = aHeight;
    this.width = aWdith;
  }
}
