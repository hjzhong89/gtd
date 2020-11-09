<template>
  <g class="choropleth">
    <path v-for="feature in features"
          :id="feature.id"
          :name="feature.properties.name"
          fill="gray"
          class="path geometry"
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
  methods: {
    draw() {
      const features = {
        type: 'FeatureCollection',
        features: this.features,
      }
      const path = d3.geoPath()
        .projection(
          d3.geoMercator()
            .fitExtent([
              [this.x, this.y],
              [this.x + this.width, this.y + this.height],
            ], features),
        );
      const geometries = d3.selectAll('.path.geometry')
        .data(this.features)
        .attr('d', path)
        .on('click', (e) => {
          this.$emit('clicked', e)
        });
      this.$emit(ChoroplethMapEvents.CREATED, {geometries});
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
