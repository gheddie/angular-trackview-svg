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
export class ProgressComponent implements OnInit {

  private readonly WAGGON_GAP_INITIAL = 30;

  private readonly WAGGON_GAP = 5;

  private readonly DRAG_ORIGIN_DISTANCE = 25;

  tracks: Track[];

  private sanitizer: DomSanitizer;

  private trackAngle: number;

  private waggonAngle: number;

  private mouseX: number = 0;

  private mouseY: number = 0;

  private waggonHitForDrag: boolean = false;

  private dragOriginX: number;

  private dragOriginY: number;

  private distanceFromDragOrigin: number;

  private dropTargetWaggon: Waggon = null;

  constructor(private aSanitizer: DomSanitizer) {
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
    return this.sanitizer.bypassSecurityTrustStyle('rotate(' + degrees + 'deg)');
  }

  private calculateWaggonAngle(aWaggon: Waggon) {

    const diffHeight = Math.abs(aWaggon.track.getOriginY() - aWaggon.track.yTo);
    const diffLength = Math.abs(aWaggon.track.getOriginX() - aWaggon.track.xTo);

    let result = 0;
    const quadrant = this.getQuadrant(aWaggon.track);
    const atan = Math.atan(diffHeight / diffLength) * (180 / Math.PI);

    switch (+Quadrant[quadrant]) {
      case Quadrant.NORTH_EAST:
        result = - atan;
        break;
      case Quadrant.SOUTH_WEST:
        result = - atan;
        break;
      default:
        result = atan;
        break;
    }
    this.waggonAngle = result;
    return result;
  }

  dragstart($event: DragEvent) {
    console.log('dragstart');
  }

  showDraggingGhost(): string {
      if (this.waggonHitForDrag
        && this.distanceFromDragOrigin > this.DRAG_ORIGIN_DISTANCE
        && this.collectWaggons(true).length > 0) {
        return 'visible';
      }
      return 'hidden';
  }

  collectWaggons(onlySelected: boolean): Waggon[] {

    const collectedWaggons = [];
    for (const tr of this.tracks) {
      if (tr.waggons != null) {
        for (const wg of tr.waggons) {
          if (!onlySelected) {
            // add anyway
            collectedWaggons.push(wg);
          } else {
            // only add if selected
            if (wg.selected) {
              collectedWaggons.push(wg);
            }
          }
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
    return waggonPos + (aWaggon.length / 2) + this.WAGGON_GAP_INITIAL + (this.WAGGON_GAP * (waggonIndex));
  }

  findWaggonIndexOnTrack(aWaggon: Waggon): number {
    let pos = 0;
    for (const wg of aWaggon.track.waggons) {
      if (aWaggon === wg) {
        return pos;
      } else {
        pos += 1;
      }
    }
    return pos;
  }

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
    return 20;
  }

  private calculateTrackPoint(track: Track, aDistanceFromOrigin: number, inverted: boolean): Point {

    const diffX = track.xTo - track.getOriginX();
    const diffY = track.yTo - track.getOriginY();

    const trackLenght = Math.sqrt((Math.pow(track.xTo - track.getOriginX(), 2)) + (Math.pow(track.yTo - track.getOriginY(), 2)));

    let xRes = 0;
    let yRes = 0;

    if (inverted) {
      aDistanceFromOrigin = trackLenght - aDistanceFromOrigin;
    }Math.sqrt((Math.pow(track.xTo - track.getOriginX(), 2)) + (Math.pow(track.yTo - track.getOriginY(), 2)));

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

  generateDraggingGhost(): string {
    let result = '';
    for (const wg of this.collectWaggons(true)) {
      result += wg.waggonNumber + '\n';
    }
    return result;
  }

  waggonClicked(aWaggon: Waggon): void {
    aWaggon.selected = !aWaggon.selected;
  }

  waggonFill(aWaggon: Waggon): string {
    if (aWaggon.selected) {
      return 'red';
    } else if (aWaggon.dropTarget) {
      return 'blue';
    }
    return 'grey';
  }

  draggingGhostTop(): number {
    return this.mouseY;
  }

  draggingGhostLeft(): number {
    return this.mouseX;
  }

  mouseMovedOnParent($event: MouseEvent): void {

    this.mouseX = (event as MouseEvent).clientX + 5;
    this.mouseY = (event as MouseEvent).clientY + 5;

    this.distanceFromDragOrigin = Math.sqrt((Math.pow(this.mouseX - this.dragOriginX, 2)) + (Math.pow(this.mouseY - this.dragOriginY, 2)));
    // console.log('distanceFromDragOrigin: ' + this.distanceFromDragOrigin);
  }

  // ---

  mouseDownOnWaggon($event: MouseEvent, aWaggon: Waggon) {
    // console.log('mousedown [' + aWaggon.waggonNumber + ']');
    if (aWaggon.selected) {
      this.waggonHitForDrag = true;
      this.dragOriginX = (event as MouseEvent).clientX;
      this.dragOriginY = (event as MouseEvent).clientY;
    }
  }

  mouseUpOnWaggon($event: MouseEvent, aWaggon: Waggon) {
    // console.log('mouseup [' + aWaggon.waggonNumber + ']');
    if (this.waggonHitForDrag) {
      console.log(this.collectWaggons(true).length + ' waggons dropped on waggon: ' + aWaggon.waggonNumber);
      this.waggonHitForDrag = false;
      this.deselectWaggons();
      aWaggon.dropTarget = false;
      this.dropTargetWaggon = null;
    }
  }

  private deselectWaggons(): void {
    for (const wg of this.collectWaggons(true)) {
      wg.selected = false;
    }
  }

  mouseUpOnParent(): void {
    this.waggonHitForDrag = false;
  }

  waggonTriggeredAsDropTarget(aWaggon: Waggon, aTriggered: boolean): void {
    if (!aWaggon.selected && this.waggonHitForDrag) {
      if (aTriggered) {
        console.log('waggon ' + aWaggon.waggonNumber + ' triggered as drop target.');
        aWaggon.dropTarget = true;
        this.dropTargetWaggon = aWaggon;
      } else {
        console.log('waggon ' + aWaggon.waggonNumber + ' removed as drop target.');
        aWaggon.dropTarget = false;
        this.dropTargetWaggon = null;
      }
    }
  }
}
