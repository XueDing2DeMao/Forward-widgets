WidgetMetadata = {
  id: "forward.bilibili",
  title: "哔哩哔哩直播",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  description: "支持 Cookie 登录、分区浏览、搜索直播与直连流解析",
  author: "Forward",
  site: "https://github.com/InchStudio/ForwardWidgets",
  globalParams: [
    {
      name: "authMode",
      title: "鉴权模式",
      type: "enumeration",
      value: "auto",
      enumOptions: [
        {
          title: "自动识别",
          value: "auto",
        },
        {
          title: "Cookie",
          value: "cookie",
        },
        {
          title: "Bearer",
          value: "bearer",
        },
      ],
    },
    {
      name: "authToken",
      title: "Bilibili Cookie/Token",
      type: "input",
      placeholders: [
        {
          title: "完整 Cookie",
          value: "SESSDATA=xxx; bili_jct=xxx; DedeUserID=xxx;",
        },
        {
          title: "Bearer Token",
          value: "Bearer eyJ...",
        },
      ],
    },
  ],
  modules: [
    {
      id: "tokenLogin",
      title: "Cookie 登录",
      functionName: "tokenLogin",
      params: [
        {
          name: "token",
          title: "Cookie/Token",
          type: "input",
        },
        {
          name: "tokenMode",
          title: "模式",
          type: "enumeration",
          enumOptions: [
            {
              title: "自动识别",
              value: "auto",
            },
            {
              title: "Cookie",
              value: "cookie",
            },
            {
              title: "Bearer",
              value: "bearer",
            },
          ],
        },
      ],
    },
    {
      id: "tokenStatus",
      title: "登录状态",
      functionName: "tokenStatus",
      params: [],
    },
    {
      id: "clearToken",
      title: "清除鉴权",
      functionName: "clearToken",
      params: [],
    },
    {
      id: "listCategories",
      title: "分区列表",
      functionName: "listCategories",
      params: [
        {
          name: "keyword",
          title: "关键词",
          type: "input",
        },
        {
          name: "count",
          title: "数量",
          type: "input",
          value: "100",
        },
        {
          name: "page",
          title: "页码",
          type: "page",
        },
      ],
    },
    {
      id: "hotLives",
      title: "热门直播",
      functionName: "hotLives",
      params: [
        {
          name: "category",
          title: "分区ID/名称",
          type: "input",
          value: "0",
          placeholders: [
            {
              title: "全部分区",
              value: "0",
            },
            {
              title: "英雄联盟",
              value: "86",
            },
            {
              title: "网游",
              value: "2",
            },
            {
              title: "网游/英雄联盟",
              value: "2:86",
            },
          ],
        },
        {
          name: "sortType",
          title: "排序",
          type: "enumeration",
          value: "online",
          enumOptions: [
            {
              title: "人气",
              value: "online",
            },
            {
              title: "开播时间",
              value: "live_time",
            },
          ],
        },
        {
          name: "count",
          title: "数量",
          type: "input",
          value: "20",
        },
        {
          name: "page",
          title: "页码",
          type: "page",
        },
      ],
    },
    {
      id: "searchLives",
      title: "搜索直播",
      functionName: "searchLives",
      params: [
        {
          name: "keyword",
          title: "关键词",
          type: "input",
          placeholders: [
            {
              title: "主播/分区",
              value: "英雄联盟",
            },
          ],
        },
        {
          name: "count",
          title: "数量",
          type: "input",
          value: "20",
        },
        {
          name: "page",
          title: "页码",
          type: "page",
        },
      ],
    },
    {
      id: "openRoom",
      title: "打开直播间",
      functionName: "openRoom",
      params: [
        {
          name: "room",
          title: "房间号/URL",
          type: "input",
          placeholders: [
            {
              title: "房间号",
              value: "6",
            },
            {
              title: "完整链接",
              value: "https://live.bilibili.com/6",
            },
          ],
        },
      ],
    },
    {
      id: "resolveStream",
      title: "解析直播流(直连)",
      functionName: "resolveStream",
      params: [
        {
          name: "room",
          title: "房间号/URL",
          type: "input",
        },
        {
          name: "qn",
          title: "清晰度",
          type: "enumeration",
          value: "10000",
          enumOptions: [
            {
              title: "原画",
              value: "10000",
            },
            {
              title: "蓝光",
              value: "400",
            },
            {
              title: "超清",
              value: "250",
            },
          ],
        },
      ],
    },
  ],
};

