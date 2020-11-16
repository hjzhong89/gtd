<template>
  <div class="querycard"
       :width="width"
       :height="height"
  >
    <form class="mui-form">
      <legend>Explore Incidents</legend>

      <div class="mui-textfield query-name">
        <label :for="`${name}-query-title`">Name</label>
        <input type="text" placeholder="Query Name" v-model="name" maxlength="50">
      </div>
      <div class="mui-select query-country">
        <label>Country</label>
        <select v-model="country">
          <option v-for="(country, i) in countryNames" :key="i">{{ country }}</option>
        </select>
      </div>
      <div class="mui-select query-year">
        <label>Year</label>
        <select v-model="year">
          <option v-for="(year, i) in years" :key="i">{{ year }}</option>
        </select>
      </div>
      <div class="mui-textfield minimum-casualties">
        <label>Minimum Casualties</label>
        <input type="text" v-model="minCasualties" >
      </div>
      <button @click="submit" class="mui-btn mui-btn--raised">Submit</button>
    </form>
  </div>
</template>
<script>
import worldCountries from '@/assets/world_countries.json';

export default {
  name: 'GTDQueryCard',
  props: {
    width: {
      type: String,
      default: () => '100%'
    },
    height: {
      type: String,
      default: () => '300px'
    },
  },
  computed: {
    countryNames() {
      return ['All', ...worldCountries.features.reduce((acc, c) => {
        acc.push(c.properties.name)
        return acc;
      }, []).sort()]
    },
    years() {
      const GTD_START_YEAR = 1970
      const GTD_SPAN_YEARS = 27
      return ['All', ...Array(GTD_SPAN_YEARS).fill().map((_, i) => GTD_START_YEAR + i)];
    },
  },
  data() {
    return {
      name: 'Global Fatal Incidents - 1970',
      country: 'All',
      year: 1970,
      minCasualties: 1,
    }
  },
  methods: {
    submit(e) {
      e.preventDefault();
      this.$emit('querySubmit', e, this);
    }
  },
}
</script>
<style>
.mui-form {
  text-align: left;
  align-items: start;
}
</style>
