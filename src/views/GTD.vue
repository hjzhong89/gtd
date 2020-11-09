<template>
  <div>
    <svg :height="height + margin.top + margin.bottom"
         :width="width + margin.left + margin.right"
         class="gtd choropleth canvas"
         id="gtd-canvas"
         @click="focus"
    >
      <ChoroplethMap id="gtd-map"
                     :features="features"
                     :width="width"
                     :height="height"
                     :x="margin.left"
                     :y="margin.top"
                     @created="handleCreated"
                     @clicked="handleClicked"
                     ref="gtdMap"
      >
      </ChoroplethMap>
      <LinearGradientLegend id="gtd-key"
                            :exponent="exponent"
                            :min="0"
                            :max="max"
                            :width="canvasWidth"
      ></LinearGradientLegend>
      <g id="gtd-pinwheels">
        <Pinwheel v-for="pinwheel in pinwheels"
                  :latitude="pinwheel.latitude"
                  :longitude="pinwheel.longitude"
                  :height="height"
                  :width="width"
                  :margin="margin"
                  :label="pinwheel.label"
                  :features="features"
        ></Pinwheel>
      </g>
    </svg>
  </div>
</template>

<script>
import { GtdAPIClient as gtd } from "@/api/GTDClient";
import { worldCountries, countryList } from "@/api/GeoJsonProvider";
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
  components: { Pinwheel, ChoroplethMap, LinearGradientLegend },
  props: GTDProps,
  computed: {
    values: function() {
      return Object.values(this.casualties)
    },
    min: function() {
      return d3.min(Object.values(this.casualties));
    },
    max: function() {
      return d3.max(Object.values(this.casualties));
    },
    canvasWidth: function() {
      return this.width + this.margin.left + this.margin.right
    },
    canvasHeight: function() {
      return this.height + this.margin.top + this.margin.bottom
    },
    pinwheels: function() {
      const pinwheels = [
        {
          latitude: 0,
          longitude: 0,
          label: 'center'
        }
      ];
      pinwheels.push(...this.incidents.slice(0, 10).map(incident => {
        return {
          latitude: parseFloat(incident.latitude),
          longitude: parseFloat(incident.longitude),
          label: `${incident.city}, ${incident.country_txt}`
        }
      }));
      return pinwheels;
    },
    projection: function() {
      return d3.geoMercator()
               .scale(this.canvasWidth / tau)
               .translate([ this.canvasWidth / 2, this.canvasHeight / 2 ])
    },
  },
  async created() {
    const [ casualties, incidents ] = await Promise.all([
                                                          gtd.getCasualties(),
                                                          gtd.getIncidents(),
                                                        ]);
    this.casualties = casualties;
    this.incidents = incidents;
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
    handleCreated({ geometries }) {
      this.colorize({ geometries })
    },
    handleClicked(e) {
      this.focus(e);
    },
    colorize({ geometries }) {
      const colorScale = d3.scalePow()
                           .exponent(this.exponent)
                           .domain([ 0, this.max ])
                           .range([ 0, 1 ])

      geometries.attr('fill', e => {
        const count = this.casualties[ e.id ] ? this.casualties[ e.id ] : 0;
        const val = colorScale(count);
        return d3.interpolateReds(val);
      })
    },
    focus(e) {
      e.stopPropagation();
      const { target } = e;
      const id = target.id;
      const country = d3.select(`#${id}`).attr('name');

      if(!this.focused && countryList[ country ]) {
        const index = countryList[ country ].index;
        this.features = [ worldCountries.features[ index ] ]
        this.focused = true;
      } else {
        this.resetMap();
      }
    },
    resetMap() {
      this.features = worldCountries.features;
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
</style>