const BILI_LIVE_ORIGIN = "https://live.bilibili.com";
const BILI_SEARCH_ORIGIN = "https://search.bilibili.com";
const BILI_AUTH_STORAGE_KEY = "forward.bilibili.auth";

const BILI_AREA_LIST_API = "https://api.live.bilibili.com/room/v1/Area/getList";
const BILI_ROOM_LIST_API = "https://api.live.bilibili.com/room/v3/area/getRoomList";
const BILI_ROOM_INIT_API = "https://api.live.bilibili.com/room/v1/Room/room_init";
const BILI_ROOM_PLAY_INFO_API = "https://api.live.bilibili.com/xlive/web-room/v2/index/getRoomPlayInfo";
const BILI_SEARCH_LIVE_API = "https://api.bilibili.com/x/web-interface/search/type";
const BILI_NAV_API = "https://api.bilibili.com/x/web-interface/nav";

const COMMON_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Referer: `${BILI_LIVE_ORIGIN}/`,
};

let areaCache = {
  time: 0,
  data: [],
};

async function tokenLogin(params = {}) {
  const auth = resolveAuth(params, {
    requireToken: true,
  });

  saveAuth({
    token: auth.token,
    mode: auth.mode,
    isLogin: false,
    mid: 0,
    uname: "",
    updatedAt: Date.now(),
  });

  const loginState = await checkLoginState(auth);
  if (loginState.isLogin) {
    saveAuth({
      token: auth.token,
      mode: auth.mode,
      isLogin: true,
      mid: loginState.mid,
      uname: loginState.uname,
      updatedAt: Date.now(),
    });
    return [
      createActionItem({
        title: `登录成功：${firstNonEmpty(loginState.uname, "已登录账号")}`,
        url: "https://www.bilibili.com/",
        description: `鉴权模式：${auth.mode} · UID：${loginState.mid || "-"}`,
      }),
    ];
  }

  return [
    createActionItem({
      title: "Cookie 已保存（当前未登录）",
      url: "https://www.bilibili.com/",
      description: `鉴权模式：${auth.mode} · 该 Cookie 可能已失效`,
    }),
  ];
}

async function tokenStatus(params = {}) {
  const auth = resolveAuth(params, {
    requireToken: true,
  });
  const loginState = await checkLoginState(auth);

  if (!loginState.isLogin) {
    throw new Error("当前 Cookie/Token 未登录，请重新执行「Cookie 登录」");
  }

  return [
    createActionItem({
      title: `当前已登录：${firstNonEmpty(loginState.uname, "B站用户")}`,
      url: "https://www.bilibili.com/",
      description: `UID：${loginState.mid || "-"}`,
    }),
  ];
}

async function clearToken() {
  clearStoredAuth();
  return [
    createActionItem({
      title: "已清除鉴权",
      url: "https://www.bilibili.com/",
      description: "本地保存的 Bilibili 鉴权信息已移除。",
    }),
  ];
}

async function listCategories(params = {}) {
  const keyword = String(firstNonEmpty(params.keyword, params.q)).trim().toLowerCase();
  const page = normalizePositiveInt(params.page, 1);
  const count = clamp(normalizePositiveInt(params.count, 100), 1, 300);

  const areas = await fetchAreas();
  const filtered = keyword
    ? areas.filter((item) => {
        return (
          String(item.parentAreaId).includes(keyword) ||
          String(item.areaId).includes(keyword) ||
          item.title.toLowerCase().includes(keyword) ||
          item.parentName.toLowerCase().includes(keyword) ||
          item.areaName.toLowerCase().includes(keyword)
        );
      })
    : areas;

  const start = (page - 1) * count;
  const pageItems = filtered.slice(start, start + count);
  if (!pageItems.length) {
    throw new Error(keyword ? `没有找到包含 "${keyword}" 的分区` : "没有可用分区数据");
  }

  return pageItems.map((item) => ({
    id: `area-${item.parentAreaId}-${item.areaId}`,
    type: "url",
    title: item.title,
    description:
      item.areaId > 0
        ? `父分区ID：${item.parentAreaId} · 子分区ID：${item.areaId}`
        : `父分区ID：${item.parentAreaId}`,
    genreTitle: "Bilibili 分区",
    link: item.url,
    videoUrl: item.url,
  }));
}

