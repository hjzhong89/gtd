<template>
  <div>
    <svg :height="height + margin.top + margin.bottom"
         :width="width + margin.left + margin.right"
         class="gtd choropleth canvas"
         id="gtd-canvas"
         @click="reset"
    >
      <ChoroplethMap id="gtd-map"
                     :features="features"
                     :canvas-width="width"
                     :canvas-height="height"
                     :x="margin.left"
                     :y="margin.top"
                     @created="handleCreated"
                     @clicked="handleClicked"
                     ref="gtdMap"
      >
      </ChoroplethMap>
<!--      <g id="gtd-pinwheels" v-if="focused">-->
<!--        <Pinwheel v-for="(pinwheel, i) in pinwheels"-->
<!--                  :key="i"-->
<!--                  :border-stroke="pinwheel.borderStroke"-->
<!--                  :canvas-center="center"-->
<!--                  :canvas-height="height"-->
<!--                  :canvas-width="width"-->
<!--                  :k="k"-->
<!--                  :label="pinwheel.label"-->
<!--                  :latitude="pinwheel.latitude"-->
<!--                  :longitude="pinwheel.longitude"-->
<!--                  :margin="margin"-->
<!--                  :points="pinwheel.points"-->
<!--                  :r="pinwheel.r"-->
<!--                  ref="gtdPinwheels"-->
<!--        ></Pinwheel>-->
<!--      </g>-->
      <g id="gtd-nkill-ring">
        <circle :cx="center.x"
                :cy="center.y"
                :r="5"
                stroke="5px"
        ></circle>
      </g>
      <LinearGradientLegend v-if="!focused"
                            id="gtd-key"
                            :exponent="exponent"
                            :min="0"
                            :max="maxCasualties"
                            :width="canvasWidth"
      ></LinearGradientLegend>
    </svg>
  </div>
</template>

<script>
import * as d3 from 'd3';
import {GtdAPIClient as gtd} from '@/api/GTDClient';
import LinearGradientLegend from '@/components/LinearGradientLegend.vue';
import ChoroplethMap from '@/components/ChoroplethMap.vue';
import Pinwheel from '@/components/Pinwheel.vue';
import worldCountries from '@/assets/world_countries.json';

const GTDProps = {
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
  exponent: {
    type: Number,
    default: () => 0.5,
  },
};

