<template>
  <g class="gtd-key" v-if="colorScale">
    <linearGradient :id="`${this.name}-gradient`">
      <stop v-for="item in keyItems"
            :offset="`${item.offset}%`"
            :stop-color="item.rgb"></stop>
    </linearGradient>
    <rect :height="height"
          :width="width"
          :x="x"
          :y="y"
          :fill="`url('#${this.name}-gradient')`"
    ></rect>

    <g>
      <text v-for="item in keyItems"
            :x="item.x"
            :y="y + height - 5"
            class="gtd-key-label"
      >{{ item.label }}
      </text>
    </g>
  </g>
</template>

<script>
import {GtdAPIClient as gtd} from "@/api/GTDClient";
const EXPONENT = .5
export const GTDMapperProps = {
  name: {
    type: String,
  },
  width: {
    type: Number,
    default: () => 500
  },
  height: {
    type: Number,
    default: () => 25
  },
  x: {
    type: Number,
    default: () => 25,
  },
  y: {
    type: Number,
    default: () => 25,
  }
}

export default {
  name: 'GTDMapper',
  props: GTDMapperProps,
  computed: {
    domain: function () {
      const values = Object.values(this.casualties);
      const max = d3.max(values)
      return d3.scalePow()
        .exponent(EXPONENT)
        .domain([0, max])
        .ticks(15)
    },
    colorScale: function () {
      return d3.scalePow()
        .exponent(EXPONENT)
        .domain(this.domain)
        .range([0, 1])
    },
    keyItems: function () {
      const values = Object.values(this.casualties);
      const max = d3.max(values)
      const stops = d3.scalePow()
        .exponent(EXPONENT)
        .domain([0, max])
        .range([0, 100])
      const xScale = d3.scalePow()
        .exponent(EXPONENT)
        .domain([0, max])
        .range([this.x + 5, this.width - 5])

      return this.domain.map((val, i) => {
        const offset = stops(val);
        const rgb = d3.interpolateReds(offset / 100)
        const x = xScale(val)
        const label = i % 3 === 0 ? val
          : this.domain.length - 1 === i ? val
            : ''
        return {offset, rgb, label, x}
      });
    }
  },
  /**
   * Load all incidents and initialize domain, quantiles, and scale for incidents by country.
   * @returns {Promise<void>}
   */
  async created() {
    const [incidents, casualties] = await this.initData();
    this.incidents = incidents;
    this.casualties = casualties;

    this.colorize();
  },
  methods: {
    async initData() {
      return Promise.all([
        gtd.getIncidents(),
        gtd.getCasualties(),
      ])
    },
    rgb(count) {
      const scaled = this.colorScale(count);
      return d3.interpolateReds(scaled);
    },
    colorize(canvas) {
      if (canvas) {
        this.canvas = canvas;
      }
      this.canvas.selectAll('.path.geometry')
        .attr('fill', ele => {
          const count = this.casualties[ele.id]
            ? this.casualties[ele.id]
            : 0;
          return this.rgb(count)
        });
    }
  },
  data() {
    return {
      canvas: {},
      incidents: [],
      casualties: {},
    }
  },
}
</script>
<style>
.gtd-key-label {
  font-weight: bold;
  font-size: 1em;
}
</style>