async function hotLives(params = {}) {
  const auth = resolveAuth(params);
  const page = normalizePositiveInt(params.page, 1);
  const count = clamp(normalizePositiveInt(params.count, 20), 1, 120);
  const sortType = normalizeSortType(params.sortType);
  const area = await resolveArea(params.category);

  const response = await Widget.http.get(BILI_ROOM_LIST_API, {
    params: {
      platform: "web",
      parent_area_id: String(area.parentAreaId),
      cate_id: String(area.areaId),
      area_id: String(area.areaId),
      page: String(page),
      page_size: String(Math.max(count, 20)),
      sort_type: sortType,
    },
    headers: mergeHeaders(auth),
  });

  const payload = parseJsonLike(response && response.data);
  ensureApiSuccess(payload, "获取热门直播失败");

  const rooms = (((payload || {}).data || {}).list || []);
  if (!Array.isArray(rooms)) {
    throw new Error("热门直播数据格式异常");
  }

  return rooms
    .slice(0, count)
    .map((item) => mapRoomListItem(item))
    .filter(Boolean);
}

async function searchLives(params = {}) {
  const auth = resolveAuth(params);
  const keyword = String(firstNonEmpty(params.keyword, params.q)).trim();
  if (!keyword) {
    throw new Error("请输入搜索关键词");
  }

  const page = normalizePositiveInt(params.page, 1);
  const count = clamp(normalizePositiveInt(params.count, 20), 1, 40);
  const response = await Widget.http.get(BILI_SEARCH_LIVE_API, {
    params: {
      search_type: "live_room",
      keyword: keyword,
      page: String(page),
    },
    headers: mergeHeaders(auth, {
      Referer: `${BILI_SEARCH_ORIGIN}/`,
    }),
  });

  const payload = parseJsonLike(response && response.data);
  ensureApiSuccess(payload, "搜索直播失败");

  const result = (((payload || {}).data || {}).result || []);
  if (!Array.isArray(result)) {
    throw new Error("搜索结果格式异常");
  }

  const items = result
    .slice(0, count)
    .map((item) => mapSearchItem(item))
    .filter(Boolean);

  if (!items.length) {
    throw new Error(`没有找到与 "${keyword}" 相关的直播`);
  }

  return items;
}

async function openRoom(params = {}) {
  const roomInput = firstNonEmpty(params.room, params.roomId, params.url);
  const roomUrl = normalizeRoomUrl(roomInput);
  const auth = resolveAuth(params);
  const roomId = extractRoomId(roomUrl);

  let streamInfo = null;
  try {
    streamInfo = await fetchRoomStreamInfo(roomId, auth, {
      qn: 10000,
    });
  } catch (error) {}

  const item = {
    id: roomUrl,
    type: "url",
    title: firstNonEmpty((streamInfo || {}).title, `打开直播间：${roomId}`),
    description:
      firstNonEmpty(
        (streamInfo || {}).description,
        "默认打开 Bilibili 网页直播间，如需直连请使用「解析直播流(直连)」。"
      ),
    posterPath: firstNonEmpty((streamInfo || {}).coverUrl),
    backdropPath: firstNonEmpty((streamInfo || {}).coverUrl),
    link: roomUrl,
    videoUrl: firstNonEmpty((streamInfo || {}).videoUrl, roomUrl),
  };

  if (streamInfo && Array.isArray(streamInfo.streams) && streamInfo.streams.length > 1) {
    item.childItems = streamInfo.streams.slice(0, 3).map((stream, index) => ({
      id: `${stream.url}#${index}`,
      type: "url",
      title: `直连流 ${stream.qualityText}`,
      description: `${stream.protocolName} · ${stream.formatName} · ${stream.codecName}`,
      link: roomUrl,
      videoUrl: stream.url,
    }));
  }

  return [item];
}

