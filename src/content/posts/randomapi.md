---
title: 通过兰空图床为博客实现首页随机图
published: 2026-01-06
description: 为兰空图床添加随机API，并配合Functions实现随机图
image: https://imoss.tiwat.cn/blog/2026/01/06/132913250.png_b
tags:
  - edgeone
  - 兰空图床
  - api
category: Blog
draft: false
lang: zh-CN
pinned: false
---

---

兰空图床开源版是没有随机图功能的（没用过Pro版我也不知道Pro有没有），为此我们需要为它添加 API。

---

## 1. 新建控制器

在兰空图床项目路径 `app/Http/Controllers/Api/V1/` 下新建一个控制器：`RandomImageController.php`

```php
<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Image;
use App\Models\Strategy;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class  RandomImageController  extends  Controller 
{
    /**
     * 随机获取用户的一张图片（不限制存储策略）
     * 支持参数：
     * - type: 文件类型，如 png, jpg, mp4
     * - format: 返回格式 json/url/raw
     * 支持三种返回方式：
     * - 默认：返回图片信息JSON
     * - ?format=url：返回图片URL链接
     * - ?format=raw：直接返回图片内容
     */
    public function random(Request $request): Response
    {
        $format = $request->query('format', 'json'); // json, url, raw
        $type = $request->query('type'); // 文件扩展名，如：jpg, png, mp4

        /** @var User $user */
        $user = Auth::user();

        $query = $user->images();

        // 如果指定了文件类型，添加筛选条件
        if ($type) {
            $query->where('extension', strtolower($type));
        }

        // 随机获取用户的一张图片
        $image = $query->inRandomOrder()->first();

        if (!$image) {
            if ($type) {
                return $this->fail("没有找到 {$type} 类型的文件");
            }
            return $this->fail('没有找到图片');
        }

        return $this->formatImageResponse($image, $format);
    }

    /**
     * 根据存储策略ID随机获取一张图片
     * 支持三种返回方式：
     * - 默认：返回图片信息JSON
     * - ?format=url：返回图片URL链接
     * - ?format=raw：直接返回图片内容
     */
    public function byStrategy(Request $request): Response
    {
        $strategyId = $request->route('strategy_id');
        $format = $request->query('format', 'json'); // json, url, raw
        
        // 验证存储策略是否存在
        $strategy = Strategy::find($strategyId);
        if (!$strategy) {
            return $this->fail('存储策略不存在');
        }

        /** @var User $user */
        $user = Auth::user();

        // 从该存储策略中随机获取用户的一张图片
        $image = $user->images()
            ->where('strategy_id', $strategyId)
            ->inRandomOrder()
            ->first();

        if (!$image) {
            return $this->fail('该存储策略下没有找到图片');
        }

        return $this->formatImageResponse($image, $format);
    }

    /**
     * 根据相册ID随机获取一张图片
     * 支持三种返回方式：
     * - 默认：返回图片信息JSON
     * - ?format=url：返回图片URL链接
     * - ?format=raw：直接返回图片内容
     */
    public function byAlbum(Request $request): Response
    {
        $albumId = $request->route('album_id');
        $format = $request->query('format', 'json'); // json, url, raw

        /** @var User $user */
        $user = Auth::user();

        // 验证相册是否存在且属于当前用户
        $album = $user->albums()->find($albumId);
        if (!$album) {
            return $this->fail('相册不存在或无权访问');
        }

        // 从该相册中随机获取一张图片
        $image = $user->images()
            ->where('album_id', $albumId)
            ->inRandomOrder()
            ->first();

        if (!$image) {
            return $this->fail('该相册下没有找到图片');
        }

        return $this->formatImageResponse($image, $format);
    }

    /**
     * 批量随机获取图片
     * 支持参数：
     * - count: 获取数量，默认5，最大20
     * - strategy_id: 限制存储策略
     * - album_id: 限制相册
     * - type: 限制文件类型
     */
    public function batch(Request $request): Response
    {
        $count = min((int)$request->query('count', 5), 20); // 最多20张
        $strategyId = $request->query('strategy_id');
        $albumId = $request->query('album_id');
        $type = $request->query('type');

        /** @var User $user */
        $user = Auth::user();

        $query = $user->images();

        // 添加筛选条件
        if ($strategyId) {
            $strategy = Strategy::find($strategyId);
            if (!$strategy) {
                return $this->fail('存储策略不存在');
            }
            $query->where('strategy_id', $strategyId);
        }

        if ($albumId) {
            $album = $user->albums()->find($albumId);
            if (!$album) {
                return $this->fail('相册不存在或无权访问');
            }
            $query->where('album_id', $albumId);
        }

        if ($type) {
            $query->where('extension', strtolower($type));
        }

        // 随机获取指定数量的图片
        $images = $query->inRandomOrder()->limit($count)->get();

        if ($images->isEmpty()) {
            return $this->fail('没有找到符合条件的图片');
        }

        // 格式化返回数据
        $images->each(function (Image $image) {
            $image->human_date = $image->created_at->diffForHumans();
            $image->date = $image->created_at->format('Y-m-d H:i:s');
            $image->append(['pathname', 'links'])->setVisible([
                'album', 'key', 'name', 'pathname', 'origin_name', 'size', 'mimetype', 'extension', 'md5', 'sha1',
                'width', 'height', 'links', 'human_date', 'date',
            ]);
        });

        return $this->success('获取成功', [
            'count' => $images->count(),
            'images' => $images
        ]);
    }

    /**
     * 格式化图片响应
     */
    private function formatImageResponse(Image $image, string $format): Response
    {
        switch ($format) {
            case 'url':
                // 返回图片URL
                return response($image->url, 200, [
                    'Content-Type' => 'text/plain',
                ]);
                
            case 'raw':
                // 直接返回图片内容
                try {
                    $contents = $image->filesystem()->read($image->pathname);
                    return response($contents, 200, [
                        'Content-Type' => $image->mimetype,
                        'Content-Length' => strlen($contents),
                        'Cache-Control' => 'public, max-age=3600',
                        'Content-Disposition' => 'inline; filename="' . $image->origin_name . '"',
                    ]);
                } catch (\Exception $e) {
                    return $this->fail('读取文件失败');
                }
                
            default:
                // 返回JSON格式的图片信息
                $image->human_date = $image->created_at->diffForHumans();
                $image->date = $image->created_at->format('Y-m-d H:i:s');
                $image->append(['pathname', 'links'])->setVisible([
                    'album', 'key', 'name', 'pathname', 'origin_name', 'size', 'mimetype', 'extension', 'md5', 'sha1',
                    'width', 'height', 'links', 'human_date', 'date',
                ]);

                return $this->success('获取成功', $image);
        }
    }
}
```

