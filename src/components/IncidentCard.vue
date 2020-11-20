<template>
  <div class="incidentcard mdc-card"
       :style="`height: ${height}; width: ${width}; minWidth: 400px;`"
  >
    <div class="incidentcard header">
      <div class="incidentcard header section" style="align-items: flex-start">
        <span class="incidentcard title">{{ incident.city }}, {{ incident.country_txt }}</span>
        <span class="incidentcard subtitle">{{ incidentDate }}</span>
      </div>
      <div class="incidentcard header section" style="align-items: flex-end; flex-grow: 4">
        <span style="font-size: .75em">Casualties</span>
        <span style="font-size: 1.25em; margin-top: 2px;">
          {{ incident.nkill ? formatNumber(incident.nkill) : 'None' }}
        </span>
      </div>
    </div>

    <hr class="incidentcard divider">

    <div class="incidentcard section body">
      <div class="incidentcard data">
        <span class="label">Perpetrator</span>
        <span class="value">{{ incident.gname ? incident.gname : 'Unknown' }}</span>
      </div>

      <div class="incidentcard data">
        <span class="label">Target</span>
        <span class="value">{{ incident.target1 ? incident.target1 : 'Unknown' }}</span>
      </div>
    </div>

    <hr class="incidentcard divider">

    <div class="incidentcard section features">
      <div class="incidentcard section title">ElasticNet Features & Label</div>
      <div class="incidentcard data-group">
        <div class="incidentcard data">
          <span class="label">Wounded</span>
          <span class="value">{{ incident.nwound ? incident.nwound : 'None' }}</span>
        </div>
        <div class="incidentcard data">
          <span class="label">Suicide Attack</span>
          <span class="value">
            {{ incident.suicide === '1' ? 'Yes' : 'No' }}
          </span>
        </div>
        <div class="incidentcard data">
          <span class="label">Successful Attack</span>
          <span class="value">
            {{ incident.success === '1' ? 'Yes' : 'No' }}
          </span>
        </div>
      </div>

      <div class="incidentcard data-group">
        <div class="incidentcard data">
          <span class="label">Weapon/Attack Method</span>
          <span class="value">
            {{ incident.weaptype1_txt ? incident.weaptype1_txt : 'Unknown' }}
          </span>
        </div>
        <div class="incidentcard data">
          <span class="label">Sub-Type</span>
          <span class="value">
            {{ incident.weapsubtype1_txt ? incident.weapsubtype1_txt : 'Unknown' }}
          </span>
        </div>
        <div class="incidentcard data">
          <span class="label"></span>
        </div>
      </div>

      <div class="incidentcard data-group">
        <div class="incidentcard data">
          <span class="label">Doubt Terrorism</span>
          <span class="value">
            {{
              incident.doubtterr === '-9' ? 'Unknown'
                                          : incident.doubtterr === '1' ? 'Yes'
                                                                       : 'No'
            }}
          </span>
        </div>
        <div class="incidentcard data">
          <span class="label">Has Hostages</span>
          <span class="value">
            {{
              incident.ishostkid === '-9' ? 'Unknown'
                                          : incident.ishostkid === '1' ? 'Yes' : 'No'
            }}
          </span>
        </div>

        <div class="incidentcard data">
          <span class="label">Predicted Casualties</span>
          <span class="value">{{ incident.label ? incident.label : 'N/A' }}</span>
        </div>
      </div>
    </div>
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
      type: String,
      default: () => 'auto',
    },
    width: {
      type: String,
      default: () => '400px',
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
  methods: {
    formatNumber(f) {
      return f.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }, // Formats a number for commas
  },
};
</script>
<style lang="scss">
.incidentcard {
  text-align: left;
  padding: 0 5px;
}

.incidentcard.header {
  display: inline-flex;
  flex-direction: row;
  padding-top: 2px;
  width: 100%;
}

.incidentcard.header.section {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.incidentcard.title {
  font-weight: bolder;
  font-size: 1.5em;
}

.incidentcard.subtitle {
  font-size: 1em;
  font-weight: bold;
}

.incidentcard.divider {
  border-top: 0.25px solid #ddd;
  margin: 5px 0;
}

.incidentcard.section.title {
  text-align: center;
  font-size: 1.2em;
  font-weight: bolder;
  margin: 5px 0;
}

.incidentcard.data-group {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  margin: 2px 0;
}

.incidentcard.body, .incidentcard.data {
  display: inline-flex;
  flex-direction: column;
  align-items: stretch;
  margin: 2px 0;
}

.incidentcard.data {
  margin-right: 4px;
}

.incidentcard .label {
  font-size: 0.8em;
  font-weight: bolder;
  margin: 2.5px 0;
  color: #bbb;
}
</style>
