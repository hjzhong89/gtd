<template>
  <div :id="id" class="choropleth container">
    <svg :height="height + margin.top + margin.bottom"
         :width="width + margin.left + margin.right"
         class="choropleth canvas"></svg>
  </div>
</template>

<script>
import * as d3 from 'd3';

const worldCountries = require('../assets/world_countries.json');

export const ChoroplethProperties = {
  id: String,
  countries: {
    type: Array,
    default: () => [],
  },
  height: {
    type: Number,
    default: 800,
  },
  width: {
    type: Number,
    default: 1200,
  },
  margin: {
    type: Object,
    default: () => ({
      top: 50,
      bottom: 50,
      left: 50,
      right: 50,
    }),
  },
};

export default {
  name: "ChoroplethComponent",
  props: ChoroplethProperties,
  computed: {
    topology: function() {
      if (Array.isArray(this.countries) && this.countries.length > 0) {
        return this.countries.map((i) => worldCountries.features[i])
      } else {
        return worldCountries.features;
      }
    }
  },
  methods: {

  },
  mounted: function () {
    const features = {
      type: 'FeatureCollection',
      features: this.topology
    }
    const path = d3.geoPath()
      .projection(
        d3.geoMercator()
        .fitExtent([
          [this.margin.left, this.margin.top],
          [this.margin.left + this.width, this.margin.top + this.height],
        ], features)
      )
    d3.select(`#${this.id} svg`)
      .selectAll('path')
      .data(this.topology)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('class', d => 'path country')

  }
}
</script>

<style>
.choropleth.canvas {
  background-color: #2c3e50;
  overflow: visible;
}

.path.country {
  stroke: black;
  fill: cadetblue;
}
</style>
