---
title: 利用EdgeOne Pages Functions实现访问量统计
published: 2025-12-27
description: 此方案仅供参考
image: ""
tags:
  - edgeone
  - 统计
category: Blog
draft: false
lang: ""
---


# 1. 申请 KV 存储

官方文档：[KV 存储](https://edgeone.cloud.tencent.com/pages/document/162936897742577664#391f1f77-b06f-4b70-838b-c14b8673df36)

创建命名空间后将其绑定至博客，并记住你设置的变量（这里以 `blog` 为例）

![KV 设置示例](https://imoss.tiwat.cn/blog/2025/12/27/210205811.png_b)

---

#   2. 创建后端接口

在博客根目录创建 `/edge-functions/api/views.js`：
## views.js

```javascript
export async function onRequest({ request, params, env }) {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
        return new Response(JSON.stringify({ error: "Missing 'id' parameter" }), {
            status: 400,
            headers: { 'content-type': 'application/json' }
        });
    }

    const kvKey = `view_${id}`;
    let count = await <这里填入变量名称>.get(kvKey);
    count = Number(count) + 1;
    
    await <这里填入变量名称>.put(kvKey, String(count));

    return new Response(JSON.stringify({ visitCount: count }), {
      headers: {
        'content-type': 'application/json; charset=UTF-8',
        'Access-Control-Allow-Origin': '*',
      },
    });
}
```

访问接口测试：

```
https://tiwat.cn/api/views
```

会返回：

```json
{"error":"Missing 'id' parameter"}
```

至此，后端接口已就绪，前端即可调用。

---

# 3. 前端组件

在 `/src/components` 下创建两个组件，分别用于文章页和首页显示访问量。

## 1. PostViews.astro

```astro
<div
  id="post-view-container"
  class="flex flex-row items-center opacity-0 transition-opacity duration-500"
>
  <div
    class="transition h-6 w-6 rounded-md bg-black/5 dark:bg-white/10
           text-black/50 dark:text-white/50
           flex items-center justify-center mr-2"
  >
    <slot name="icon" />
  </div>

  <div class="text-sm">
    <span id="post-view-count">...</span> 次阅读
  </div>
</div>

<script client:load>
  async function updatePostPV() {
    if (!location.pathname.includes('/posts/')) return;

    const container = document.getElementById('post-view-container');
    const countSpan = document.getElementById('post-view-count');

    if (!container || !countSpan) return;

    if (container.dataset.fetched === 'true') return;
    container.dataset.fetched = 'true';

    try {
      const res = await fetch(
        `/api/views?id=${encodeURIComponent(location.pathname)}`
      );
      const data = await res.json();

      if (typeof data.visitCount === 'number') {
        countSpan.textContent = data.visitCount.toLocaleString();
        container.classList.remove('opacity-0');
      }
    } catch (err) {
      console.error('[PostViews] fetch failed:', err);
      delete container.dataset.fetched;
    }
  }

  updatePostPV();
</script>
```

## 2. TotalViews.astro

```astro
<div
  id="total-pv-container"
  class="flex items-center justify-center gap-1 text-xs
         text-neutral-400 mb-3 opacity-0
         transition-opacity duration-500"
>
  <slot name="icon" />
  <span>全站访问量</span>
  <span
    id="total-pv-count"
    class="font-bold text-[var(--primary)]"
  >
    ...
  </span>
</div>

<script client:load>
  async function updateTotalPV() {
    const container = document.getElementById('total-pv-container');
    const countEl = document.getElementById('total-pv-count');
    if (!container || !countEl) return;

    if (container.dataset.fetched === 'true') return;
    container.dataset.fetched = 'true';

    try {
      const res = await fetch('/api/views?id=total');
      const data = await res.json();

      if (typeof data.visitCount === 'number') {
        countEl.textContent = data.visitCount.toLocaleString();
        container.classList.remove('opacity-0');
      }
    } catch (e) {
      console.error('[TotalViews] error:', e);
      delete container.dataset.fetched;
    }
  }

  updateTotalPV();
</script>
```

---

# 4. 引入文章页

在 `/src/pages/posts/[...slug].astro` 顶部引入组件：

```astro
import PostViews from "@components/PostViews.astro";
```

将其添加到 `字数和阅读时间` 的父容器中：

```astro
<PostViews>
    <Icon
        slot="icon"
        name="material-symbols:visibility-outline-rounded"
    />
</PostViews>
```

示例：

```astro
<div class="flex flex-row text-black/30 dark:text-white/30 gap-5 mb-3 transition onload-animation">
    <div class="flex flex-row items-center">
        <div class="transition h-6 w-6 rounded-md bg-black/5 dark:bg-white/10 text-black/50 dark:text-white/50 flex items-center justify-center mr-2">
            <Icon name="material-symbols:notes-rounded"></Icon>
        </div>
        <div class="text-sm">{remarkPluginFrontmatter.words} {i18n(I18nKey.wordsCount)}</div>
    </div>
    <div class="flex flex-row items-center">
        <div class="transition h-6 w-6 rounded-md bg-black/5 dark:bg-white/10 text-black/50 dark:text-white/50 flex items-center justify-center mr-2">
            <Icon name="material-symbols:schedule-outline-rounded"></Icon>
        </div>
        <div class="text-sm">
            {remarkPluginFrontmatter.minutes} {i18n(remarkPluginFrontmatter.minutes === 1 ? I18nKey.minuteCount : I18nKey.minutesCount)}
        </div>
    </div>
    <PostViews>
        <Icon
            slot="icon"
            name="material-symbols:visibility-outline-rounded"
        />
    </PostViews>
</div>
```

---

# 5. 引入首页

在 `/src/components/widget/Profile.astro` 顶部引入：

```astro
import TotalViews from "@components/TotalViews.astro";
```

调用组件示例：

```astro
<TotalViews>
  <Icon
    slot="icon"
    name="fa6-regular:chart-bar"
    class="text-[0.75rem]"
  />
</TotalViews>
```

示例：

```astro
<div class="px-2">
    <div class="font-bold text-xl text-center mb-1 dark:text-neutral-50 transition">{config.name}</div>
    <div class="h-1 w-5 bg-[var(--primary)] mx-auto rounded-full mb-2 transition"></div>
    <div class="text-center text-neutral-400 mb-2.5 transition">{config.bio}</div>
    
    <TotalViews>
      <Icon
        slot="icon"
        name="fa6-regular:chart-bar"
        class="text-[0.75rem]"
      />
    </TotalViews>

    <div class="flex flex-wrap gap-2 justify-center mb-1">
        {config.links.length > 1 && config.links.map(item =>
                <a rel="me" aria-label={item.name} href={item.url} target="_blank" class="btn-regular rounded-lg h-10 w-10 active:scale-90">
                    <Icon name={item.icon} class="text-[1.5rem]"></Icon>
                </a>
        )}
        {config.links.length == 1 && <a rel="me" aria-label={config.links[0].name} href={config.links[0].url} target="_blank"
                                        class="btn-regular rounded-lg h-10 gap-2 px-3 font-bold active:scale-95">
            <Icon name={config.links[0].icon} class="text-[1.5rem]"></Icon>
            {config.links[0].name}
        </a>}
    </div>
</div>
```
---
# 最终效果:
![最终效果](https://imoss.tiwat.cn/blog/2025/12/27/213508143.png_b)