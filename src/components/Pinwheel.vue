<template>
  <g class="pinwheel">
    <circle :r="5/k"
            :cx="center.x"
            :cy="center.y"
            fill="green"
            class="pinwheel center"
    ></circle>
    <circle :r="r/k"
            :cx="center.x"
            :cy="center.y"
            :stroke-width="`${1/k}px`"
            :stroke="borderStroke"
            fill="none"
            class="pinwheel border"
    ></circle>
    <!--    <text :x="center.x"-->
    <!--          :y="center.y">{{ label }}</text>-->
  </g>
</template>
<script>
const tau = Math.PI * 2;

export default {
  name: 'Pinwheel',
  props: {
    borderStroke: {
      type: String,
      default: () => 'black'
    },
    canvasHeight: {
      type: Number,
      default: () => 0,
    },
    canvasWidth: {
      type: Number,
      default: () => 0,
    },
    k: {
      type: Number,
      default: () => 1,
    },
    label: {
      type: String,
      default: () => '',
    },
    latitude: {
      type: Number,
      default: () => 0,
    },
    longitude: {
      type: Number,
      default: () => 0,
    },
    margin: {
      type: Object,
      default: () => ({
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      }),
    },
    points: {
      type: Array,
      default: () => [],
    },
    r: {
      type: Number,
      default: () => 0,
    },
  },
  computed: {
    /**
     * Converts latitude and longitude to x,y coordinates using mercator projection.
     */
    center() {
      const projection = d3.geoMercator();
      projection.scale(this.canvasWidth / tau)
        .translate([
          (this.canvasWidth + this.margin.left + this.margin.right) / 2,
          (this.canvasHeight + this.margin.top + this.margin.bottom) / 2,
        ]);
      const [x, y] = projection([this.longitude, this.latitude]);
      return {x, y};
    },
  },
};
</script>
<style>
.pinwheel text {
  font-weight: bold;
  font-size: 8pt;
  fill: black;
}
</style>
