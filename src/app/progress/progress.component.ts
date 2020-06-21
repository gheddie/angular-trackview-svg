import {Component, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Track} from '../track';
import {Waggon} from '../waggon';
import {Point} from '../point';
import {DomSanitizer, SafeStyle} from '@angular/platform-browser';
import {Quadrant} from '../quadrant.enum';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.css']
})
export class ProgressComponent implements OnInit, OnChanges {

  private readonly WAGGON_GAP = 10;

  tracks: Track[];

  // waggons: Waggon[];

  showDragging: boolean = false;

  radius = 54;
  circumference = 2 * Math.PI * this.radius;
  dashoffset: number;
  value: number = 83;

  private sanitizer: DomSanitizer;

  private trackAngle: number;

  constructor(private aSanitizer: DomSanitizer) {
    this.progress(83);
    this.sanitizer = aSanitizer;
  }

  ngOnInit(): void {

    console.log(this.sanitizer);

    const waggonsT1 = [
      // t1
      new Waggon('W1', null, 100),
      new Waggon('W2', null, 50)
    ];

    // ######### 0 Grad (EAST) --> OK
    const t1 = new Track('T1', 400, 400, 800, 400, waggonsT1);

    // ...in between... --> ???

    // ######### 45 Grad (NORTH_EAST) --> NOK
    // const t1 = new Track('T1', 400, 400, 600, 200, waggonsT1);

    // ...in between... --> ???

    // ######### 90 Grad (NORTH) --> OK
    // const t1 = new Track('T1', 400, 400, 400, 200, waggonsT1);

    // ...in between... --> ???

    // ######### 135 Grad (NORTH_WEST) --> OK
    // const t1 = new Track('T1', 400, 400, 200, 200, waggonsT1);

    // ...in between... --> ???

    // ######### 180 Grad (WEST) --> ???
    // const t1 = new Track('T1', 400, 400, 200, 400, waggonsT1);

    // ...in between... --> ???

    // ######### 225 Grad (SOUTH_WEST) --> NOK
    // const t1 = new Track('T1', 400, 400, 200, 600, waggonsT1);

    // ...in between... --> ???

    // ######### 270 Grad (SOUTH) --> OK
    // const t1 = new Track('T1', 400, 400, 400, 600, waggonsT1);

    // ...in between... --> ???

    // ######### 315 Grad (SOUTH_EAST) --> OK
    // const t1 = new Track('T1', 400, 400, 600, 600, waggonsT1);

    // ...in between... --> ???

    this.tracks = [
      t1
    ];
  }

  get generateTransformOrigin(): SafeStyle {
    return this.sanitizer.bypassSecurityTrustStyle('center');
  }

  get generateTransformBox(): SafeStyle {
    return this.sanitizer.bypassSecurityTrustStyle('fill-box');
  }

  generateTransform(aWaggon: Waggon): SafeStyle {

    const diffHeight = Math.abs(aWaggon.track.yFrom - aWaggon.track.yTo);
    console.log('generateTransform (diffHeight): ' + diffHeight);
    const diffLength = Math.abs(aWaggon.track.xFrom - aWaggon.track.xTo);
    console.log('generateTransform (diffLength): ' + diffLength);

    const angle = Math.atan(diffHeight / diffLength) * (180 / Math.PI);
    const degrees = angle;

    this.trackAngle = angle;

    console.log('generateTransform: ' + degrees + ' degrees.');

    return this.sanitizer.bypassSecurityTrustStyle('rotate(' + degrees + 'deg)');
  }