---

## 2. 配置路由

为 `routes/api.php` 新增路由：

```php
<?php

use App\Http\Controllers\Api\V1\RandomImageController;//20250801 by Tim
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\ImageController;
use App\Http\Controllers\Api\V1\AlbumController;
use App\Http\Controllers\Api\V1\TokenController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\StrategyController;
use App\Http\Middleware\CheckIsEnableApi;

Route::group([
    'prefix' => 'v1',
    'middleware' => CheckIsEnableApi::class,
], function () {
    Route::get('strategies', [StrategyController::class, 'index']);
    Route::post('upload', [ImageController::class, 'upload']);
    Route::post('tokens', [TokenController::class, 'store'])->middleware('throttle:3,1');

    Route::group([
        'middleware' => 'auth:sanctum',
    ], function () {
        Route::get('images', [ImageController::class, 'images']);
        Route::delete('images/{key}', [ImageController::class, 'destroy']);
        Route::get('albums', [AlbumController::class, 'index']);
        Route::delete('albums/{id}', [AlbumController::class, 'destroy']);
        Route::delete('tokens', [TokenController::class, 'clear']);
        Route::get('profile', [UserController::class, 'index']);

        //20250801 by Tim 新增：随机图片相关路由
        Route::get('random-image', [RandomImageController::class, 'random']);
        Route::get('strategies/{strategy_id}/random-image', [RandomImageController::class, 'byStrategy']);
        Route::get('albums/{album_id}/random-image', [RandomImageController::class, 'byAlbum']);
        Route::get('random-images/batch', [RandomImageController::class, 'batch']);
    });
});
```

