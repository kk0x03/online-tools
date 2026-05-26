<script setup>
defineProps({
  tutorial: { type: Object, required: true }
})

defineEmits(['tryCode'])
</script>

<template>
  <article class="tutorial-content">
    <header class="tutorial-header">
      <h2 :id="'tutorial-' + tutorial.slug" class="tutorial-title">
        {{ tutorial.title }}
        <span class="tutorial-subtitle">{{ tutorial.subtitle }}</span>
      </h2>
      <p class="tutorial-desc">{{ tutorial.description }}</p>
    </header>

    <section v-for="(section, i) in tutorial.sections" :key="i" class="tutorial-section">
      <h3 class="section-title">{{ section.title }}</h3>
      <p class="section-explanation">{{ section.explanation }}</p>
      <div class="code-block">
        <pre><code>{{ section.code }}</code></pre>
        <button class="try-btn" @click="$emit('tryCode', section.code)">
          在编辑器中试试
        </button>
      </div>
    </section>
  </article>
</template>

<style scoped>
.tutorial-content {
  padding: 24px 32px;
  max-width: 800px;
}

.tutorial-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.tutorial-title {
  font-size: 22px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px;
}

.tutorial-subtitle {
  font-size: 14px;
  font-weight: 400;
  color: #999;
  margin-left: 8px;
}

.tutorial-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.tutorial-section {
  margin-bottom: 28px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px;
}

.section-explanation {
  font-size: 13px;
  color: #555;
  line-height: 1.6;
  margin: 0 0 12px;
}

.code-block {
  position: relative;
  background: #282c34;
  border-radius: 6px;
  overflow: hidden;
}

.code-block pre {
  margin: 0;
  padding: 16px;
  overflow-x: auto;
}

.code-block code {
  font-family: Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
  line-height: 1.5;
  color: #abb2bf;
}

.try-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.try-btn:hover {
  background: #409eff;
  border-color: #409eff;
}

@media (max-width: 720px) {
  .tutorial-content {
    padding: 16px;
  }

  .tutorial-title {
    font-size: 18px;
  }

  .code-block code {
    font-size: 12px;
  }
}
</style>
