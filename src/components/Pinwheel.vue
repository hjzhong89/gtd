<template>
  <g class="pinwheel">
    <circle r="5"
            :cx="center.x"
            :cy="center.y"
            fill="green"
    ></circle>
    <text :x="center.x" :y="center.y">{{ label }}</text>
  </g>
</template>

<script>
const halfPi = Math.PI / 2
const quarterPi = Math.PI / 4
const tau = Math.PI * 2

export default {
  name: 'Pinwheel',
  props: {
    latitude: {
      type: Number,
      default: () => 0,
    },
    longitude: {
      type: Number,
      default: () => 0,
    },
    width: {
      type: Number,
      default: () => 0,
    },
    height: {
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
      })
    },
    label: {
      type: String,
      default: () => '',
    },
  },
  computed: {

    /**
     * Converts latitude and longitude to x,y coordinates using mercator projection.
     */
    center: function() {
      const projection = d3.geoMercator();
      projection.scale(this.width / tau)
                .translate([
                             (this.width + this.margin.left + this.margin.right) / 2,
                             (this.height + this.margin.top + this.margin.bottom) / 2
                           ])
      const lambda = this.longitude * (Math.PI / 180)
      const phi = this.latitude * (Math.PI / 180)

      console.log(this.longitude, this.latitude)

      const [ x, y ] = projection([ this.longitude, this.latitude ])
      console.log('x,y', x, y)
      return { x, y }
    },
  },
}
</script>
<style>
.pinwheel text {
  font-weight: bold;
  font-size: 1.2em;
  fill: black;
}
</style>
