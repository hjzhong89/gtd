<template>
  <g class="linear-gradient-legend">
    <linearGradient :id="`${this.id}-gradient`">
      <stop v-for="(stop, i) in stops"
            :key="i"
            :offset="stop.offset"
            :stop-color="stop.color"></stop>
    </linearGradient>
    <rect :height="height"
          :width="width"
          :x="x"
          :y="y"
          :fill="`url('#${this.id}-gradient')`"
    ></rect>
    <g>
      <text v-for="(label, i) in labels"
            :key="i"
            :x="label.x"
            :y="label.y"
      >{{ label.val }}
      </text>
    </g>
  </g>
</template>

<script>
import * as d3 from 'd3';

export default {
  name: 'LinearGradientLegend',
  props: {
    id: {
      type: String,
      validator(val) {
        return typeof val === 'string' && val.length > 1;
      },
    },
    x: {
      type: Number,
      default: () => 0,
    },
    y: {
      type: Number,
      default: () => 0,
    },
    height: {
      type: Number,
      default: () => 25,
    },
    width: {
      type: Number,
      default: 1000,
    },
    min: {
      type: Number,
      default: () => 0,
    },
    max: {
      type: Number,
      default: () => 100,
    },
    exponent: {
      type: Number,
      default: () => 1,
    },
    interpolator: {
      type: String,
      default: () => 'interpolateReds',
    },
  },
  computed: {
    stops() {
      const scale = d3.scalePow()
        .exponent(this.exponent)
        .domain([this.min, this.max])
        .range([0, 100])
        .nice();

      const stops = [0, ...scale.ticks(3), this.max];
      return stops.map((stop) => {
        const offset = scale(stop);
        const color = d3[this.interpolator](offset / 100);
        return { offset, color };
      });
    },
    labels() {
      const xScale = d3.scalePow()
        .exponent(this.exponent)
        .domain([this.min, this.max])
        .nice()
        .range([this.x + 10, this.width - 50]);

      return xScale.ticks().map((val) => ({
        val,
        x: xScale(val),
        y: this.y + this.height - 5,
      }));
    },
  },
  data() {
    return {};
  }
  ,
};
</script>
