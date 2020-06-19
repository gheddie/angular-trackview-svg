import {Component, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Track} from '../track';
import {Waggon} from '../waggon';
import {Point} from '../point';
import {DomSanitizer, SafeStyle} from '@angular/platform-browser';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.css']
})
export class ProgressComponent implements OnInit, OnChanges {

  tracks: Track[];

  // waggons: Waggon[];

  showDragging: boolean = false;

  radius = 54;
  circumference = 2 * Math.PI * this.radius;
  dashoffset: number;
  value: number = 83;

  private sanitizer: DomSanitizer;

  constructor(private aSanitizer: DomSanitizer) {
    this.progress(83);
    this.sanitizer = aSanitizer;
  }

  ngOnInit(): void {

    console.log(this.sanitizer);

    const waggonsT1 = [
      // t1
      new Waggon('W1', null, 300),
      new Waggon('W2', null, 110),
      // new Waggon('W3', null, 55)
    ];

    const t1 = new Track('T1', 250, 150, 450, 150, waggonsT1);

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
    const deg = 78;
    return this.sanitizer.bypassSecurityTrustStyle('rotate(' + deg + 'deg)');
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

    return waggonPos;
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
}
