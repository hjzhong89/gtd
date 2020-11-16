<template>
  <div class="resultcard"
       :width="width"
       :height="height">
    <div class="header" :style="`background: ${color}`">{{name}}</div>
    <form class="mui-form">
      <div class="mui-textfield total-incidents">
        <label>Total Incidents</label>
        <input type="text" :value="formatNumber(totalIncidents)"
               readonly>
      </div>

      <div class="mui-textfield total-casualties">
        <label>Total Casualties</label>
        <input type="text" :value="formatNumber(totalCasualties)" readonly>
      </div>

      <div class="mui-textfield total-casualties">
        <label>Average Casualties per Incident</label>
        <input type="text" :value="casualtyAvg" readonly>
      </div>

    </form>
  </div>
</template>
<script>
export default {
  name: 'ResultCard',
  props: {
    width: {
      type: String,
      default: () => '100%'
    },
    height: {
      type: String,
      default: () => '300px'
    },
    name: {
      type: String,
      default: () => 'Results',
    },
    countries: {
      type: Object,
      default: () => {
      },
    },
    color: {
      type: String,
      default: () => '',
    },
  },
  computed: {
    countryValues() {
      return Object.values(this.countries);
    },
    totalIncidents() {
      return this.countryValues.reduce((total, c) => {
        return total + c.totalIncidents
      }, 0)
    },
    totalCasualties() {
      return this.countryValues.reduce((total, c) => {
        return total + c.totalCasualties
      }, 0);
    },
    casualtyAvg() {
      if (this.totalIncidents) {
        return (this.totalCasualties / this.totalIncidents).toFixed(2)
      } else {
        return 0.00
      }
    }
  },
  methods: {
    formatNumber(num) {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }
  }
}
</script>
<style>
.resultcard .header {
  align-items: start;
  text-align: left;
  font-size: 1.5em;
}
</style>
