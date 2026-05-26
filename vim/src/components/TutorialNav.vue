<script setup>
import { tutorials } from '@/tutorials/index.js'

defineProps({
  activeSlug: { type: String, default: '' }
})

defineEmits(['select'])
</script>

<template>
  <aside class="tutorial-nav">
    <nav>
      <h3 class="nav-title">Mermaid 教程</h3>
      <ul class="nav-list">
        <li v-for="t in tutorials" :key="t.slug">
          <a
            :href="'#tutorial-' + t.slug"
            :class="['nav-link', { active: activeSlug === t.slug }]"
            @click.prevent="$emit('select', t.slug)"
          >
            {{ t.title }}
            <span class="nav-subtitle">{{ t.subtitle }}</span>
          </a>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<style scoped>
.tutorial-nav {
  width: 200px;
  min-width: 200px;
  border-right: 1px solid #e8e8e8;
  background: #fafafa;
  height: 100%;
  overflow-y: auto;
}

.nav-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  padding: 16px 16px 8px;
  margin: 0;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-list li {
  margin: 0;
}

.nav-link {
  display: block;
  padding: 8px 16px;
  font-size: 13px;
  color: #555;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.15s;
  border-left: 3px solid transparent;
}

.nav-link:hover {
  color: #409eff;
  background: #f0f7ff;
}

.nav-link.active {
  color: #409eff;
  background: #e6f4ff;
  border-left-color: #409eff;
  font-weight: 500;
}

.nav-subtitle {
  display: block;
  font-size: 11px;
  color: #999;
  margin-top: 1px;
}

.nav-link.active .nav-subtitle {
  color: #409eff;
}

@media (max-width: 720px) {
  .tutorial-nav {
    width: 100%;
    min-width: 100%;
    max-height: 200px;
    border-right: none;
    border-bottom: 1px solid #e8e8e8;
  }

  .nav-list {
    display: flex;
    flex-wrap: wrap;
    padding: 8px;
    gap: 4px;
  }

  .nav-link {
    border-left: none;
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 12px;
  }
}
</style>
