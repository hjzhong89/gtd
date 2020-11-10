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
      <!--      <g id="gtd-pinwheels" v-if="!focused">-->
      <!--        <Pinwheel v-for="pinwheel in pinwheels"-->
      <!--                  :latitude="pinwheel.latitude"-->
      <!--                  :longitude="pinwheel.longitude"-->
      <!--                  :canvas-height="height"-->
      <!--                  :canvas-width="width"-->
      <!--                  :margin="margin"-->
      <!--                  :label="pinwheel.label"-->
      <!--                  :r="pinwheel.r"-->
      <!--                  :points="pinwheel.points"-->
      <!--        ></Pinwheel>-->
      <!--      </g>-->
      <LinearGradientLegend v-if="!focused"
                            id="gtd-key"
                            :exponent="exponent"
                            :min="0"
                            :max="max"
                            :width="canvasWidth"
      ></LinearGradientLegend>
    </svg>
  </div>
</template>

<script>
import {GtdAPIClient as gtd} from "@/api/GTDClient";
import {worldCountries, countryList} from "@/api/GeoJsonProvider";
import LinearGradientLegend from "@/components/LinearGradientLegend";
import ChoroplethMap from "@/components/ChoroplethMap";
import Pinwheel from "@/components/Pinwheel";

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
    default: () => .5,
  }
};

export default {
  name: 'GTD',
  components: {Pinwheel, ChoroplethMap, LinearGradientLegend},
  props: GTDProps,
  computed: {
    values: function () {
      return Object.values(this.casualties)
    },
    min: function () {
      return d3.min(Object.values(this.casualties));
    },
    max: function () {
      return d3.max(Object.values(this.casualties));
    },
    canvasWidth: function () {
      return this.width + this.margin.left + this.margin.right
    },
    canvasHeight: function () {
      return this.height + this.margin.top + this.margin.bottom
    },
    // pinwheels: function () {
    //   const radius = 200
    //   const countries = this.incidents
    //     .reduce((countries, incident) => {
    //       if (incident.country === 133) {
    //         console.log(incident.country)
    //       }
    //       if (countries[incident.city]) {
    //         countries[incident.city].points.push(incident);
    //       } else {
    //         countries[incident.city] = {
    //           latitude: incident.latitude,
    //           longitude: incident.longitude,
    //           label: incident.city,
    //           r: radius,
    //           points: [incident]
    //         }
    //       }
    //       return countries;
    //     }, {});
    //   return Object.values(countries);
    // },
  },
  async created() {
    // const [casualties, incidents] = await Promise.all([
    //   gtd.getCasualties(),
    //   gtd.getIncidents(),
    // ]);
    this.casualties = await gtd.getCasualties();
    // this.incidents = incidents;
    this.$refs.gtdMap.draw();
  },
  data() {
    return {
      casualties: {},
      incidents: [],
      features: worldCountries.features,
      focused: false,
    }
  },
  methods: {
    handleCreated({geometries}) {
      this.colorize({geometries})
    },
    handleClicked(e) {
      this.focus(e);
    },
    colorize({geometries}) {
      const colorScale = d3.scalePow()
        .exponent(this.exponent)
        .domain([0, this.max])
        .range([0, 1])

      const transition = d3.transition()
        .duration(1050)
        .ease(d3.easeLinear);

      geometries
        .transition(transition)
        .attr('fill', e => {
          const count = this.casualties[e.id] ? this.casualties[e.id] : 0;
          const val = colorScale(count);

          return d3.interpolateReds(val);
        })
    },
    focus(e) {
      console.log('focus', this.focused)
      if (!this.focused) {
        this.zoom(e);
        this.focused = e.target.id;
      } else if (this.focused !== e.target.id) {
        this.reset();
      }
      e.stopPropagation();
    },

    /**
     * Zoom in on a country's bounding box;
     * set opacity to 50%;
     * mute others by setting opacity to 0;
     * @param e
     */
    zoom(e) {
      const features = worldCountries.features.filter(f => f.id === e.target.id)
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
      const [[x0, y0], [x1, y1]] = this.$refs.gtdMap.path.bounds(feature)
      const canvas = d3.select('#gtd-canvas');
      const zoomFactor = Math.max((x1 - x0) / this.width, (y1 - y0) / this.height)
      const scaleFactor = Math.min(8, 0.9 / zoomFactor);
      const xPrime = -(x0 + x1) / 2;
      const yPrime = -(y0 + y1) / 2;

      canvas.transition(transition)
        .call(zoom.transform,
          d3.zoomIdentity.translate(this.width / 2, this.height / 2)
            .scale(scaleFactor)
            .translate(xPrime, yPrime))
        .call((t, id) => {
          d3.selectAll(`.path.geometry`)
            .transition(t)
            .style('opacity', e => {
              return e.id === id ? '40%' : '0%';
            })
        }, feature.id)
    },
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
        .call(t => {
          d3.selectAll('.path.geometry')
            .transition(t)
            .style('opacity', '100%')
        })
    },
    onZoom(e) {
      const geometries = d3.selectAll('.path.geometry');
      geometries.attr('transform', e.transform)
      geometries.attr('stroke-width', 1 / e.transform.k)
    },
    reset() {
      this.features = worldCountries.features;
      this.unzoom();
      this.focused = false;
    },
  },
}
</script>
<style>
.choropleth.canvas {
  background-color: #fff;
  overflow: hidden;
}

.linear-gradient-legend text {
  font-weight: bold;
}
</style>
