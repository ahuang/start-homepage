<script setup lang="ts">
import { ref, reactive } from 'vue';
import sectionsData from '../../pages/data/index.json';

type LinkItem = {
  name: string;
  url: string;
  icon?: string;
  highlight?: boolean;
};

type Section = {
  key: string;
  title: string;
  list: LinkItem[];
};

const isEditMode = ref(false);
const sections = ref<Section[]>([...(sectionsData as Section[])]);

const saveStatus = reactive<{ loading: boolean; message: string }>({
  loading: false,
  message: '',
});

const isDev = import.meta.env.DEV;
const baseUrl = import.meta.env.BASE_URL;

function iconUrl(icon?: string) {
  if (!icon) return '';
  return `${baseUrl}icons/${icon}`;
}

function addSection() {
  sections.value.push({
    key: `new-${Date.now()}`,
    title: '新分组',
    list: [],
  });
}

function removeSection(index: number) {
  sections.value.splice(index, 1);
}

function addLink(sectionIndex: number) {
  sections.value[sectionIndex].list.push({
    name: '新链接',
    url: 'https://',
    icon: '',
  });
}

function removeLink(sectionIndex: number, linkIndex: number) {
  sections.value[sectionIndex].list.splice(linkIndex, 1);
}

async function save() {
  saveStatus.loading = true;
  saveStatus.message = '';
  try {
    if (isDev) {
      const res = await fetch('/api/save-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sections.value),
      });
      const json = await res.json();
      if (json.ok) {
        saveStatus.message = '已保存到 index.json';
      } else {
        saveStatus.message = json.message || '保存失败';
      }
    } else {
      const blob = new Blob([JSON.stringify(sections.value, null, 2)], {
        type: 'application/json',
      });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'index.json';
      a.click();
      URL.revokeObjectURL(a.href);
      saveStatus.message = '已下载 index.json，请替换到 pages/data/ 目录';
    }
  } catch (e: any) {
    saveStatus.message = e?.message || '保存失败';
  } finally {
    saveStatus.loading = false;
  }
}

function cancelEdit() {
  isEditMode.value = false;
  sections.value = [...(sectionsData as Section[])];
}
</script>

<template>
  <div class="page">
    <div v-if="isEditMode" class="edit-toolbar">
      <span class="edit-toolbar-label">编辑模式</span>
      <button class="btn btn-primary" :disabled="saveStatus.loading" @click="save">
        {{ saveStatus.loading ? '保存中...' : '保存到 index.json' }}
      </button>
      <button class="btn btn-secondary" @click="addSection">添加分组</button>
      <button class="btn btn-ghost" @click="cancelEdit">取消</button>
      <span v-if="saveStatus.message" class="save-status">{{
        saveStatus.message
      }}</span>
    </div>
    <div v-else class="edit-toolbar">
      <button class="btn btn-ghost btn-sm" @click="isEditMode = true">
        编辑
      </button>
    </div>

    <section class="section-grid">
      <article
        v-for="(section, sIdx) in sections"
        :key="section.key"
        class="section-card"
      >
        <header class="section-header">
          <template v-if="isEditMode">
            <div class="section-edit-fields">
              <input
                v-model="section.title"
                class="edit-input"
                placeholder="标题"
              />
              <input
                v-model="section.key"
                class="edit-input edit-input-sm"
                placeholder="key"
              />
            </div>
            <div class="section-actions">
              <button
                class="btn-icon"
                title="添加链接"
                @click="addLink(sIdx)"
              >
                +
              </button>
              <button
                class="btn-icon btn-icon-danger"
                title="删除分组"
                @click="removeSection(sIdx)"
              >
                ×
              </button>
            </div>
          </template>
          <template v-else>
            <h2 class="section-title">
              <span>{{ section.title }}</span>
              <span class="section-key">{{ section.key }}</span>
            </h2>
          </template>
        </header>

        <div class="links-grid">
          <template v-for="(item, lIdx) in section.list" :key="item.url + lIdx">
            <a
              v-if="!isEditMode"
              class="link-chip"
              :href="item.url"
              target="_blank"
              rel="noreferrer"
            >
              <span
                v-if="item.icon"
                class="link-icon"
                :style="{ backgroundImage: `url(${iconUrl(item.icon)})` }"
              />
              <span class="link-label">{{ item.name }}</span>
            </a>
            <div v-else class="link-edit">
              <input v-model="item.name" class="edit-input" placeholder="名称" />
              <input v-model="item.url" class="edit-input" placeholder="URL" />
              <input
                v-model="item.icon"
                class="edit-input edit-input-sm"
                placeholder="icon"
              />
              <button
                class="btn-icon btn-icon-danger"
                title="删除"
                @click="removeLink(sIdx, lIdx)"
              >
                ×
              </button>
            </div>
          </template>
        </div>
      </article>
    </section>

    <section class="section-card" style="margin-top: 12px">
      <header class="section-header">
        <h2 class="section-title">
          <span>微信公众号 & 小程序</span>
        </h2>
      </header>
      <div style="display: flex; gap: 16px; flex-wrap: wrap; justify-content: center">
        <img :src="`${baseUrl}wechat/public.jpg`" width="260" alt="公众号" />
        <img :src="`${baseUrl}wechat/miniapp.jpg`" width="260" alt="小程序" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.edit-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
  padding: 8px 0;
}

.edit-toolbar-label {
  font-size: 13px;
  color: var(--text-muted);
}

.btn {
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.btn-sm {
  padding: 4px 10px;
  font-size: 12px;
}

.btn-primary {
  background: var(--accent);
  color: #0f172a;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--accent-soft);
  color: var(--accent);
  border: 1px solid rgba(56, 189, 248, 0.5);
}

.btn-ghost {
  background: transparent;
  color: var(--text-muted);
  border: 1px solid var(--border-subtle);
}

.btn-ghost:hover {
  color: var(--text);
}

.btn-icon {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: none;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon-danger {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

.section-edit-fields {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.section-edit-fields .edit-input {
  flex: 1;
  min-width: 60px;
}

.section-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.edit-input {
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid var(--border-subtle);
  background: rgba(15, 23, 42, 0.6);
  color: var(--text);
  font-size: 14px;
}

.edit-input-sm {
  width: 80px;
  font-size: 12px;
}

.link-edit {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 8px;
  border: 1px dashed var(--border-subtle);
  background: rgba(15, 23, 42, 0.4);
}

.link-edit .edit-input {
  flex: 1;
  min-width: 80px;
}

.link-edit .edit-input-sm {
  width: 70px;
  flex: none;
}

.save-status {
  font-size: 12px;
  color: var(--accent);
}
</style>