async function resolveStream(params = {}) {
  const roomInput = firstNonEmpty(params.room, params.roomId, params.url);
  const roomUrl = normalizeRoomUrl(roomInput);
  const roomId = extractRoomId(roomUrl);
  const qn = clamp(normalizePositiveInt(params.qn, 10000), 1, 10000);
  const auth = resolveAuth(params);

  const streamInfo = await fetchRoomStreamInfo(roomId, auth, {
    qn: qn,
  });
  if (!streamInfo.videoUrl) {
    throw new Error("未解析到可播放流，可能未开播或受权限限制");
  }

  const item = {
    id: streamInfo.videoUrl,
    type: "url",
    title: `${streamInfo.title}（直连）`,
    description: streamInfo.description,
    posterPath: streamInfo.coverUrl,
    backdropPath: streamInfo.coverUrl,
    link: streamInfo.roomUrl,
    videoUrl: streamInfo.videoUrl,
  };

  if (streamInfo.streams.length > 1) {
    item.childItems = streamInfo.streams.slice(0, 5).map((stream, index) => ({
      id: `${stream.url}#${index}`,
      type: "url",
      title: `${stream.qualityText}（${stream.formatName}）`,
      description: `${stream.protocolName} · ${stream.codecName}`,
      link: streamInfo.roomUrl,
      videoUrl: stream.url,
    }));
  }

  return [item];
}

function resolveAuth(params = {}, options = {}) {
  const stored = getStoredAuth();
  const token = String(firstNonEmpty(params.token, params.authToken, stored.token)).trim();
  const requestedMode = String(firstNonEmpty(params.tokenMode, params.authMode, stored.mode, "auto")).trim().toLowerCase();
  const mode = normalizeAuthMode(requestedMode);

  if (options.requireToken && !token) {
    throw new Error("请先输入 Cookie/Token，或先执行一次「Cookie 登录」保存鉴权");
  }

  return {
    token: token,
    mode: mode,
  };
}

function normalizeAuthMode(mode) {
  if (mode === "cookie" || mode === "bearer" || mode === "auto") {
    return mode;
  }
  return "auto";
}

function mergeHeaders(auth, custom) {
  return Object.assign({}, COMMON_HEADERS, buildAuthHeaders(auth), custom || {});
}

function buildAuthHeaders(auth) {
  const token = String((auth || {}).token || "").trim();
  if (!token) {
    return {};
  }

  const mode = normalizeAuthMode((auth || {}).mode);
  const cookieValue = extractCookieToken(token);
  const bearerValue = extractBearerToken(token);
  const headers = {};

  if (mode === "cookie") {
    if (cookieValue) {
      headers.Cookie = cookieValue;
      return headers;
    }
    if (bearerValue) {
      headers.Authorization = bearerValue;
      return headers;
    }
    return headers;
  }

  if (mode === "bearer") {
    if (bearerValue) {
      headers.Authorization = bearerValue;
    }
    if (cookieValue) {
      headers.Cookie = cookieValue;
    }
    return headers;
  }

  if (cookieValue) {
    headers.Cookie = cookieValue;
  }
  if (bearerValue) {
    headers.Authorization = bearerValue;
  }
  return headers;
}

function extractCookieToken(token) {
  const text = String(token || "").trim();
  if (!text) {
    return "";
  }
  if (/^cookie:\s*/i.test(text)) {
    return text.replace(/^cookie:\s*/i, "").trim();
  }
  if (looksLikeCookie(text)) {
    return text;
  }
  return "";
}

function extractBearerToken(token) {
  const text = String(token || "").trim();
  if (!text) {
    return "";
  }
  if (/^bearer\s+/i.test(text)) {
    return text;
  }
  if (looksLikeCookie(text)) {
    return "";
  }
  return `Bearer ${text}`;
}

function looksLikeCookie(token) {
  const text = String(token || "").trim();
  if (!text || /^bearer\s+/i.test(text)) {
    return false;
  }
  if (/(^|;\s*)(SESSDATA|bili_jct|DedeUserID|buvid3)=/i.test(text)) {
    return true;
  }
  return /(^|;\s*)[a-zA-Z0-9_]+=[^;]+/.test(text);
}

