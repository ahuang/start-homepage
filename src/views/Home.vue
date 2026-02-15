<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import sectionsData from '../../pages/data/index.json';

type LinkItem = {
  name: string;
  url: string;
  icon?: string;
  highlight?: boolean;
  _hidden?: boolean; // 软删除标记：true=不可见
};

type Section = {
  key: string;
  title: string;
  list: LinkItem[];
  _hidden?: boolean; // 软删除标记：true=不可见
};

const GIST_ID = import.meta.env.VITE_GIST_ID;
const GIST_FILENAME = import.meta.env.VITE_GIST_FILENAME || 'homepage.json';
const hasGist = !!GIST_ID;
const GIST_TOKEN_STORAGE_KEY = 'start-homepage-gist-token';
const gistToken = ref<string | null>(null);
console.log('hasGist',hasGist)
const defaultSections = sectionsData as Section[];
const isEditMode = ref(false);
const sections = ref<Section[]>([...defaultSections]);
const collapsedIndices = ref<Set<number>>(new Set());
// 仅用于展示的列表：过滤掉被标记隐藏的分组
const visibleSections = computed(() =>
  sections.value
    .map((section, index) => ({ section, index }))
    .filter(({ section }) => !section._hidden)
);
const loadStatus = reactive<{ loading: boolean; error: string }>({
  loading: true,
  error: '',
});

const saveStatus = reactive<{ loading: boolean; message: string }>({
  loading: false,
  message: '',
});

const isDev = import.meta.env.DEV;
const baseUrl = import.meta.env.BASE_URL;

// WeChat modal state
const wechatModalOpen = ref<'public' | 'miniapp' | null>(null);

async function loadFromGist() {
  if (!hasGist) {
    loadStatus.loading = false;
    return;
  }
  try {
    const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers: {
        Accept: 'application/vnd.github+json',
      },
    });
    if (!res.ok) {
      if (res.status === 404) {
        loadStatus.error = '';
        return;
      }
      throw new Error(`HTTP ${res.status}`);
    }
    const json = await res.json();
    const file = json.files?.[GIST_FILENAME];
    if (file?.content) {
      const data = JSON.parse(file.content);
      if (Array.isArray(data) && data.length > 0) {
        sections.value = data;
      }
    }
  } catch {
    loadStatus.error = 'Gist 读取失败，使用本地配置';
  } finally {
    loadStatus.loading = false;
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    gistToken.value = window.localStorage.getItem(GIST_TOKEN_STORAGE_KEY);
  }
  if (hasGist) {
    loadFromGist();
  } else {
    loadStatus.loading = false;
  }
});

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
  // 软删除：仅打标，不真正删除
  const target = sections.value[index];
  if (target) {
    target._hidden = true;
  }
}

function addLink(sectionIndex: number) {
  sections.value[sectionIndex].list.unshift({
    name: '新链接',
    url: 'https://',
    icon: '',
  });
}

function toggleCollapse(index: number) {
  const next = new Set(collapsedIndices.value);
  if (next.has(index)) next.delete(index);
  else next.add(index);
  collapsedIndices.value = next;
}

function isCollapsed(index: number) {
  return collapsedIndices.value.has(index);
}

function removeLink(sectionIndex: number, linkIndex: number) {
  const sec = sections.value[sectionIndex];
  if (!sec) return;
  const target = sec.list[linkIndex];
  if (target) {
    target._hidden = true;
  }
}