export default {
  name: 'GTD',
  components: {Pinwheel, ChoroplethMap, LinearGradientLegend},
  props: GTDProps,
  computed: {
    canvasWidth() {
      return this.width + this.margin.left + this.margin.right;
    },
    canvasHeight() {
      return this.height + this.margin.top + this.margin.bottom;
    },
    minCasualties() {
      return d3.min(Object.values(this.countries).map(c => c.totalCasualties));
    },
    maxCasualties() {
      return d3.max(Object.values(this.countries).map(c => c.totalCasualties));
    },
    pinwheels() {
      const scale = d3.scaleSqrt()
        .domain([0, this.maxCasualties])
        .range([1, 5])
      const minRadius = 50;
      const countries = this.incidents
        .reduce((acc, incident) => {
          if (acc[incident.city] === 'Unknown') {
            return acc
          }
          const nkill = scale(incident.nkill) * minRadius

          if (acc[incident.city]) {
            acc[incident.city].r += nkill;
            acc[incident.city].points.push(incident);
          } else {
            acc[incident.city] = {
              latitude: incident.latitude,
              longitude: incident.longitude,
              label: incident.city,
              r: nkill,
              points: [incident],
            };
          }

          return acc;
        }, {});
      return Object.values(countries);
    },
  },
  async created() {
    this.center = {
      x: this.width / 2,
      y: this.height / 2,
    }
    this.countries = await gtd.getCountries();
    this.$refs.gtdMap.draw();
  },
  data() {
    return {
      countries: {},
      features: worldCountries.features,
      focused: false,
      incidents: [],
      k: 1,
      center: {}
    };
  },
  methods: {
    /**
     * Colorize the choropleth map after rendering.
     */
    handleCreated({geometries}) {
      this.colorize({geometries});
    },
    /**
     * Handle onClick event when user clicks on a country
     */
    async handleClicked(e) {
      const id = e.target.id;

      if (!this.focused) {
        gtd.getIncidents({
          country: this.countries[id].name,
          minCasualties: 1,
        }).then((d) => {
            this.incidents = d;
          });
        this.zoom(e);
        this.focused = e.target.id;
      } else if (this.focused !== e.target.id) {
        this.reset();
      }
      e.stopPropagation();
    },
    /**
     * Colorize the countries by the number of casualties in that country from terrorism
     */
    colorize({geometries}) {
      const colorScale = d3.scalePow()
        .exponent(this.exponent)
        .domain([0, this.maxCasualties])
        .range([0, 1]);

      const transition = d3.transition()
        .duration(1050)
        .ease(d3.easeLinear);

      const countries = this.countries;
      geometries
        .transition(transition)
        .attr('fill', function (e) {
          const count = countries[e.id] ? countries[e.id].totalCasualties : 0;
          const val = colorScale(count);
          return d3.interpolateReds(val);
        });
    },
    /**
     * Zoom in on a country's bounding box;
     * set opacity to 50%;
     * mute others by setting opacity to 10;
     * @param e
     */
    zoom(e) {
      const features = worldCountries.features.filter((f) => f.id === e.target.id);
      if (features.length < 1) {
        return;
      }
      const feature = features[0];
      const transition = d3.transition()
        .duration(1050)
        .ease(d3.easeLinear);
      const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on('zoom', this.onZoom);
      const [[x0, y0], [x1, y1]] = this.$refs.gtdMap.path.bounds(feature);
      const canvas = d3.select('#gtd-canvas');
      const zoomFactor = Math.max((x1 - x0) / this.width, (y1 - y0) / this.height);
      const scaleFactor = Math.min(8, 0.9 / zoomFactor);
      const xPrime = (x0 + x1) / -2;
      const yPrime = (y0 + y1) / -2;

      canvas.transition(transition)
        .call(zoom.transform,
          d3.zoomIdentity.translate(this.width / 2, this.height / 2)
            .scale(scaleFactor)
            .translate(xPrime, yPrime))
        .call((t, id) => {
          d3.selectAll('.path.geometry')
            .transition(t)
            .style('opacity', (ele) => (ele.id === id ? '40%' : '10%'));
        }, feature.id);

      this.center = {x: ((x1 - x0) / 2) * x1, y: y1 + ((y1 - y0) / 2)}
    },
    /**
     * Reset zoom and opacity changes
     */
    unzoom() {
      const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on('zoom', this.onZoom);
      const transition = d3.transition()
        .duration(1050)
        .ease(d3.easeLinear);
      const canvas = d3.select('#gtd-canvas');

      canvas.transition(transition)
        .call(zoom.transform, d3.zoomIdentity)
        .call((t) => {
          d3.selectAll('.path.geometry')
            .transition(t)
            .style('opacity', '100%');
        });
    },
    /**
     * The actual zooming mechanism
     * @param e
     */
    onZoom(e) {
      this.k = e.transform.k
      const geometries = d3.selectAll('.path.geometry');
      geometries.attr('transform', e.transform);
      geometries.attr('stroke-width', 1 / this.k);

      d3.select('#gtd-pinwheels')
        .attr('transform', e.transform)
    },
    /**
     * Reset the map and incidents when a user "unfocuses" a country
     */
    reset() {
      this.features = worldCountries.features;
      this.unzoom();
      this.focused = false;
      this.incidents = [];
    },
  },
};
</script>
<style>
.choropleth.canvas {
  background-color: #2c3e50;
  overflow: hidden;
}

.linear-gradient-legend text {
  font-weight: bold;
}
</style>
