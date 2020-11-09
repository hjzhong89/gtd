<template>
  <div>
    <ChoroplethMap :id="`gtd-choropleth`"
                   features="topology"
                   @created="handleCreated"
                   @clicked="handleClicked"
    >
      <GTDMapper ref="gtdmapper"></GTDMapper>
    </ChoroplethMap>
    <button @click="resetCountries">Reset</button>
  </div>
</template>

<script>
// @ is an alias to /src
import {worldCountries, countryList} from '@/api/GeoJsonProvider';
import * as d3 from 'd3';
import ChoroplethMap from "@/components/ChoroplethMap";
import GTDMapper from "@/components/GTDMapper";

export default {
  name: 'Home',
  components: {
    GTDMapper,
    ChoroplethMap,
  },
  data() {
    return {
      topology: worldCountries.features,
      count: 0,
      initialized: false,
    }
  },
  methods: {
    async handleCreated({canvas}) {
      this.$refs.gtdmapper.colorize(canvas);
    },
    handleClicked(e) {
      const id = e.target.id;
      const country = d3.select(`#${id}`)
        .attr('name')
      const index = countryList[country].index
      this.topology = [worldCountries.features[index]]
    },
    resetCountries() {
      this.topology = worldCountries.features;
    },
  },
};
</script>
<style>

</style>
