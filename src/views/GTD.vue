<template>
  <div>
    <h1>{{ totalCasualties.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") }} Casualties from Terrorism</h1>
    <h4>({{ minYear }} to {{ maxYear }})</h4>
    <div id="gtd-content">
      <div id="side-panel" class="gtd-item">
        <GTDQueryCard v-if="showQuery" @querySubmit="querySubmit"></GTDQueryCard>
        <ResultCard v-for="(result, i) in results"
                    :key="i"
                    v-bind="result"></ResultCard>
      </div>
      <div id="map-panel" class="gtd-item">
        <svg
          :height="canvasHeight"
          :width="canvasWidth"
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
          <PointGroup v-for="(group, i) in pointGroups"
                      v-bind="group"
                      :key="i"
                      :canvas-width="width"
                      :canvas-height="height"
                      :margin="margin"
          ></PointGroup>
          <StackedBoxesLegend v-if="!focused"
                              :x="margin.left"
                              :y="(canvasHeight / 2) - margin.bottom"
                              :height="canvasHeight / 2"
                              :width="150"
                              :exponent="exponent"
                              :min="0"
                              :max="mostCasualties"
                              title="Total Casualties"
          ></StackedBoxesLegend>
        </svg>
      </div>
    </div>
    <div class="spacer"></div>
  </div>
</template>

<script>
import {GtdAPIClient as gtd} from '@/api/GTDClient';
import ChoroplethMap from '@/components/ChoroplethMap.vue';
import worldCountries from '@/assets/world_countries.json';
import StackedBoxesLegend from "@/components/StackedBoxesLegend";
import GTDQueryCard from "@/components/GTDQueryCard";
import ResultCard from "@/components/ResultCard";
import PointGroup from "@/components/PointGroup";

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
    default: () => 0.5,
  },
};

export default {
  name: 'GTD',
  components: {PointGroup, ResultCard, GTDQueryCard, StackedBoxesLegend, ChoroplethMap},
  props: GTDProps,
  computed: {
    canvasWidth() {
      return this.width + this.margin.left + this.margin.right;
    },
    canvasHeight() {
      return this.height + this.margin.top + this.margin.bottom;
    },
    mostFatal() {
      return d3.max(Object.values(this.countries).map(c => c.mostFatal))
    },
    mostCasualties() {
      return d3.max(Object.values(this.countries).map(c => c.totalCasualties));
    },
    totalCasualties() {
      return Object.values(this.countries).reduce((total, c) => total + c.totalCasualties, 0)
    },
    minYear() {
      return 1970
    },
    maxYear() {
      return 1997
    },
  },
  async created() {
    this.center = {
      x: this.width / 2,
      y: this.height / 2,
    }
    this.countries = await gtd.getCountries();
    this.$refs.gtdMap.draw();
    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on('zoom', this.onZoom);
    d3.select('svg').call(zoom)
  },
  data() {
    return {
      countries: {},
      features: worldCountries.features,
      focused: false,
      k: 1,
      showQuery: true,
      results: [],
      pointGroups: [],
    };
  },
  methods: {
    /**
     * Colorize the choropleth map after rendering.
     */
    handleCreated({geometries}) {
      this.viewBox = [[0, 0], [this.canvasWidth, this.canvasHeight]]
      this.colorize({geometries});
    },
    /**
     * Handle onClick event when user clicks on a country
     */
    async handleClicked(e) {
      if (!this.focused) {
        this.zoom(e);
        this.focused = e.target.id;
      } else if (this.focused !== e.target.id) {
        this.reset();
      }
      e.stopPropagation();
    },
    /**
     * Colorize the countries by the number of casualties in that country from terrorism
     */
    colorize({geometries}) {
      const colorScale = d3.scalePow()
        .exponent(this.exponent)
        .domain([0, this.mostCasualties])
        .range([0, 1]);

      const transition = d3.transition()
        .duration(1050)
        .ease(d3.easeLinear);

      const countries = this.countries;
      geometries
        .transition(transition)
        .attr('fill', function (e) {
          const count = countries[e.id] ? countries[e.id].totalCasualties : 0;
          const val = colorScale(count);
          return d3.interpolateReds(val);
        });
    },
    /**
     * Zoom in on a country's bounding box;
     * set opacity to 50%;
     * mute others by setting opacity to 10;
     * @param e
     */
    zoom(e) {
      const features = worldCountries.features.filter((f) => f.id === e.target.id);
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
      this.viewBox = this.$refs.gtdMap.path.bounds(feature);
      const [[x0, y0], [x1, y1]] = this.viewBox;
      const canvas = d3.select('#gtd-canvas');
      const zoomFactor = Math.max((x1 - x0) / this.width, (y1 - y0) / this.height);
      const scaleFactor = Math.min(8, 0.9 / zoomFactor);
      const xPrime = (x0 + x1) / -2;
      const yPrime = (y0 + y1) / -2;

      canvas.transition(transition)
        .call(zoom.transform,
          d3.zoomIdentity.translate(this.width / 2, this.height / 2)
            .scale(scaleFactor)
            .translate(xPrime, yPrime))
        .call((t, id) => {
          d3.selectAll('.path.geometry')
            .transition(t)
            .style('opacity', (ele) => (ele.id === id ? '40%' : '10%'));
        }, feature.id);


    },
    /**
     * Reset zoom and opacity changes
     */
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
        .call((t) => {
          d3.selectAll('.path.geometry')
            .transition(t)
            .style('opacity', '100%');
        });
    },
    /**
     * The actual zooming mechanism
     * @param e
     */
    onZoom(e) {
      this.k = e.transform.k
      const geometries = d3.selectAll('.path.geometry');
      geometries.attr('transform', e.transform);
      geometries.attr('stroke-width', 1 / this.k);
      d3.selectAll('.point-group')
        .attr('transform', e.transform)
    },
    /**
     * Reset the map and incidents when a user "unfocuses" a country
     */
    reset() {
      this.features = worldCountries.features;
      this.unzoom();
      this.focused = false;
      this.viewBox = [[0, 0], [this.canvasWidth, this.canvasHeight]]
    },
    querySubmit(e, query) {
      const params = {
        country: query.country === 'All' ? undefined : query.country,
        year: query.year === 'All' ? undefined : query.year,
        minCasualties: query.minCasualties,
      }
      gtd.getCountries(params).then(data => {
        const i = this.results.length
        const result = {
          name: query.name,
          countries: data,
          color: d3.schemeTableau10[i]
        }
        this.results.push(result)
      });

      gtd.getIncidents(params).then(data => {
        const i = this.pointGroups.length
        const points = data.map(d => {
          return {
            latitude: d.latitude,
            longitude: d.longitude,
            r: 10,
            fill: d3.schemeTableau10[i],
            stroke: 'black',
            'stroke-width': '.5px',
          }
        });
        const group = {
          name: query.name,
          points: points,
        }
        this.pointGroups.push(group);
      });
    },
  },
};
</script>
<style>
#gtd-content {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.gtd-item {
  margin: 0 10px
}

#side-panel {
  width: 300px;
  height: 900px;
  display: flex;
  flex-direction: column;
}

#side-panel div {
  margin: 6px;
}

.choropleth.canvas {
  background-color: #a1b6ec;
  overflow: hidden;
  border-radius: 15px;
}

.spacer {
  width: 100%;
  height: 25px;
}

svg text {
  fill: black;
}

.resultcard .header {
  color: white;
  text-align: center;
  font-size: 1.25em;

}
</style>
