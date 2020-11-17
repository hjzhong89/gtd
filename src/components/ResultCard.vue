<template>
  <CardControl class="margin-bottom-small">
    <div class="resultcard"
         :width="width"
         :height="height">
      <div class="mdc-data-table .results-table" :style="`width: ${width}`">
        <div class="mdc-data-table__table-container" :style="`width: ${width}`">
          <table class="mdc-data-table__table" aria-label="Incident Statistics" :style="`width: ${width}`">
            <thead>
            <tr class="mdc-data-table__header-row">
              <th class="mdc-data-table__header-cell header"
                  role="columnheader" scope="col"
                  :style="`background-color: ${color}; color: white;`"
              >{{ name }}
              </th>
              <th class="mdc-data-table__header-cell"
                  role="columnheader" scope="col"
                  :style="`background-color: ${color}; color: white;`"
              ></th>
            </tr>
            </thead>
            <tbody class="mdc-data-table__content">
            <tr class="mdc-data-table__row">
              <td class="mdc-data-table__cell mdc-data-table__cell">Total Incidents</td>
              <td class="mdc-data-table__cell mdc-data-table__cell--numeric">{{ formatNumber(totalIncidents) }}</td>
            </tr>
            <tr class="mdc-data-table__row">
              <td class="mdc-data-table__cell mdc-data-table__cell">Total Casualties</td>
              <td class="mdc-data-table__cell mdc-data-table__cell--numeric">{{ formatNumber(totalCasualties) }}</td>
            </tr>
            <tr class="mdc-data-table__row">
              <td class="mdc-data-table__cell mdc-data-table__cell">Avg Casualt</td>
              <td class="mdc-data-table__cell mdc-data-table__cell--numeric">{{ formatNumber(casualtyAvg) }}</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </CardControl>
</template>
<script>
import CardControl from "@/components/CardControl";

export default {
  name: 'ResultCard',
  components: { CardControl },
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
      if(this.totalIncidents) {
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
<style lang="scss">
@use "~@material/data-table/data-table";

@include data-table.core-styles;
@include data-table.theme-baseline;

.header {
  overflow: visible;
  text-overflow: unset;
}
</style>
