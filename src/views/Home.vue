<template>
  <div>
    <button
      v-if="countries.length > 0"
      @click="resetCountries"
    >Back</button>
    <Choropleth :id="`gtd-map-${count}`"
                :countries="countries"
                @created="handleCreated"
    ></Choropleth>
  </div>
</template>

<script>
// @ is an alias to /src
import Choropleth from '@/components/Choropleth';
import {LocalGTDClient as gtd} from '@/api/GTDClient';
import {worldCountries, countryList} from '@/api/GeoJsonProvider';
import * as d3 from 'd3';

export default {
  name: 'Home',
  components: {
    Choropleth,
  },
  data() {
    return {
      countries: [],
      count: 0,
    }
  },
  methods: {
    async handleCreated(canvas) {
      await this.drawIncidents(canvas);
      this.filterCountryOnClick(canvas);
    },
    async drawIncidents(canvas) {
      const incidents = await gtd.getIncidents();
      const countByCountry = incidents.reduce((countries, incident) => {
        if (Object.keys(countryList).includes(incident.country_txt)) {
          const ci = countryList[incident.country_txt];
          const i = worldCountries.features[ci].id
          if (countries[i]) {
            countries[i] += 1;
          } else {
            countries[i] = 1;
          }
        }
        return countries;
      }, {});

      const domain = Object.values(countByCountry);
      const range = [
        'nkilled-low',
        'nkilled-mid',
        'nkilled-high',
        'nkilled-xhigh',
      ]
      const scale = d3.scaleQuantile()
        .domain(domain)
        .range(range);

      Object.keys(countByCountry).forEach(id => {
        const country = canvas.select(`#${id}`);
        range.forEach(nclass => country.classed(nclass, false));
        const nclass = scale(countByCountry[id]);
        country.classed('gtd-country', true);
        country.classed(nclass, true);
      });

      return canvas;
    },
    filterCountryOnClick(canvas) {
      function onClick(event) {
        const index = countryList[event.target.id];
        this.countries = [index];
        this.count += 1
      }
      canvas.selectAll('.gtd-country')
      .on('click', onClick.bind(this));
    },
    resetCountries() {
      this.countries = [];
      this.count += 1;
    },
  },
};
</script>
<style>
.nkilled-low {
  fill: #FFA987 !important;
}
.nkilled-mid {
  fill: #B47A66 !important;
}
.nkilled-high {
  fill: #694C45 !important;
}
.nkilled-xhigh {
  fill: #1E1E24 !important;
}

</style>