function getStoredAuth() {
  try {
    const value = Widget.storage.get(BILI_AUTH_STORAGE_KEY);
    return value && typeof value === "object" ? value : {};
  } catch (error) {
    return {};
  }
}

function saveAuth(auth) {
  try {
    Widget.storage.set(BILI_AUTH_STORAGE_KEY, auth || {});
  } catch (error) {}
}

function clearStoredAuth() {
  try {
    Widget.storage.set(BILI_AUTH_STORAGE_KEY, {});
  } catch (error) {}
}

async function checkLoginState(auth) {
  const response = await Widget.http.get(BILI_NAV_API, {
    headers: mergeHeaders(auth, {
      Referer: "https://www.bilibili.com/",
    }),
  });
  const payload = parseJsonLike(response && response.data);

  if (Number(payload.code) === 0) {
    return {
      isLogin: Boolean((payload.data || {}).isLogin),
      mid: (payload.data || {}).mid || 0,
      uname: firstNonEmpty((payload.data || {}).uname),
    };
  }

  if (Number(payload.code) === -101) {
    return {
      isLogin: false,
      mid: 0,
      uname: "",
    };
  }

  return {
    isLogin: Boolean(((payload || {}).data || {}).isLogin),
    mid: (((payload || {}).data || {}).mid || 0),
    uname: firstNonEmpty((((payload || {}).data || {}).uname)),
  };
}

async function fetchAreas(forceRefresh) {
  const now = Date.now();
  if (!forceRefresh && areaCache.data.length && now - areaCache.time < 10 * 60 * 1000) {
    return areaCache.data;
  }

  const response = await Widget.http.get(BILI_AREA_LIST_API, {
    headers: mergeHeaders(resolveAuth({})),
  });

  const payload = parseJsonLike(response && response.data);
  ensureApiSuccess(payload, "获取分区列表失败");
  const parents = (payload || {}).data || [];
  if (!Array.isArray(parents)) {
    throw new Error("分区列表数据格式异常");
  }

  const flat = [];
  for (const parent of parents) {
    const parentId = toNumber(parent.id);
    const parentName = firstNonEmpty(parent.name);
    if (!parentId || !parentName) {
      continue;
    }

    flat.push({
      parentAreaId: parentId,
      areaId: 0,
      parentName: parentName,
      areaName: "",
      title: parentName,
      url: `${BILI_LIVE_ORIGIN}/p/eden/area-tags?parentAreaId=${parentId}&areaId=0`,
    });

    const children = parent.list || [];
    for (const child of children) {
      const areaId = toNumber(child.id);
      const areaName = firstNonEmpty(child.name);
      if (!areaId || !areaName) {
        continue;
      }

      flat.push({
        parentAreaId: parentId,
        areaId: areaId,
        parentName: parentName,
        areaName: areaName,
        title: `${parentName} / ${areaName}`,
        url: `${BILI_LIVE_ORIGIN}/p/eden/area-tags?parentAreaId=${parentId}&areaId=${areaId}`,
      });
    }
  }

  areaCache = {
    time: now,
    data: flat,
  };

  return flat;
}

async function resolveArea(input) {
  const raw = String(input || "0").trim();
  if (!raw || raw === "0" || raw.toLowerCase() === "all" || raw === "全部") {
    return {
      parentAreaId: 0,
      areaId: 0,
    };
  }

  const pair = parseAreaPair(raw);
  if (pair) {
    return pair;
  }

  const areas = await fetchAreas();
  if (/^\d+$/.test(raw)) {
    const numeric = toNumber(raw);
    let found = areas.find((item) => item.areaId === numeric);
    if (found) {
      return {
        parentAreaId: found.parentAreaId,
        areaId: found.areaId,
      };
    }

    found = areas.find((item) => item.areaId === 0 && item.parentAreaId === numeric);
    if (found) {
      return {
        parentAreaId: found.parentAreaId,
        areaId: 0,
      };
    }
  }

  const keyword = raw.toLowerCase();
  let found = areas.find((item) => item.title.toLowerCase() === keyword);
  if (!found) {
    found = areas.find((item) => item.title.toLowerCase().includes(keyword));
  }
  if (!found) {
    found = areas.find((item) => item.areaName.toLowerCase() === keyword || item.parentName.toLowerCase() === keyword);
  }

  if (!found) {
    throw new Error(`未找到分区 "${raw}"，请先运行「分区列表」查询分区ID`);
  }

  return {
    parentAreaId: found.parentAreaId,
    areaId: found.areaId,
  };
}

