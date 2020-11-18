<template>
  <div class="incidentcard mdc-card"
       :style="`height: ${height}px; width: ${width}px; minWidth: 400px;`"
  >
    <p class="incidentcard header">
      <span class="incidentcard title">{{ incident.city }}</span><br>
      <span class="incidentcard subtitle">{{ incidentDate }}</span>
    </p>
    <hr class="incidentcard divider">
    <p>
      Hello!
    </p>
  </div>
</template>
<script>
export default {
  name: 'IncidentCard',
  props: {
    x: {
      type: Number,
      default: () => 15,
    },
    y: {
      type: Number,
      default: () => 15,
    },
    height: {
      type: Number,
      default: () => 250,
    },
    width: {
      type: Number,
      default: () => 400,
    },
    incident: {
      type: Object,
      default: () => ({
        city: 'New York City',
        country_txt: 'United States of America',
        iyear: 2001,
        imonth: 9,
        iday: 11,
      }),
    },
  },
  computed: {
    incidentDate() {
      const year = this.incident.iyear.toString();
      const month = this.incident.imonth.toString().padStart(2, '0');
      const date = this.incident.iday.toString().padStart(2, '0');
      return `${year}–${month}-${date}`
    },
  },
};
</script>
<style lang="scss">
.incidentcard {
  text-align: left;
  padding: 0 5px;
}

.incidentcard.title {
  font-weight: bolder;
  font-size: 30px;
}

.incidentcard.subtitle {
  font-size: 15px;
  font-weight: bold;
}

.incidentcard.divider {
  border-top: 0.25px solid #ddd;
  margin: 1px 0;
}
</style>
