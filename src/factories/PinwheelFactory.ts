import * as d3 from 'd3';

export type CreatePinwheelOpts = {
  latitude: number,
  longitude: number,
}

export type PinwheelProps = {
  center: object,
}

export default class PinwheelFactory {
  readonly latitudeScale: Function;
  readonly longitudeScale: Function;

  constructor(width: number, height: number) {
    this.latitudeScale = d3.scaleLinear()
      .domain([-180, 180])
      .range([height, 0])
    this.longitudeScale = d3.scaleLinear()
      .domain([-180, 180])
      .range([0, width])
  };

  createPinwheel(opts: CreatePinwheelOpts): PinwheelProps {
    const y = this.latitudeScale(opts.latitude);
    const x = this.longitudeScale(opts.longitude)

    return {
      center: {x, y}
    }
  }
};
