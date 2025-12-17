---
title: CDN国内外分流
published: 2025-12-18
description: 记录一下实现国内访问转EdgeOne，国外访问转Netlify
image: "https://imoss.tiwat.cn/2025/12/18/1765992642503.png_t"
tags: [edgeone,netlify]
category: cdn
draft: false
lang: ""
---

# 前情提要

之前在测试博客的抗 D 能力时，发现 EdgeOne 在不屏蔽国外访问的情况下确实有些吃力。  
于是我在「不屏蔽国外」的前提下，想到使用 **Cloudflare进行分流**。想法本身很简单，但实际实现下来并不理想。

那么，**为什么最后会从 CF 换成 Netlify 呢？**

## DNS 分流的常规思路

正常情况下，想实现国内 / 国外分流，**最简单的方式就是在域名 DNS 中根据请求来源进行解析**。

如图（这里以阿里云为例，其他云厂商的逻辑基本一致）：

![DNS 分线路解析示意](https://imoss.tiwat.cn/2025/12/18/1765990667418.png_t)

## 最初的思路

> 国外访问 → CF CDN → CF Pages

但由于 使用 CF CDN 必须将域名 DNS **迁入** Cloudflare，而 DNS 一旦迁入 CF，就无法再设置按请求来源解析
（至少目前我所知 CF 还没有这个功能）。

## CF Pages 的限制

于是我又想到：  
**CF Pages 支持 CNAME 解析**，但存在限制：

- 只能是 **子域名**
- **根域名仍然必须迁入 DNS**

如图：

![CF Pages CNAME 限制](https://imoss.tiwat.cn/2025/12/18/1765991052914.png_t)
而根域名需要转入
![CF Pages 域名绑定](https://imoss.tiwat.cn/2025/12/18/1765991079417.png_t)

虽然直接使用子域名已经很方便了，但我还是想再折腾一下，  
**看看能否实现根域名解析**。

## 尝试方案：自定义主机名

### 通过「自定义主机名」来曲线救国？

首先，我准备了一个工具域名：

```text
cf.22337788.xyz
````

将该工具域名 **CNAME 一个二级域名到 CF Pages**，  
并且 **开启 CF 的 CDN**，作为 **回源域名**。

![工具域名回源配置](https://imoss.tiwat.cn/2025/12/18/1765991670032.png_t)

随后添加 **回退源（Fallback Origin）**：

![回退源配置](https://imoss.tiwat.cn/2025/12/18/1765991731241.png_t)

接着，将 **主域名 `tiwat.cn`** 添加到 **自定义主机名** 中：

![自定义主机名](https://imoss.tiwat.cn/2025/12/18/1765991793545.png_t)

然后只需要把 **主域名的境外DNS解析** 指向这个工具域名即可……吗？

正如前文所说，如果一切真的这么顺利，  
那也就不会从 **CF 换到 Netlify** 了。

## CF报错：522

完成上述配置后，访问主域名 `tiwat.cn`，会发现 **Cloudflare 报错 522**。  
询问 GPT 后得知：

> **回退源所指向的域名，背后必须有一台真实在监听 HTTP / HTTPS 的服务器。**

如图：

![522 错误](https://imoss.tiwat.cn/2025/12/18/1765992157531.png_t)

## 尝试回源 EdgeOne Pages 

那不用 CF Pages 不就好了？  
直接让 **EdgeOne Pages** 当回退源。

理想很美好，现实很骨感 ——  
**CF 回源 EdgeOne Pages 的速度，几乎等同于国内裸连 CF。**

## 转向 Netlify

### 使用 Netlify 作为源站？

Netlify **支持根域名解析**：

![Netlify 根域名解析](https://imoss.tiwat.cn/2025/12/18/1765992388662.png_t)

直接选择 **境外解析** 即可：

![境外解析](https://imoss.tiwat.cn/2025/12/18/1765992544866.png_t)

实际速度非常理想，  
**真正意义上的全球绿**：

![全球测速](https://imoss.tiwat.cn/2025/12/18/1765992642503.png_t)

## 一点补充说明

不过需要注意的是，**Netlify 免费版每月只有 100GB 流量**。  
如果想让站点更抗 D，可以考虑：

> 将上述操作的回退源选择为 **Netlify**

_（理论上是可行的，但我本人暂时还没有实际测试过）_
