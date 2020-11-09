<template>
  <g class="pinwheel">
    <circle r="15"
            :cx="center.x"
            :cy="center.y"
            fill="green"
    ></circle>
  </g>
</template>

<script>
export default {
  name: 'Pinwheel',
  props: {
    center: {
      type: Object,
      default: () => {
        return {
          x: 0,
          y: 0,
        }
      }
    }
  }
}
</script>