async function save() {
  saveStatus.loading = true;
  saveStatus.message = '';
  try {
    if (hasGist) {
      if (!gistToken.value) {
        const input = window.prompt(
          '请输入 GitHub Token（仅保存在本地浏览器，用于更新 Gist）'
        );
        if (!input) {
          throw new Error('未提供 Token，保存已取消');
        }
        gistToken.value = input.trim();
        window.localStorage.setItem(GIST_TOKEN_STORAGE_KEY, gistToken.value);
      }
      const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
        method: 'PATCH',
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${gistToken.value}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: {
            [GIST_FILENAME]: {
              content: JSON.stringify(sections.value, null, 2),
            },
          },
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || `HTTP ${res.status}`);
      }
      loadStatus.loading = true;
      const json = await res.json();
      const file = json.files?.[GIST_FILENAME];
      if (file?.content) {
        const data = JSON.parse(file.content);
        if (Array.isArray(data) && data.length > 0) {
          sections.value = data;
        }
      }
      isEditMode.value = false;
      collapsedIndices.value = new Set();
      saveStatus.message = '已保存到 Gist';
      loadStatus.loading = false;
    } else if (isDev) {
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

let editSnapshot: Section[] = [];

function cancelEdit() {
  isEditMode.value = false;
  collapsedIndices.value = new Set();
  sections.value = JSON.parse(JSON.stringify(editSnapshot));
}

function restoreDefault() {
  sections.value = JSON.parse(JSON.stringify(defaultSections));
  loadStatus.error = '';
  editSnapshot = JSON.parse(JSON.stringify(defaultSections));
}
</script>

<template>
  <div class="page">
    <div v-if="loadStatus.loading" class="load-hint">加载中...</div>
    <div v-else-if="loadStatus.error" class="load-hint load-error">
      {{ loadStatus.error }}
      <button class="btn btn-ghost btn-sm" @click="restoreDefault">使用本地</button>
    </div>
    <div v-if="isEditMode" class="edit-toolbar">
      <span class="edit-toolbar-label">编辑模式</span>
      <button class="btn btn-primary" :disabled="saveStatus.loading" @click="save">
        {{ saveStatus.loading ? '保存中...' : hasGist ? '保存到 Gist' : '保存' }}
      </button>
      <!-- <button class="btn btn-secondary" @click="addSection">添加分组</button> -->
      <!-- <button v-if="hasGist" class="btn btn-ghost" @click="restoreDefault">
        恢复默认
      </button> -->
      <button class="btn btn-ghost" @click="cancelEdit">取消</button>
      <span v-if="saveStatus.message" class="save-status">{{
        saveStatus.message
      }}</span>
    </div>
    <div v-else class="edit-toolbar">
      <button class="btn btn-ghost btn-sm" @click="editSnapshot = JSON.parse(JSON.stringify(sections)); isEditMode = true">
        编辑
      </button>
    </div>

    <section class="section-grid" :class="{ 'is-edit': isEditMode }">
      <article
        v-for="item in visibleSections"
        :key="item.section.key"
        class="section-card"
      >
        <header
          class="section-header"
          :class="{ 'is-collapsible': isEditMode }"
          @click="isEditMode && toggleCollapse(item.index)"
        >
          <template v-if="isEditMode">
            <div class="section-edit-fields">
              <span>{{ item.section.title }}</span>
              <span class="section-key">{{ item.section.key }}</span>
            </div>
            <div class="section-actions-group">
              <button
                class="btn-icon"
                title="添加链接"
                @click.stop="addLink(item.index)"
              >
                +
              </button>
              <button
                class="btn-icon btn-icon-danger"
                title="删除分组"
                @click.stop="removeSection(item.index)"
              >
                ×
              </button>
            </div>
            <span class="collapse-icon" :title="isCollapsed(item.index) ? '展开' : '折叠'">
              {{ isCollapsed(item.index) ? '▶' : '▼' }}
            </span>
          </template>
          <template v-else>
            <h2 class="section-title">
              <span>{{ item.section.title }}</span>
              <span class="section-key">{{ item.section.key }}</span>
            </h2>
          </template>
        </header>

        <div v-show="!isEditMode || !isCollapsed(item.index)" class="links-grid">
          <template
            v-for="linkItem in item.section.list
              .map((link, index) => ({ link, index }))
              .filter(({ link }) => !link._hidden)"
            :key="linkItem.link.url + linkItem.index"
          >
            <a
              v-if="!isEditMode"
              class="link-chip"
              :href="linkItem.link.url"
              target="_blank"
              rel="noreferrer"
            >
              <!-- <span
                v-if="linkItem.link.icon"
                class="link-icon"
                :style="{ backgroundImage: `url(${iconUrl(linkItem.link.icon)})` }"
              /> -->
              <span class="link-label">{{ linkItem.link.name }}</span>
            </a>
            <div v-else class="link-edit">
              <input v-model="linkItem.link.name" class="edit-input" placeholder="名称" />
              <input v-model="linkItem.link.url" class="edit-input edit-input-url" placeholder="URL" />
              <button
                class="btn-icon btn-icon-danger"
                title="删除"
                @click="removeLink(item.index, linkItem.index)"
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
          <span>微信</span>
        </h2>
      </header>
      <div style="display: flex; gap: 16px; flex-wrap: wrap; justify-content: flex-start">
        <button class="wechat-button" @click="wechatModalOpen = 'public'">
          <span class="wechat-label">公众号</span>
        </button>
        <button class="wechat-button" @click="wechatModalOpen = 'miniapp'">
          <span class="wechat-label">小程序</span>
        </button>
      </div>
    </section>

    <!-- WeChat QR Code Modal -->
    <div v-if="wechatModalOpen" class="modal-overlay" @click="wechatModalOpen = null">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="wechatModalOpen = null">×</button>
        <div class="modal-body">
          <img
            v-if="wechatModalOpen === 'public'"
            :src="`${baseUrl}wechat/public.jpg`"
            alt="公众号"
            class="modal-qrcode"
          />
          <img
            v-else-if="wechatModalOpen === 'miniapp'"
            :src="`${baseUrl}wechat/miniapp.jpg`"
            alt="小程序"
            class="modal-qrcode"
          />
        </div>
      </div>
    </div>
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

.collapse-icon {
  margin-left: auto;
  flex-shrink: 0;
  font-size: 10px;
  color: var(--text-muted);
}

.section-header.is-collapsible {
  cursor: pointer;
}

.section-header.is-collapsible:hover .collapse-icon {
  color: var(--accent);
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

.section-actions-group {
  display: flex;
  gap: 6px;
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
  min-width: 80px;
}

.link-edit .edit-input-url {
  flex: 1;
}


.link-edit .edit-input-sm {
  width: 70px;
  flex: none;
}

.save-status {
  font-size: 12px;
  color: var(--accent);
}

.load-hint {
  padding: 8px 12px;
  font-size: 13px;
  color: var(--text-muted);
}

.load-error {
  color: #f87171;
  display: flex;
  align-items: center;
  gap: 8px;
}

.wechat-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.55);
  background: radial-gradient(circle at top left, #111827, #020617);
  color: var(--text);
  font-size: 13px;
  text-decoration: none;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    border-color 0.15s ease,
    background 0.15s ease,
    color 0.15s ease;
}

.wechat-button:hover {
  transform: translateY(-1px);
  border-color: rgba(56, 189, 248, 0.9);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.8);
  background: radial-gradient(circle at top left, rgba(56, 189, 248, 0.18), #020617);
  color: #e0f2fe;
}

.wechat-button-content {
  display: flex;
  align-items: center;
  gap: 4px;
}

.wechat-label {
  font-size: 13px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

.modal-content {
  background: radial-gradient(circle at top left, #1f2937, #020617);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-subtle);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  animation: slideUp 0.3s ease;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(56, 189, 248, 0.1);
  color: var(--accent);
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 1001;
}

.modal-close:hover {
  background: rgba(56, 189, 248, 0.2);
  transform: scale(1.1);
}

.modal-body {
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-qrcode {
  max-width: 400px;
  max-height: 70vh;
  width: auto;
  height: auto;
  border-radius: 8px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