---

## 3. 使用示例

### 随机获取图片

```bash
# 获取任意图片
curl -H "Authorization: Bearer your_token" \
     "https://im.tiwat.cn/api/v1/random-image"

# 获取 PNG 图片
curl -H "Authorization: Bearer your_token" \
     "https://im.tiwat.cn/api/v1/random-image?type=png"
```

### 不同返回格式

```bash
# 返回图片URL
curl -H "Authorization: Bearer your_token" \
     "https://im.tiwat.cn/api/v1/random-image?format=url"

# 下载原图文件
curl -H "Authorization: Bearer your_token" \
     "https://im.tiwat.cn/api/v1/random-image?format=raw"
```

### 条件与批量获取

```bash
# 批量获取 5 张 JPG
curl -H "Authorization: Bearer your_token" \
     "https://im.tiwat.cn/api/v1/random-images/batch?count=5&type=jpg"

# 从指定策略
curl -H "Authorization: Bearer your_token" \
     "https://im.tiwat.cn/api/v1/strategies/1/random-image"

# 从相册获取
curl -H "Authorization: Bearer your_token" \
     "https://im.tiwat.cn/api/v1/albums/3/random-image?format=url"
```

---

## 4.随机图接口

| 功能    | 接口地址                                                |
| ----- | --------------------------------------------------- |
| 基础随机图 | `GET /api/v1/random-image`                          |
| 按策略获取 | `GET /api/v1/strategies/{strategy_id}/random-image` |
| 按相册获取 | `GET /api/v1/albums/{album_id}/random-image`        |
| 批量获取  | `GET /api/v1/random-images/batch`                   |

---

实现兰空图床的随机图功能，我们就可以直接更换博客的首页图链接了...吗？  

如果直接简单的更换，我们的兰空图床Token是会**直接暴露在前端的**，这非常危险  

为此，我们需要利用 EdgeOne Functions 做一个302中转

---

## 5.在博客路径 `/edge-functions/api/` 新建函数：

`random.js`

```js
export async function onRequest(context) {
	const { request, env } = context;
	
	// Only allow GET requests
	if (request.method !== "GET") {
		return new Response("Method Not Allowed", { status: 405 });
	}

	const API_TOKEN = env.LSKY_TOKEN;

	const LSKY_API_URL =
		"此处填入随机接口";
	const FALLBACK_IMAGE =
		"此处填入默认图URL";

	const noCacheHeaders = {
		"Cache-Control": "no-store, no-cache, must-revalidate",
		Pragma: "no-cache",
		Expires: "0",
	};

	if (!API_TOKEN) {
		console.error("Missing LSKY_TOKEN environment variable");
		return Response.redirect(FALLBACK_IMAGE, 302, {
			headers: noCacheHeaders,
		});
	}

	try {
		const res = await fetch(`${LSKY_API_URL}?format=url`, {
			headers: {
				Authorization: `Bearer ${API_TOKEN}`,
				Accept: "application/json",
			},
		});

		if (!res.ok) {
			throw new Error(`API Error: ${res.status}`);
		}

		const targetUrl = (await res.text()).trim();

		if (!targetUrl.startsWith("http")) {
			throw new Error("Invalid URL received");
		}

		// Temporary redirect for random image (GET only)
		return Response.redirect(targetUrl, 302, {
			headers: noCacheHeaders,
		});
	} catch (error) {
		console.error("Fetch Random Image Failed:", error);
		return Response.redirect(FALLBACK_IMAGE, 302, {
			headers: noCacheHeaders,
		});
	}
}
```

---

在 EdgeOne Pages 项目中添加**环境变量**：

`LSKY_TOKEN=你的Token`

---

![](https://imoss.tiwat.cn/blog/2026/01/06/140837426.png_b)

---
访问 [https://tiwat.cn/api/random](https://tiwat.cn/api/random) 即可看到随机图片

接着将首页图片的链接替换为 **/api/random/** 就算大功告成啦！

*参考文章：[https://blog.timxs.com/archives/QIuISmYt](https://blog.timxs.com/archives/QIuISmYt)*
