<template>
  <div>
    <h1>{{ totalCasualties.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") }} Casualties from Terrorism</h1>
    <h4>({{ minYear }} to {{ maxYear }})</h4>
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
      <g id="gtd-rings" v-if="focused">
        <PinRing v-for="(ring,  i) in rings"
                 v-if="ring.nodes.length > 0"
                 :key="i"
                 :id="ring.name"
                 :center="ring.center"
                 :r="ring.r / k"
                 :label="ring.label"
                 :nodes="ring.nodes"
                 :canvas-width="width"
                 :canvas-height="height"
                 :margin="margin"
                 :color="ring.color"
        ></PinRing>
      </g>
      <StackedBoxesLegend v-if="!focused"
                          :x="margin.left"
                          :y="(canvasHeight / 2) - margin.bottom"
                          :height="canvasHeight / 2"
                          :width="150"
                          :exponent="exponent"
                          :min="0"
                          :max="mostCasualties"
                          title="Casualties"
      ></StackedBoxesLegend>
    </svg>
  </div>
</template>

<script>
import {GtdAPIClient as gtd} from '@/api/GTDClient';
import LinearGradientLegend from '@/components/LinearGradientLegend.vue';
import ChoroplethMap from '@/components/ChoroplethMap.vue';
import worldCountries from '@/assets/world_countries.json';
import PinRing from "@/components/PinRing";
import StackedBoxesLegend from "@/components/StackedBoxesLegend";

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
  components: {StackedBoxesLegend, PinRing, ChoroplethMap, LinearGradientLegend},
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
      return 2008
    },
    rings() {
      const centerX = this.viewBox[0][0] + ((this.viewBox[1][0] - this.viewBox[0][0]) / 2)
      const centerY = this.viewBox[0][1] + ((this.viewBox[1][1] - this.viewBox[0][1]) / 2)
      const x = centerX - 300 / this.k
      const y = centerY + 300 / this.k
      const rings = [
        {
          center: {x, y},
          r: 50,
          label: '0 - 5 casualties',
          nodes: [],
          name: 'ring-0'
        },
        {
          center: {x, y},
          r: 150,
          label: '6 - 25 casualties',
          nodes: [],
          name: 'ring-1'
        },
        {
          center: {x, y},
          r: 250,
          label: '26+ casualties',
          nodes: [],
          name: 'ring-2'
        },
      ]

      this.incidents.forEach(i => {
        if (i.latitude && i.longitude) {
          const r = i.nkill < 6 ? 0
            : i.nkill < 26 ? 1
              : 2
          rings[r].nodes.push({
            latitude: i.latitude,
            longitude: i.longitude,
            color: d3.schemeTableau10[Math.floor(Math.random() * 10)]
          });
        }
      })
      return rings;
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
      incidents: [],
      k: 1,
      viewBox: [[0, 0], [0, 0]]
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
      const id = e.target.id;

      if (!this.focused) {
        gtd.getIncidents({
          country: this.countries[id].name,
          minCasualties: 1,
        }).then((d) => {
          this.incidents = d;
        });
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

      d3.selectAll('#gtd-rings').attr('transform', e.transform)
      d3.selectAll('.pinring.label').style('font-size', `${2 / this.k}em`)
      d3.selectAll('.ring').attr('stroke-width', 5 / this.k)
      d3.selectAll('.pin').attr('r', 10 / this.k)
      d3.selectAll('.thread').attr('stroke-width', 2.5 / this.k)

    },
    /**
     * Reset the map and incidents when a user "unfocuses" a country
     */
    reset() {
      this.features = worldCountries.features;
      this.unzoom();
      this.focused = false;
      this.incidents = [];
      this.viewBox = [[0, 0], [this.canvasWidth, this.canvasHeight]]
    },
  },
};
</script>
<style>
.choropleth.canvas {
  background-color: #041b58;
  overflow: hidden;
  border-radius: 15px;
}
.pin {
  fill: #42b983;
}
text {
  fill: white;
}
#ring-0 .thread, #ring-0 .ring {
  stroke: #E6A4EB;
}
#ring-0 .pin.anchor {
  stroke: #E6A4EB;
  fill: #E6A4EB;
}
#ring-1 .thread, #ring-1 .ring {
  stroke: #CF3BDD;
}
#ring-1 .pin.anchor {
  stroke: #CF3BDD;
  fill: #CF3BDD;
}
#ring-2 .thread, #ring-2 .ring {
  stroke: #8A1894;
}
#ring-2 .pin.anchor {
  stroke: #8A1894;
  fill: #8A1894;
}
</style>
