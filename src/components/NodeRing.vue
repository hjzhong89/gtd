<template>
  <g class="nodering">
    <g v-for="pin in pins">
      <path :d="pin.d"
            :stroke="pin.color"
            fill="none"
            class="thread"
      ></path>
      <circle :cx="pin.cx"
              :cy="pin.cy"
              :fill="pin.color"
              r="8px"
              class="pin"></circle>
    </g>
    <circle :r="r"
            :cx="center.x"
            :cy="center.y"
            fill="none"
            stroke="black"
            stroke-width="5px"
            class="ring"
    ></circle>
    <g v-for="pin in pins">
      <circle :cx="pin.ax"
              :cy="pin.ay"
              fill="black"
              r="5px"
              class="pin anchor"></circle>
    </g>
    <text :x="center.x"
          :y="center.y - r"
          class="nodering label"
    >{{ label }}
    </text>
  </g>
</template>
<script>
const tau = Math.PI * 2;
export default {
  name: 'NodeRing',
  props: {
    center: {
      type: Object,
      default: () => ({
        x: 0,
        y: 0,
      })
    },
    label: {
      type: String,
      default: () => '',
    },
    r: {
      type: Number,
      default: () => 75
    },
    nodes: {
      type: Array,
      default: () => [],
    },
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
    }
  },
  computed: {
    pins() {
      const projection = d3.geoMercator();
      projection.scale(this.canvasWidth / tau)
        .translate([
          (this.canvasWidth + this.margin.left + this.margin.right) / 2,
          (this.canvasHeight + this.margin.top + this.margin.bottom) / 2,
        ]);

      return this.nodes.map(n => {
        const [cx, cy] = projection([n.longitude, n.latitude]);
        const [ax, ay] = this.getRingAnchor(cx, cy)
        const d = this.getPath([[cx, cy], [ax, ay]]);
        return {cx, cy, ax, ay, d, color: n.color}
      })
    },
  },
  methods: {
    getPath([[x0, y0], [x1, y1]]) {
      let d = `M ${x0} ${y0} `
      const Q1 = x0 + (x1 - x0) / 2
      const Q2 = Math.max(y0,y1) + Math.max(10, Math.sqrt(Math.abs(y1 - y0)))
      d += `Q ${Q1} ${Q2} `
      d += `${x1} ${y1}`
      return d;
    },
    getRingAnchor() {
      const angle = tau * Math.random();
      const px = this.center.x + Math.cos(angle) * this.r
      const py = this.center.y + Math.sin(angle) * this.r
      return [px, py]
    },
  }
}
</script>
<style>
.nodering.label {
  font-size: 2em;
  font-weight: bold;
  text-anchor: middle;
}
.thread {
  opacity: 75%
}
</style>