  private progress(value: number) {
    const progress = value / 100;
    this.dashoffset = this.circumference * (1 - progress);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.value.currentValue !== changes.value.previousValue) {
      this.progress(changes.value.currentValue);
    }
  }

  dragstart($event: DragEvent) {
    console.log('dragstart');
  }

  mousemove($event: MouseEvent) {
    console.log('mousemove');
  }

  mousedown($event: MouseEvent, aWaggon: Waggon) {
    console.log(' ##################### mousedown: ' + aWaggon.waggonNumber);
    this.showDragging = true;
  }

  mouseup($event: MouseEvent) {
    console.log('mouseup');
    this.showDragging = false;
  }

  showDraggingGhost(): string {
    if (this.showDragging) {
      return 'visible';
    }
    return 'hidden';
  }

  collectWaggons(): Waggon[] {
    console.log('collectWaggons');
    let collectedWaggons = [];
    for (let tr of this.tracks) {
      console.log('collectWaggons: ' + tr.trackNumber);
      for (let wg of tr.waggons) {
        collectedWaggons.push(wg);
      }
    }
    return collectedWaggons;
  }

  calcuateWaggonPositionOnTrack(aWaggon: Waggon): number {

    const waggonIndex = this.findWaggonIndexOnTrack(aWaggon);

    console.log('calcuateWaggonPositionOnTrack [index=' + waggonIndex + ']: ' + aWaggon.waggonNumber);

    console.log('waggon index: ' + waggonIndex);

    let waggonPos = 0;

    for (let i = 0; i < waggonIndex; i++) {
      waggonPos += aWaggon.track.waggons[i].length;
      console.log('waggon index (add): ' + aWaggon.track.waggons[i].waggonNumber);
    }

    // for centered
    return waggonPos + (aWaggon.length / 2) + (this.WAGGON_GAP * (waggonIndex + 1));
  }

  findWaggonIndexOnTrack(aWaggon: Waggon): number {
    let pos = 0;
    // let stop: boolean = false;
    for (const wg of aWaggon.track.waggons) {
      if (aWaggon === wg) {
        return pos;
      } else {
        pos += 1;
      }
    }
    return pos;
  }

  // ---

  calculateWaggonX(aWaggon: Waggon): number {
    const track = this.tracks[0];
    const point = this.calculateTrackPoint(track, this.calcuateWaggonPositionOnTrack(aWaggon), true);
    console.log('calculate waggon x:' + point.x);
    return point.x - (aWaggon.length / 2);
  }

  calculateWaggonY(aWaggon: Waggon): number {
    const track = this.tracks[0];
    const point = this.calculateTrackPoint(track, this.calcuateWaggonPositionOnTrack(aWaggon), true);
    console.log('calculate waggon y:' + point.y);
    return point.y - (this.calculateWaggonHeight(aWaggon) / 2);
  }

  calculateWaggonWidth(aWaggon: Waggon): number {
    const track = this.tracks[0];
    return aWaggon.length;
  }

  calculateWaggonHeight(aWaggon: Waggon): number {
    // const track = this.tracks[0];
    return 30;
  }

  // ---

  /**
   * https://math.stackexchange.com/questions/175896/finding-a-point-along-a-line-a-certain-distance-away-from-another-point
   *
   * @param track
   */
  private calculateTrackPoint(track: Track, aDistanceFromOrigin: number, inverted: boolean): Point {

    const diffX = track.xTo - track.xFrom;
    const diffY = track.yTo - track.yFrom;

    const trackLenght = Math.sqrt((Math.pow(track.xTo - track.xFrom, 2)) + (Math.pow(track.yTo - track.yFrom, 2)));

    let xRes = 0;
    let yRes = 0;

    if (inverted) {
      aDistanceFromOrigin = trackLenght - aDistanceFromOrigin;
    }

    xRes = track.xTo - (track.xTo - track.xFrom) * aDistanceFromOrigin / trackLenght;
    yRes = track.yTo - (track.yTo - track.yFrom) * aDistanceFromOrigin / trackLenght;

    return new Point(xRes, yRes);
  }

  // ---

  xPlus(): void {
    console.log('xPlus');
    this.tracks[0].xTo = this.tracks[0].xTo + 10;
  }

  xMinus(): void {
    console.log('xMinus');
    this.tracks[0].xTo = this.tracks[0].xTo - 10;
  }

  yPlus(): void {
    console.log('yPlus');
    this.tracks[0].yTo = this.tracks[0].yTo + 10;
  }

  yMinus(): void {
    console.log('yMinus');
    this.tracks[0].yTo = this.tracks[0].yTo - 10;
  }

  getTrackAngle(): number {
    return this.trackAngle;
  }

  getQuadrant(): string {
    let result = null;


    const track = this.tracks[0];
    if (track.yFrom === track.yTo) {
      if (track.xFrom < track.xTo) {
        result = Quadrant[Quadrant.EAST];
      } else {
        result = Quadrant[Quadrant.WEST];
      }
    } else if (track.xFrom === track.xTo) {
      if (track.yFrom < track.yTo) {
        result = Quadrant[Quadrant.SOUTH];
      } else {
        result = Quadrant[Quadrant.NORTH];
      }
    } else {
      if (track.xTo > track.xFrom && track.yTo > track.yFrom) {
        result = Quadrant[Quadrant.SOUTH_EAST];
      } else if (track.xTo > track.xFrom && track.yTo < track.yFrom) {
        result = Quadrant[Quadrant.NORTH_EAST];
      } else if (track.xTo < track.xFrom && track.yTo < track.yFrom) {
        result = Quadrant[Quadrant.NORTH_WEST];
      } else if (track.xTo < track.xFrom && track.yTo > track.yFrom) {
        result = Quadrant[Quadrant.SOUTH_WEST];
      }
    }

    return result;
  }
}
