<template>
  <g class="choropleth">
    <path v-for="feature in features"
          :id="feature.id"
          :name="feature.properties.name"
          fill="gray"
          class="path geometry"
          stroke-width="1px"
          stroke="black"
    >
    </path>
  </g>
</template>

<script>
export const ChoroplethMapProperties = {
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
    default: () => 0,
  },
  width: {
    type: Number,
    default: () => 0
  },
  features: {
    type: Array,
    default: () => [],
  },
  canvas: {
    type: Object,
    default: () => {
    },
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
    projection: function() {
      return d3.geoMercator()
               .center([ 0, 0 ])
               .translate([
                            (this.width / 2) + this.x,
                            (this.height / 2) + this.y ])
               .scale(this.width / (2 * Math.PI))
    }
  },
  methods: {
    draw() {
      const features = {
        type: 'FeatureCollection',
        features: this.features,
      }
      const path = d3.geoPath()
                     .projection(
                       this.projection);
      const geometries = d3.selectAll('.path.geometry')
                           .data(this.features)
                           .attr('d', path)
                           .on('click', (e) => {
                             this.$emit('clicked', e)
                           });
      this.$emit(ChoroplethMapEvents.CREATED, { geometries });
    },
    clicked(e) {
      this.$emit('clicked', e);
    },
  },
  mounted() {
    this.draw();
  },
  updated() {
    this.draw();
  },
}
</script>
