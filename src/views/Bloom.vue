<template>
  <div style="width: 100%; padding: 15px">
    <h1>Global Terrorism Database: Neo4J Bloom</h1>
    <div id="content">
      <div class="media-container"
           style="display: flex; flex-direction: row; justify-content: space-between; width: 95%; position: relative; align-items: center;">
        <div class="img-block" style="display: flex; flex-direction: column; align-items: flex-start; width: 30%">
          <img src="@/assets/graph.svg"
               style="width: 95%" alt="Global Terrorism Database Graph Schema"
          >
          <span class="caption">
            <em>Global Terrorism Database Graph Schema</em>
          </span>
          <div class="spacer"></div>
          <img src="@/assets/graph1.svg"
               style="width: 95%"
          >
          <span class="caption">
            <em>Caption</em>
          </span>
        </div>
        <div style="width: 65%; height: 300px; flex-grow: 4;">
          <iframe width="560" height="315" src="https://www.youtube.com/embed/S9IyOoo6jeg" frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen></iframe>
        </div>
        <div class="shadowbox" style="position: absolute; height: 95%; width: 95%;" v-if="enlarge">

        </div>
      </div>
      <div class="spacer"></div>
      <div class="spacer"></div>
      <p>
        <a href="https://neo4j.com/bloom/">Neo4j Bloom</a> is best-in-class application for
        visualizing and exploring graph databases. Visit our
        <a href="https://bloom.neo4j.io/index.html?connectURL=bolt%2Brouting%3A//0467f778.databases.neo4j.io"
           target="_blank"
        >
          GTD Graph Database Bloom
        </a> to gain new insights into the GTD.
      </p>
    </div>
    <div class="spacer"></div>
  </div>
</template>
<script>
export default {
  name: 'BloomVue',
  props: {},
  created() {
    console.log('Done')
  },
  data() {
    return {
      enlarged: false,
      imgSrc: ''
    }
  },
  methods: {
    enlarge(e) {
      this.imgSrc = e;
      console.log('Enlarge', e)
    }
  }
}
</script>
<style lang="scss">
#content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%
}

.caption {
  align-self: flex-start;
  font-size: .9em;
}
</style>
