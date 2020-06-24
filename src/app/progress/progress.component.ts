import {Component, HostListener, OnChanges, OnInit, SimpleChanges} from '@angular/core';
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

  private scrolledToTop: number;

  private scrolledToLeft: number;

  public zoomFactor: number = 1;

  constructor(private aSanitizer: DomSanitizer) {
    this.sanitizer = aSanitizer;
  }

  ngOnInit(): void {

    const t1 = new Track('T1', 100, 100, 500, 100, [
      new Waggon('W1', 25),
      new Waggon('W2', 50),
      new Waggon('W3', 35),
    ], null);

    const t2 = new Track('T2', null, null, 700, 300, [
      new Waggon('W4', 25),
      new Waggon('W5', 15)
    ], t1);

    const t3 = new Track('T3', null, null, 1200, 100, [
      new Waggon('W6', 125)
    ], t1);

    const t4 = new Track('T4', null, null, 1200, 300, [
      new Waggon('W7', 125)
    ], t2);

    const t5 = new Track('T5', null, null, 1200, 800, [
      new Waggon('W8', 125)
    ], t2);

    this.tracks = [
      t1, t2, t3, t4, t5
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

    const diffHeight = Math.abs(this.getTrackOriginY(aWaggon.track) - aWaggon.track.yTo);
    const diffLength = Math.abs(this.getTrackOriginX(aWaggon.track) - aWaggon.track.xTo);

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

    const diffX = track.xTo - this.getTrackOriginX(track);
    const diffY = track.yTo - this.getTrackOriginY(track);

    const trackLenght = Math.sqrt((Math.pow(track.xTo - this.getTrackOriginX(track), 2)) + (Math.pow(track.yTo - this.getTrackOriginY(track), 2)));

    let xRes = 0;
    let yRes = 0;

    if (inverted) {
      aDistanceFromOrigin = trackLenght - aDistanceFromOrigin;
    }

    Math.sqrt((Math.pow(track.xTo - this.getTrackOriginX(track), 2)) + (Math.pow(track.yTo - this.getTrackOriginY(track), 2)));

    xRes = track.xTo - (track.xTo - this.getTrackOriginX(track)) * aDistanceFromOrigin / trackLenght;
    yRes = track.yTo - (track.yTo - this.getTrackOriginY(track)) * aDistanceFromOrigin / trackLenght;

    return new Point(xRes * this.zoomFactor, yRes * this.zoomFactor);
  }

  getQuadrant(aTrack: Track): Quadrant {

    let result = null;

    if (this.getTrackOriginY(aTrack) === aTrack.yTo) {
      if (this.getTrackOriginX(aTrack) < aTrack.xTo) {
        result = Quadrant[Quadrant.EAST];
      } else {
        result = Quadrant[Quadrant.WEST];
      }
    } else if (this.getTrackOriginX(aTrack) === aTrack.xTo) {
      if (this.getTrackOriginY(aTrack) < aTrack.yTo) {
        result = Quadrant[Quadrant.SOUTH];
      } else {
        result = Quadrant[Quadrant.NORTH];
      }
    } else {
      if (aTrack.xTo > this.getTrackOriginX(aTrack) && aTrack.yTo > this.getTrackOriginY(aTrack)) {
        result = Quadrant[Quadrant.SOUTH_EAST];
      } else if (aTrack.xTo > this.getTrackOriginX(aTrack) && aTrack.yTo < this.getTrackOriginY(aTrack)) {
        result = Quadrant[Quadrant.NORTH_EAST];
      } else if (aTrack.xTo < this.getTrackOriginX(aTrack) && aTrack.yTo < this.getTrackOriginY(aTrack)) {
        result = Quadrant[Quadrant.NORTH_WEST];
      } else if (aTrack.xTo < this.getTrackOriginX(aTrack) && aTrack.yTo > this.getTrackOriginY(aTrack)) {
        result = Quadrant[Quadrant.SOUTH_WEST];
      }
    }

    return result;
  }

  getTrackStartX(aTrack: Track): number {
    if (aTrack.parentTrack != null) {
      return aTrack.parentTrack.xTo * this.zoomFactor;
    }
    return aTrack.xFrom * this.zoomFactor;
  }

  getTrackStartY(aTrack: Track): number {
    if (aTrack.parentTrack != null) {
      return aTrack.parentTrack.yTo * this.zoomFactor;
    }
    return aTrack.yFrom * this.zoomFactor;
  }

  getTrackOriginX(aTrack: Track): number {
    if (aTrack.parentTrack != null) {
      return aTrack.parentTrack.xTo;
    }
    return aTrack.xFrom;
  }

  getTrackOriginY(aTrack: Track): number {
    if (aTrack.parentTrack != null) {
      return aTrack.parentTrack.yTo;
    }
    return aTrack.yFrom;
  }

  generateWaggonTooltip(waggon: Waggon): string {
    return 'Wagen-Nr.: ' + waggon.waggonNumber + '\n Wagen-Länge: ' + waggon.length + '\n Gleis: ' + waggon.track.trackNumber;
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
      return 'green';
    }
    return 'grey';
  }

  draggingGhostTop(): number {
    // watch scrolling
    let result = 0;
    if (this.scrolledToTop > 0) {
      result = this.mouseY + this.scrolledToTop;
    } else {
      result = this.mouseY;
    }
    return result;
  }

  draggingGhostLeft(): number {
    // watch scrolling
    let result = 0;
    if (this.scrolledToLeft > 0) {
      result = this.mouseX + this.scrolledToLeft;
    } else {
      result = this.mouseX;
    }
    return result;
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
      const selection = this.collectWaggons(true);
      console.log(selection.length + ' waggons dropped on waggon: ' + aWaggon.waggonNumber);
      this.moveSelectedWaggons(aWaggon);
      // this.moveSelectedWaggonsToTarget(aWaggon);
      this.waggonHitForDrag = false;
      this.deselectWaggons();
      aWaggon.dropTarget = false;
      this.dropTargetWaggon = null;
    }
  }

  private deselectWaggons(): void {
    console.log('deselectWaggons...');
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

  private moveSelectedWaggons(aTargetWaggon: Waggon): void {
    // remove
    const removedWaggons = [];
    for (const wg of this.collectWaggons(true)) {
      const trackWaggons = wg.track.waggons;
      const index = trackWaggons.indexOf(wg, 0);
      removedWaggons.push(trackWaggons[index]);
      if (index > -1) {
        trackWaggons.splice(index, 1);
      }
    }
    console.log('removed ' + removedWaggons.length + ' waggons.');
    // add
    const waggonIndex = aTargetWaggon.track.waggons.indexOf(aTargetWaggon);
    for (let addIndex = removedWaggons.length - 1; addIndex >= 0; addIndex--) {
      console.log('moving: ' + removedWaggons[addIndex].waggonNumber + ' to track: ' + aTargetWaggon.track.trackNumber);
      removedWaggons[addIndex].track = aTargetWaggon.track;
      aTargetWaggon.track.waggons.splice(waggonIndex + 1, 0, removedWaggons[addIndex]);
    }
  }

  // @HostListener('scroll', ['$event'])
  public trackViewScrolled($event: Event) {
    const trackView: HTMLDivElement = (event.srcElement as HTMLDivElement);
    this.scrolledToTop = trackView.scrollTop;
    this.scrolledToLeft = trackView.scrollLeft;
    console.log('scrolled to [top:' + this.scrolledToTop + '|left:' + this.scrolledToLeft + ']');
  }

  zoomIn() {
    console.log('zoomIn');
    this.zoomFactor = this.zoomFactor + 0.1;
  }

  zoomOut() {
    console.log('zoomOut');
    this.zoomFactor = this.zoomFactor - 0.1;
  }

  resetZoom() {
    this.zoomFactor = 1;
  }
}
