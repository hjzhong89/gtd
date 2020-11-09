<template>
  <g class="pinwheel">
    <circle r="5"
            :cx="center.x"
            :cy="center.y"
            fill="green"
    ></circle>
    <text :x="center.x" :y="center.y">{{label}}</text>
  </g>
</template>

<script>
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
    offsetX: {
      type: Number,
      default: () => 0,
    },
    offsetY: {
      type: Number,
      default: () => 0,
    },
    canvasWidth: {
      type: Number,
      default: () => 0,
    },
    canvasHeight: {
      type: Number,
      default: () => 0,
    },
    label: {
      type: String,
      default: () => '',
    }
  },
  computed: {
    /**
     * Converts latitude and longitude to x,y coordinates using mercator projection.
     */
    center: function () {
      const feature = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [this.longitude, this.latitude]
        },
      };
      const projection = d3.geoMercator()
      .fitExtent([
        [this.offsetX, this.offsetY],
        [this.offsetX + this.canvasWidth, this.offsetY + this.canvasHeight]
      ], feature)

      const result = projection(feature)
      console.log(result)
      return {x: result[0], y: result[1]}
    },
    /**
     * Converts longitude coordinate to an x value on a mercator projection
     * @returns {number}
     */
    x: function () {
      return this.offsetX + (this.longitude + 180) * (this.canvasWidth / 360);
    },
    /**
     * Converts latitude coordinate to a y value on a mercator projection
     * @returns {number}
     */
    y: function () {
      const radian = this.latitude * (Math.PI / 180)
      const tangent = Math.tan((Math.PI / 4) + (radian / 2))
      const northing = Math.log(tangent) / (2 * Math.PI)
      return this.offsetY + (this.canvasHeight / 2) - (this.canvasHeight * northing);
    },
  }
}
</script>
<style>
.pinwheel text {
  font-weight: bold;
  font-size: 1.2em;
  fill: black;
}
</style>
