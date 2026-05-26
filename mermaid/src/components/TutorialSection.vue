<script setup>
import { ref } from 'vue'
import { tutorials } from '@/tutorials/index.js'
import TutorialNav from './TutorialNav.vue'
import TutorialContent from './TutorialContent.vue'

const activeSlug = ref(tutorials[0]?.slug || '')

defineEmits(['tryCode'])

function onSelect(slug) {
  activeSlug.value = slug
  const el = document.getElementById('tutorial-' + slug)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<template>
  <section class="tutorial-section-root">
    <div class="tutorial-layout">
      <TutorialNav :active-slug="activeSlug" @select="onSelect" />
      <div class="tutorial-body">
        <TutorialContent
          v-for="t in tutorials"
          :key="t.slug"
          :tutorial="t"
          @try-code="(code) => $emit('tryCode', code)"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.tutorial-section-root {
  border-top: 2px solid #e0e0e0;
  background: #fff;
  flex-shrink: 0;
}

.tutorial-layout {
  display: flex;
  min-height: 400px;
  max-width: 1200px;
  margin: 0 auto;
}

.tutorial-body {
  flex: 1;
  overflow-y: auto;
}

@media (max-width: 720px) {
  .tutorial-layout {
    flex-direction: column;
  }
}
</style>
