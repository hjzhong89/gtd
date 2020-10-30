<template>
    <Choropleth id="gtd-map"></Choropleth>
</template>

<script>
// @ is an alias to /src
import Graph from "@/components/Graph";
import Choropleth from "@/components/Choropleth";

export default {
  name: 'Home',
  components: {
    Choropleth,
    Graph,
  },
};
</script>
