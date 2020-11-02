<template>
  <g class="gtd-key"></g>
</template>

<script>
import {LocalGTDClient as gtd} from "@/api/GTDClient";

export const gtdCountryList = require('../assets/gtd_country_list');
export const GTDProperties = {
  countries: {
    type: Array,
    default: () => []
  },
};

export default {
  name: 'GTDMapper',
  props: GTDProperties,
  computed: {
    countryCasualties: function () {
      return this.incidents.reduce((countries, incident) => {
        const id = gtdCountryList[incident.country_txt].id;
        if (countries[id]) {
          countries[id] += 1;
        } else {
          countries[id] = 1;
        }
        return countries;
      }, {});
    },
    domain: function () {
      return Object.values(this.countryCasualties)
    },
    colorScale: function () {
      // return d3.scaleQuantile().domain(this.domain).range(quantiles);
      return d3.scaleThreshold()
        .domain(this.domain)
        .range(d3.schemeOrRd[9])
    }
  },
  /**
   * Load all incidents and initialize domain, quantiles, and scale for incidents by country.
   * @returns {Promise<void>}
   */
  async created() {
    this.incidents.push(...await gtd.getIncidents());
    this.colorize();
  },
  methods: {
    colorize(canvas) {
      if (canvas) {
        this.canvas = canvas;
      }
      this.canvas.selectAll('.path.geometry')
        .attr('fill', ele => {
          const count = this.countryCasualties[ele.id]
            ? this.countryCasualties[ele.id]
            : 0;
          return this.colorScale(count)
        });
    }
  },
  data() {
    return {
      canvas: {},
      incidents: [],
    }
  },
}
</script>