function parseAreaPair(raw) {
  const matched = String(raw || "").match(/^(\d+)\s*[:/_-]\s*(\d+)$/);
  if (!matched) {
    return null;
  }
  return {
    parentAreaId: toNumber(matched[1]),
    areaId: toNumber(matched[2]),
  };
}

function normalizeSortType(value) {
  const text = String(firstNonEmpty(value, "online")).trim().toLowerCase();
  if (text === "live_time") {
    return "live_time";
  }
  return "online";
}

function mapRoomListItem(item) {
  const roomId = toNumber(firstNonEmpty(item.roomid, item.room_id, item.id));
  if (!roomId) {
    return null;
  }

  const roomUrl = `${BILI_LIVE_ORIGIN}/${roomId}`;
  const cover = normalizeImageUrl(firstNonEmpty(item.cover, item.user_cover, item.system_cover, item.show_cover));
  const title = sanitizeText(firstNonEmpty(item.title, "Bilibili 直播间"));
  const uname = sanitizeText(firstNonEmpty(item.uname, "B站主播"));
  const areaName = sanitizeText(firstNonEmpty(item.area_v2_name, item.area_name, ""));
  const online = toNumber(firstNonEmpty(item.online, 0));

  const desc = [uname];
  if (areaName) {
    desc.push(areaName);
  }
  if (online > 0) {
    desc.push(`人气 ${formatCount(online)}`);
  }

  return {
    id: roomUrl,
    type: "url",
    title: title,
    description: desc.join(" · "),
    posterPath: cover,
    backdropPath: cover,
    genreTitle: areaName,
    link: roomUrl,
    videoUrl: roomUrl,
  };
}

function mapSearchItem(item) {
  const roomId = toNumber(firstNonEmpty(item.roomid, item.id, item.short_id));
  if (!roomId) {
    return null;
  }

  const roomUrl = `${BILI_LIVE_ORIGIN}/${roomId}`;
  const title = sanitizeText(firstNonEmpty(item.title, "Bilibili 直播间"));
  const uname = sanitizeText(firstNonEmpty(item.uname, "B站主播"));
  const cateName = sanitizeText(firstNonEmpty(item.cate_name, ""));
  const online = toNumber(firstNonEmpty(item.online, 0));
  const liveStatus = toNumber(firstNonEmpty(item.live_status, 0));
  const cover = normalizeImageUrl(firstNonEmpty(item.user_cover, item.cover, item.pic));

  const desc = [uname];
  if (cateName) {
    desc.push(cateName);
  }
  desc.push(liveStatus === 1 ? "直播中" : "未开播");
  if (online > 0) {
    desc.push(`人气 ${formatCount(online)}`);
  }

  return {
    id: roomUrl,
    type: "url",
    title: title,
    description: desc.join(" · "),
    posterPath: cover,
    backdropPath: cover,
    genreTitle: cateName,
    link: roomUrl,
    videoUrl: roomUrl,
  };
}

async function fetchRoomStreamInfo(roomId, auth, options = {}) {
  const resolvedRoomId = await resolveRealRoomId(roomId, auth);
  const playInfo = await fetchPlayInfo(resolvedRoomId, auth, options);
  const streams = buildStreamCandidates(playInfo, options.qn);
  if (!streams.length) {
    throw new Error("未解析到可播放流");
  }

  const main = streams[0];
  const liveStatus = toNumber(firstNonEmpty((playInfo || {}).live_status, 0));

  return {
    roomId: resolvedRoomId,
    roomUrl: `${BILI_LIVE_ORIGIN}/${resolvedRoomId}`,
    title: `Bilibili 直播间 ${resolvedRoomId}`,
    description: `${liveStatus === 1 ? "直播中" : "未开播"} · ${main.qualityText}`,
    coverUrl: "",
    videoUrl: main.url,
    streams: streams,
  };
}

