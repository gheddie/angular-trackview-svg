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

  private readonly WAGGON_GAP_INITIAL = 15;

  private readonly WAGGON_GAP = 5;

  tracks: Track[];

  // waggons: Waggon[];

  showDragging: boolean = false;

  radius = 54;
  circumference = 2 * Math.PI * this.radius;
  dashoffset: number;
  value: number = 83;

  private sanitizer: DomSanitizer;

  private trackAngle: number;

  private waggonAngle: number;

  constructor(private aSanitizer: DomSanitizer) {
    this.progress(83);
    this.sanitizer = aSanitizer;
  }

  ngOnInit(): void {

    const t1 = new Track('T1', 100, 100, 500, 100, [
      new Waggon('W1', 25),
      new Waggon('W2', 50),
      new Waggon('W3', 35),
    ], null);

    const t2 = new Track('T2', null, null, 900, 500, [
      new Waggon('W4', 25),
      new Waggon('W5', 15)
    ], t1);

    const t3 = new Track('T3', null, null, 900, 100, [new Waggon('W6', 125)], t1);

    this.tracks = [
      t1, t2, t3
    ];
  }

  get generateTransformOrigin(): SafeStyle {
    return this.sanitizer.bypassSecurityTrustStyle('center');
  }

  get generateTransformBox(): SafeStyle {
    return this.sanitizer.bypassSecurityTrustStyle('fill-box');
  }

  generateWaggonTransform(aWaggon: Waggon): SafeStyle {

    const angle = this.calculateWaggonAngle(aWaggon);
    const degrees = angle;
    this.trackAngle = angle;
    // console.log('generateTransform: ' + degrees + ' degrees.');
    return this.sanitizer.bypassSecurityTrustStyle('rotate(' + degrees + 'deg)');
  }

  private calculateWaggonAngle(aWaggon: Waggon) {

    const diffHeight = Math.abs(aWaggon.track.getOriginY() - aWaggon.track.yTo);
    // console.log('generateTransform (diffHeight): ' + diffHeight);
    const diffLength = Math.abs(aWaggon.track.getOriginX() - aWaggon.track.xTo);
    // console.log('generateTransform (diffLength): ' + diffLength);

    let result = 0;

    const quadrant = this.getQuadrant(aWaggon.track);

    console.log(' ############### quadrant: ' + quadrant);

    const atan = Math.atan(diffHeight / diffLength) * (180 / Math.PI);

    switch (+Quadrant[quadrant]) {
      case Quadrant.NORTH_EAST:
        // console.log('SWITCH ---> NORTH_EAST');
        result = - atan;
        break;
      case Quadrant.SOUTH_WEST:
        // console.log('SWITCH ---> SOUTH_WEST');
        result = - atan;
        break;
      default:
        // console.log('SWITCH ---> DEFAULT');
        result = atan;
        break;
    }

    // console.log(' @@@ RESULT: ' + result);

    this.waggonAngle = result;

    return result;
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

    // console.log('collectWaggons');
    let collectedWaggons = [];
    for (let tr of this.tracks) {
      // console.log('collectWaggons: ' + tr.trackNumber);
      if (tr.waggons != null) {
        for (let wg of tr.waggons) {
          collectedWaggons.push(wg);
        }
      }
    }
    return collectedWaggons;
  }

  calcuateWaggonPositionOnTrack(aWaggon: Waggon): number {

    const waggonIndex = this.findWaggonIndexOnTrack(aWaggon);
    let waggonPos = 0;
    for (let i = 0; i < waggonIndex; i++) {
      waggonPos += aWaggon.track.waggons[i].length;
    }
    // for centered
    // return waggonPos + (aWaggon.length / 2) + (this.WAGGON_GAP * (waggonIndex + 1));
    return waggonPos + (aWaggon.length / 2) + this.WAGGON_GAP_INITIAL + (this.WAGGON_GAP * (waggonIndex));
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

    const track = aWaggon.track;
    const point = this.calculateTrackPoint(track, this.calcuateWaggonPositionOnTrack(aWaggon), true);
    return point.x - (aWaggon.length / 2);
  }

  calculateWaggonY(aWaggon: Waggon): number {

    const track = aWaggon.track;
    const point = this.calculateTrackPoint(track, this.calcuateWaggonPositionOnTrack(aWaggon), true);
    return point.y - (this.calculateWaggonHeight(aWaggon) / 2);
  }

  calculateWaggonWidth(aWaggon: Waggon): number {
    return aWaggon.length;
  }

  calculateWaggonHeight(aWaggon: Waggon): number {
    return 10;
  }

  private calculateTrackPoint(track: Track, aDistanceFromOrigin: number, inverted: boolean): Point {

    const diffX = track.xTo - track.getOriginX();
    const diffY = track.yTo - track.getOriginY();

    const trackLenght = Math.sqrt((Math.pow(track.xTo - track.getOriginX(), 2)) + (Math.pow(track.yTo - track.getOriginY(), 2)));

    let xRes = 0;
    let yRes = 0;

    if (inverted) {
      aDistanceFromOrigin = trackLenght - aDistanceFromOrigin;
    }

    xRes = track.xTo - (track.xTo - track.getOriginX()) * aDistanceFromOrigin / trackLenght;
    yRes = track.yTo - (track.yTo - track.getOriginY()) * aDistanceFromOrigin / trackLenght;

    return new Point(xRes, yRes);
  }

  getQuadrant(aTrack: Track): Quadrant {

    let result = null;

    if (aTrack.getOriginY() === aTrack.yTo) {
      if (aTrack.getOriginX() < aTrack.xTo) {
        result = Quadrant[Quadrant.EAST];
      } else {
        result = Quadrant[Quadrant.WEST];
      }
    } else if (aTrack.getOriginX() === aTrack.xTo) {
      if (aTrack.getOriginY() < aTrack.yTo) {
        result = Quadrant[Quadrant.SOUTH];
      } else {
        result = Quadrant[Quadrant.NORTH];
      }
    } else {
      if (aTrack.xTo > aTrack.getOriginX() && aTrack.yTo > aTrack.getOriginY()) {
        result = Quadrant[Quadrant.SOUTH_EAST];
      } else if (aTrack.xTo > aTrack.getOriginX() && aTrack.yTo < aTrack.getOriginY()) {
        result = Quadrant[Quadrant.NORTH_EAST];
      } else if (aTrack.xTo < aTrack.getOriginX() && aTrack.yTo < aTrack.getOriginY()) {
        result = Quadrant[Quadrant.NORTH_WEST];
      } else if (aTrack.xTo < aTrack.getOriginX() && aTrack.yTo > aTrack.getOriginY()) {
        result = Quadrant[Quadrant.SOUTH_WEST];
      }
    }

    return result;
  }

  getTrackStartX(aTrack: Track): number {
    if (aTrack.parentTrack != null) {
      return aTrack.parentTrack.xTo;
    }
    return aTrack.xFrom;
  }

  getTrackStartY(aTrack: Track): number {
    if (aTrack.parentTrack != null) {
      return aTrack.parentTrack.yTo;
    }
    return aTrack.yFrom;
  }

  generateWaggonTooltip(waggon: Waggon): string {
    return 'Wagen-Nr.: ' + waggon.waggonNumber + '\n Wagen-Länge: ' + waggon.length;
  }
}
