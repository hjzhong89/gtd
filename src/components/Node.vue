<template>
  <g :class="`node-group ${type}`">
    <circle v-bind="layout" :class="`node-circle ${type}`"></circle>
    <text x="10" y="10" :class="`node-label ${type}`">{{ displayValue }}</text>
  </g>
</template>

<script>
import CircleProperties from '@/types/CircleProperties';

export const NodeProperties = {
  type: String,
  display: String || undefined,
  layout: CircleProperties,
  children: Array,
  detail: Object,
};

export default {
  name: 'Node',
  props: NodeProperties,
  computed: {
    displayValue() {
      if (this.display) {
        return this.display.length > 10
          ? `${this.display.substr(0, 7)}...`
          : this.display;
      }
      return '';
    },
  },
};
</script>

<style scoped>

</style>