async function resolveRealRoomId(roomId, auth) {
  const response = await Widget.http.get(BILI_ROOM_INIT_API, {
    params: {
      id: String(roomId),
    },
    headers: mergeHeaders(auth),
  });

  const payload = parseJsonLike(response && response.data);
  ensureApiSuccess(payload, "解析直播间失败");
  const info = (payload || {}).data || {};
  const resolved = toNumber(firstNonEmpty(info.room_id, info.short_id, roomId));
  if (!resolved) {
    throw new Error("直播间不存在或已关闭");
  }
  return resolved;
}

async function fetchPlayInfo(roomId, auth, options = {}) {
  const qn = clamp(normalizePositiveInt(options.qn, 10000), 1, 10000);
  const response = await Widget.http.get(BILI_ROOM_PLAY_INFO_API, {
    params: {
      room_id: String(roomId),
      protocol: "0,1",
      format: "0,1,2",
      codec: "0,1",
      qn: String(qn),
      platform: "web",
      ptype: "8",
    },
    headers: mergeHeaders(auth, {
      Referer: `${BILI_LIVE_ORIGIN}/${roomId}`,
    }),
  });

  const payload = parseJsonLike(response && response.data);
  ensureApiSuccess(payload, "获取直播流失败");
  return (payload || {}).data || {};
}

function buildStreamCandidates(playInfo, preferQn) {
  const playurl = (((playInfo || {}).playurl_info || {}).playurl || {});
  const streams = playurl.stream || [];
  const items = [];

  for (const stream of streams) {
    const formats = stream.format || [];
    for (const format of formats) {
      const codecs = format.codec || [];
      for (const codec of codecs) {
        const infos = codec.url_info || [];
        for (const info of infos) {
          const host = String(info.host || "").trim();
          const baseUrl = String(codec.base_url || "").trim();
          const extra = String(info.extra || "").trim();
          const fullUrl = normalizePlayableUrl(`${host}${baseUrl}${extra}`);
          if (!fullUrl) {
            continue;
          }

          const qn = toNumber(firstNonEmpty(codec.current_qn, codec.qn, 0));
          items.push({
            url: fullUrl,
            qn: qn,
            qualityText: qualityName(qn),
            protocolName: firstNonEmpty(stream.protocol_name, ""),
            formatName: firstNonEmpty(format.format_name, ""),
            codecName: firstNonEmpty(codec.codec_name, ""),
          });
        }
      }
    }
  }

  const deduped = dedupeByUrl(items);
  const sorted = deduped.sort((a, b) => {
    const prefer = toNumber(preferQn);
    if (prefer > 0) {
      const ad = Math.abs((a.qn || 0) - prefer);
      const bd = Math.abs((b.qn || 0) - prefer);
      if (ad !== bd) {
        return ad - bd;
      }
    }
    return (b.qn || 0) - (a.qn || 0);
  });
  return sorted;
}

function normalizeRoomUrl(input) {
  const raw = String(input || "").trim();
  if (!raw) {
    throw new Error("请输入房间号或直播间链接");
  }

  if (/^\d+$/.test(raw)) {
    return `${BILI_LIVE_ORIGIN}/${raw}`;
  }

  const normalized = normalizeBiliLiveUrl(raw);
  if (!normalized) {
    throw new Error("直播间链接无效，请输入房间号或 live.bilibili.com 链接");
  }
  return normalized;
}

