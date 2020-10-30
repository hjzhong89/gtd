<template>
  <svg>
    <Node v-for="node in nodes"
          v-bind:layout="node.layout"
          v-bind:type="node.type"
    ></Node>
  </svg>
</template>

<script>
import Node from "@/components/Node";
export default {
  name: "Graph",
  components: {Node},
  data: function() {
    return {
      nodes: [
        {
          type: 'YEAR',
          layout: {
            cx: 10,
            cy: 10,
            r: 10,
          }
        },
        {
          type: 'COUNTRY',
          layout: {
            cx: 20,
            cy: 20,
            r: 10,
          }
        }
      ]
    }
  }
}
</script>

<style scoped>

</style>
