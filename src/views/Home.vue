<script setup lang="ts">
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

const sections: Section[] = sectionsData as Section[];

function iconUrl(icon?: string) {
  if (!icon) return '';
  return `/start-homepage/icons/${icon}`;
}
</script>

<template>
  <div class="page">
    <section class="section-grid">
      <article
        v-for="section in sections"
        :key="section.key"
        class="section-card"
      >
        <header class="section-header">
          <h2 class="section-title">
            <span>{{ section.title }}</span>
            <span class="section-key">{{ section.key }}</span>
          </h2>
        </header>

        <div class="links-grid">
          <a
            v-for="item in section.list"
            :key="item.url"
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
        <img src="/start-homepage/wechat/public.jpg" width="260" />
        <img src="/start-homepage/wechat/miniapp.jpg" width="260" />
      </div>
    </section>
  </div>
</template>

