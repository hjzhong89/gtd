<template>
  <div :id="id" class="choropleth container">
    <svg :height="height" :width="width" class="choropleth canvas"></svg>
  </div>
</template>

<script>
import * as d3 from 'd3';

const worldCountries = require('../assets/world_countries.json');

export const ChoroplethProperties = {
  id: String,
  height: {
    type: Number,
    default: 800,
  },
  width: {
    type: Number,
    default: 1200,
  },
  margin: {
    left: {
      type: Number,
      default: 50
    },
    right: {
      type: Number,
      default: 50
    },
    top: {
      type: Number,
      default: 50
    },
    bottom: {
      type: Number,
      default: 50
    },
  },
  topology: {
    type: Object,
    default: () => [worldCountries.features[0], worldCountries.features[1], worldCountries.features[2]],
  },
  projection: {
    type: Function,
    default: () => d3.geoMercator
  }
};


export default {
  name: "ChoroplethComponent",
  props: ChoroplethProperties,
  mounted: function () {
    d3.select(`#${this.id} svg`)
      .selectAll('path')
      .data(this.topology)
      .enter()
      .append('path')
      .attr('d', d3.geoPath(d3.geoMercator()))
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
  fill: red;
}
</style>
