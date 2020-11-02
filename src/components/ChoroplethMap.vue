<template>
  <div :id="id" class="choropleth container">
    <svg :height="height + margin.top + margin.bottom"
         :width="width + margin.left + margin.right"
         class="choropleth canvas">
      <slot/>
    </svg>
  </div>
</template>

<script>
import * as d3 from 'd3';

export const ChoroplethMapProperties = {
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
    type: Object,
    default: () => ({
      top: 50,
      bottom: 50,
      left: 50,
      right: 50,
    }),
  },
  topology: {
    type: Array,
    default: () => [],
  }
};

export const ChoroplethMapEvents = {
  CLEAR: 'clear',
  CREATED: 'created',
}
export default {
  name: 'ChoroplethMap',
  props: ChoroplethMapProperties,
  computed: {
    canvas() {
      return d3.select(`#${this.id} svg`);
    }
  },
  methods: {
    clear() {
      this.canvas.selectAll('*').remove();
      this.$emit(ChoroplethMapEvents.CLEAR, this.canvas);
    },
    draw() {
      const features = {
        type: 'FeatureCollection',
        features: this.topology,
      }
      const path = d3.geoPath()
        .projection(
          d3.geoMercator()
            .fitExtent([
              [this.margin.left, this.margin.top],
              [this.margin.left + this.width, this.margin.top + this.height],
            ], features),
        );
      this.canvas.selectAll('path')
        .data(this.topology)
        .enter()
        .append('path')
        .attr('id', (d) => d.id)
        .attr('name', (d) => d.properties.name)
        .attr('d', path)
        .attr('fill', 'gray')
        .attr('class', 'path geometry')
        .on('click', (e) => {
          this.$emit('clicked', e)
        })

      const geometries = this.canvas.selectAll('.path.geometry');

      this.$emit(ChoroplethMapEvents.CREATED, {
        canvas: this.canvas,
        geometries,
      });
    }
  },
  mounted() {
    this.draw();
  },
  updated() {
    this.clear();
    this.draw();
  }
}
</script>
<style>
.choropleth.canvas {
  background-color: #2c3e50;
  overflow: visible;
}
</style>
