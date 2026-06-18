<template>
  <div class="dynamic-event">
    <strong>Event:</strong>
    {{ event.title }}
  </div>
</template>

<script>
export default {
  props: {
    event: {
      type: Object,
      required: true
    }
  }
};
</script>