function normalizeBiliLiveUrl(url) {
  const text = String(url || "").trim();
  if (!text) {
    return "";
  }

  let full = text;
  if (!/^https?:\/\//i.test(full) && /(^|\.)live\.bilibili\.com/i.test(full)) {
    full = `https://${full}`;
  }

  const matched = full.match(/^https?:\/\/([^\/?#]+)(\/[^?#]*)?/i);
  if (!matched) {
    return "";
  }

  const host = String(matched[1] || "").toLowerCase();
  if (host !== "live.bilibili.com") {
    return "";
  }

  const path = String(matched[2] || "").replace(/\/+/g, "/");
  const roomId = extractRoomId(path);
  if (!roomId) {
    return "";
  }

  return `${BILI_LIVE_ORIGIN}/${roomId}`;
}

function extractRoomId(input) {
  const text = String(input || "").trim();
  if (!text) {
    return 0;
  }

  const direct = text.match(/^(\d+)$/);
  if (direct) {
    return toNumber(direct[1]);
  }

  const matched = text.match(/(?:^|\/)(\d+)(?:[/?#]|$)/);
  if (matched) {
    return toNumber(matched[1]);
  }

  return 0;
}

function normalizeImageUrl(url) {
  const text = String(url || "").trim();
  if (!text) {
    return "";
  }
  if (text.startsWith("//")) {
    return `https:${text}`;
  }
  if (/^https?:\/\//i.test(text)) {
    return text.replace(/^http:\/\//i, "https://");
  }
  return "";
}

function normalizePlayableUrl(url) {
  const text = String(url || "").trim();
  if (!text) {
    return "";
  }
  if (text.startsWith("//")) {
    return `https:${text}`;
  }
  if (/^https?:\/\//i.test(text)) {
    return text.replace(/^http:\/\//i, "https://");
  }
  return "";
}

function createActionItem(input) {
  return {
    id: input.url,
    type: "url",
    title: input.title,
    description: input.description,
    link: input.url,
    videoUrl: input.url,
  };
}

function parseJsonLike(payload) {
  if (payload === undefined || payload === null) {
    return {};
  }
  if (typeof payload === "object") {
    return payload;
  }

  const text = String(payload).trim();
  if (!text) {
    return {};
  }
  if (text.startsWith("<")) {
    throw new Error("请求被风控拦截，请稍后重试或切换网络");
  }
  return safeJsonParse(text);
}

function ensureApiSuccess(payload, fallbackMessage) {
  if (!payload || typeof payload !== "object") {
    throw new Error(firstNonEmpty(fallbackMessage, "接口返回异常"));
  }

  const code = toNumber(firstNonEmpty(payload.code, 0));
  if (code === 0) {
    return;
  }

  throw new Error(firstNonEmpty(payload.message, payload.msg, fallbackMessage, `接口错误 code=${code}`));
}

function dedupeByUrl(items) {
  const seen = new Set();
  const result = [];
  for (const item of items || []) {
    if (!item || !item.url || seen.has(item.url)) {
      continue;
    }
    seen.add(item.url);
    result.push(item);
  }
  return result;
}

function qualityName(qn) {
  const value = toNumber(qn);
  if (value >= 10000) {
    return "原画";
  }
  if (value >= 400) {
    return "蓝光";
  }
  if (value >= 250) {
    return "超清";
  }
  if (value > 0) {
    return `清晰度 ${value}`;
  }
  return "默认";
}

function sanitizeText(text) {
  return decodeHtmlEntities(stripHtmlTags(String(text || "")))
    .replace(/\s+/g, " ")
    .trim();
}

function stripHtmlTags(text) {
  return String(text || "").replace(/<[^>]+>/g, " ");
}

function decodeHtmlEntities(text) {
  return String(text || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x2F;/g, "/");
}

function safeJsonParse(text) {
  try {
    return JSON.parse(String(text || ""));
  } catch (error) {
    throw new Error("JSON 解析失败");
  }
}

function normalizePositiveInt(value, defaultValue) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) {
    return defaultValue;
  }
  return Math.floor(n);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatCount(value) {
  const n = toNumber(value);
  if (n >= 100000000) {
    return `${trimZero((n / 100000000).toFixed(1))}亿`;
  }
  if (n >= 10000) {
    return `${trimZero((n / 10000).toFixed(1))}万`;
  }
  return String(n);
}

function trimZero(text) {
  return String(text).replace(/\.0$/, "");
}

function firstNonEmpty() {
  for (const value of arguments) {
    if (value === undefined || value === null) {
      continue;
    }
    const text = String(value).trim();
    if (text) {
      return text;
    }
  }
  return "";
}
