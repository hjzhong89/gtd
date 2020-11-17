<template>
  <g class="point-group">
    <circle v-for="(circle, i) in circles"
            :key="i"
            v-bind="circle"
            class="point"
    ></circle>
  </g>
</template>
<script>
export default {
  name: 'PointGroup',
  props: {
    canvasWidth: {
      type: Number,
      default: () => 0,
    },
    canvasHeight: {
      type: Number,
      default: () => 0,
    },
    margin: {
      type: Object,
      default: () => ({top: 0, bottom: 0, left: 0, right: 0})
    },
    points: {
      type: Array,
      default: () => [],
    }
  },
  computed: {
    circles() {
      const projection = d3.geoMercator();
      projection.scale(this.canvasWidth / (2 * Math.PI))
        .translate([
          (this.canvasWidth + this.margin.left + this.margin.right) / 2,
          (this.canvasHeight + this.margin.top + this.margin.bottom) / 2,
        ]);

      return this.points.map(p => {
        const [cx, cy] = projection([p.longitude, p.latitude])
        return {
          ...p,
          cx,
          cy,
        }
      })
    },
  },
}
</script>
