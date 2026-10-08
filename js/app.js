(function () {
  var STORAGE_KEY = 'campus-lost-found-items';
  var USER_KEY = 'campus-lost-found-user';

  var state = {
    items: [],
    keyword: '',
    type: '',
    category: '',
    location: '',
    status: '',
    currentUser: localStorage.getItem(USER_KEY) || ''
  };

  function seedItems() {
    return [
      { type: 'lost', itemName: '校园卡', category: '证件', location: '图书馆', itemDate: '2026-10-07', description: '蓝色卡套，上面贴着一张熊猫贴纸，今天在图书馆三楼自习区遗失。', contact: '13800001111', publisher: '李同学', status: 'open' },
      { type: 'found', itemName: '黑色钥匙串', category: '钥匙', location: '食堂', itemDate: '2026-10-07', description: '一串黑色钥匙，带一个金属小挂件，在二食堂靠近门口处捡到。', contact: '13800002222', publisher: '王同学', status: 'open' },
      { type: 'lost', itemName: '蓝牙耳机', category: '电子产品', location: '操场', itemDate: '2026-10-06', description: '白色降噪耳机，右耳有划痕，放在操场看台忘记拿走。', contact: '13800003333', publisher: '张同学', status: 'open' },
      { type: 'found', itemName: '雨伞', category: '生活用品', location: '教学区', itemDate: '2026-10-06', description: '深蓝色长柄伞，在3号教学楼一楼教室捡到。', contact: '13800004444', publisher: '刘同学', status: 'open' },
      { type: 'found', itemName: '学生证', category: '证件', location: '宿舍区', itemDate: '2026-10-05', description: '在宿舍区楼下捡到，已联系失主并归还。', contact: '13800005555', publisher: '陈同学', status: 'resolved' },
      { type: 'lost', itemName: '水杯', category: '生活用品', location: '图书馆', itemDate: '2026-10-04', description: '保温杯，杯身有姓名贴，已经找回，感谢帮忙。', contact: '13800006666', publisher: '赵同学', status: 'resolved' }
    ].map(function (seed) {
      var item = LostFound.createItem(seed);
      item.itemDate = seed.itemDate;
      return item;
    });
  }

  function loadItems() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {}
    var seeds = seedItems();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeds));
    return seeds;
  }

  function saveItems() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function showToast(msg) {
    var toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.remove('hidden');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () {
      toast.classList.add('hidden');
    }, 2200);
  }

  function badgeFor(item) {
    var resolved = item.status === LostFound.STATUS.RESOLVED;
    var type = item.type;
    if (resolved) return '<span class="badge badge-resolved">' + LostFound.statusLabel(item) + '</span>';
    if (type === 'lost') return '<span class="badge badge-lost">寻物中</span>';
    return '<span class="badge badge-found">招领中</span>';
  }

  function cardHtml(item, manageMode) {
    var resolved = item.status === LostFound.STATUS.RESOLVED;
    var html = '';
    html += '<div class="item-card" data-id="' + item.id + '">';
    html += '  <div class="item-card-head">';
    html += '    <span class="item-card-title">' + escapeHtml(item.itemName) + '</span>';
    html += badgeFor(item);
    html += '  </div>';
    html += '  <div class="item-card-meta">';
    html += '    <span class="chip">' + escapeHtml(item.category) + '</span>';
    html += '    <span class="chip">📍 ' + escapeHtml(item.location) + '</span>';
    if (item.itemDate) html += '    <span class="chip">' + escapeHtml(item.itemDate) + '</span>';
    html += '  </div>';
    if (item.description) {
      html += '  <p class="item-card-desc">' + escapeHtml(item.description) + '</p>';
    }
    if (manageMode && !resolved) {
      html += '  <div class="detail-actions">';
      html += '    <button class="btn btn-sm btn-success" data-act="resolve" data-id="' + item.id + '">标记「' + (item.type === 'lost' ? '已找到' : '已归还') + '」</button>';
      html += '    <button class="btn btn-sm btn-danger" data-act="delete" data-id="' + item.id + '">删除</button>';
      html += '  </div>';
    }
    html += '</div>';
    return html;
  }

  function listHtml(items) {
    if (!items.length) return '';
    return items.map(function (item) { return cardHtml(item, false); }).join('');
  }

  function currentQuery() {
    var all = state.items;
    var filtered = LostFound.filterItems(all, {
      type: state.type,
      category: state.category,
      location: state.location,
      status: state.status
    });
    filtered = LostFound.searchItems(filtered, state.keyword);
    return LostFound.sortItems(filtered, 'createdAt', false);
  }

  function renderHome() {
    var list = currentQuery();
    document.getElementById('item-list').innerHTML = listHtml(list);
    document.getElementById('empty-state').classList.toggle('hidden', list.length > 0);
  }

  function fillSelects() {
    var cat = document.getElementById('filter-category');
    var loc = document.getElementById('filter-location');
    var fCat = document.getElementById('f-category');
    var fLoc = document.getElementById('f-location');

    LostFound.CATEGORIES.forEach(function (c) {
      cat.insertAdjacentHTML('beforeend', '<option value="' + escapeHtml(c) + '">' + escapeHtml(c) + '</option>');
      fCat.insertAdjacentHTML('beforeend', '<option value="' + escapeHtml(c) + '">' + escapeHtml(c) + '</option>');
    });
    LostFound.LOCATIONS.forEach(function (l) {
      loc.insertAdjacentHTML('beforeend', '<option value="' + escapeHtml(l) + '">' + escapeHtml(l) + '</option>');
      fLoc.insertAdjacentHTML('beforeend', '<option value="' + escapeHtml(l) + '">' + escapeHtml(l) + '</option>');
    });
  }

  function switchView(name) {
    document.getElementById('view-home').classList.toggle('hidden', name !== 'home');
    document.getElementById('view-publish').classList.toggle('hidden', name !== 'publish');
    document.getElementById('view-mine').classList.toggle('hidden', name !== 'mine');
    document.getElementById('view-detail').classList.toggle('hidden', name !== 'detail');

    document.querySelectorAll('.nav-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-nav') === (name === 'detail' ? 'home' : name));
    });
  }

  function renderDetail(id) {
    var item = LostFound.getItemById(state.items, id);
    var box = document.getElementById('detail-content');
    if (!item) {
      box.innerHTML = '<div class="panel"><p>未找到该信息，可能已被删除。</p></div>';
      switchView('detail');
      return;
    }
    var isOwner = state.currentUser && item.publisher === state.currentUser;
    var resolved = item.status === LostFound.STATUS.RESOLVED;

    var html = '';
    html += '<div class="detail-card">';
    html += '  <div class="detail-head">';
    html += '    <h2>' + escapeHtml(item.itemName) + '</h2>';
    html += '    <span class="detail-back" data-nav="home">← 返回列表</span>';
    html += '  </div>';
    html += '  <div class="detail-badges">' + badgeFor(item) + '</div>';

    html += '  <div class="detail-grid">';
    html += '    <div class="detail-field"><div class="k">信息类型</div><div class="v">' + (item.type === 'lost' ? '寻物' : '招领') + '</div></div>';
    html += '    <div class="detail-field"><div class="k">物品类别</div><div class="v">' + escapeHtml(item.category) + '</div></div>';
    html += '    <div class="detail-field"><div class="k">地点</div><div class="v">' + escapeHtml(item.location) + '</div></div>';
    html += '    <div class="detail-field"><div class="k">时间</div><div class="v">' + (item.itemDate ? escapeHtml(item.itemDate) : '未填写') + '</div></div>';
    html += '    <div class="detail-field"><div class="k">发布者</div><div class="v">' + escapeHtml(item.publisher) + '</div></div>';
    html += '    <div class="detail-field"><div class="k">状态</div><div class="v">' + LostFound.statusLabel(item) + '</div></div>';
    html += '  </div>';

    if (item.description) {
      html += '  <div class="detail-desc"><h4>详细描述</h4><p>' + escapeHtml(item.description) + '</p></div>';
    }

    html += '  <div class="contact-box">';
    html += '    <div class="contact-info"><span class="contact-label">发布者联系方式</span><span>' + escapeHtml(item.contact) + '</span></div>';
    html += '    <button class="btn btn-sm btn-outline" data-act="copy">一键复制</button>';
    html += '  </div>';

    if (isOwner && !resolved) {
      html += '  <div class="detail-actions">';
      html += '    <button class="btn btn-success" data-act="resolve" data-id="' + item.id + '">标记「' + (item.type === 'lost' ? '已找到' : '已归还') + '」</button>';
      html += '    <button class="btn btn-danger" data-act="delete" data-id="' + item.id + '">删除该信息</button>';
      html += '  </div>';
      html += '  <p class="resolve-hint">物品找回 / 归还后，点击按钮可将其标记为已解决，避免他人重复询问。</p>';
    } else if (!resolved) {
      html += '  <p class="resolve-hint">只有发布者本人才能在「我的发布」中标记已解决或删除该信息。</p>';
    }

    html += '</div>';

    box.innerHTML = html;
    var copyBtn = box.querySelector('[data-act="copy"]');
    if (copyBtn) copyBtn.setAttribute('data-contact', item.contact);
    switchView('detail');
    window.scrollTo(0, 0);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showToast('联系方式已复制到剪贴板');
      }).catch(function () {
        legacyCopy(text);
      });
    } else {
      legacyCopy(text);
    }
  }

  function legacyCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try {
      ok = document.execCommand('copy');
    } catch (e) {}
    document.body.removeChild(ta);
    showToast(ok ? '联系方式已复制到剪贴板' : '复制失败，请手动复制');
  }

  function handlePublish(e) {
    e.preventDefault();
    var form = document.getElementById('publish-form');
    var type = form.querySelector('input[name="type"]:checked').value;
    var input = {
      type: type,
      itemName: document.getElementById('f-itemName').value,
      category: document.getElementById('f-category').value,
      location: document.getElementById('f-location').value,
      itemDate: document.getElementById('f-itemDate').value,
      description: document.getElementById('f-description').value,
      contact: document.getElementById('f-contact').value,
      publisher: document.getElementById('f-publisher').value
    };

    var result = LostFound.validateItem(input);
    if (!result.valid) {
      var first = Object.keys(result.errors)[0];
      showToast(result.errors[first]);
      return;
    }

    var item = LostFound.createItem(input);
    state.items.unshift(item);
    saveItems();
    state.currentUser = item.publisher;
    localStorage.setItem(USER_KEY, item.publisher);

    form.reset();
    document.getElementById('f-publisher').value = item.publisher;
    showToast('发布成功！');
    state.keyword = '';
    state.type = '';
    state.category = '';
    state.location = '';
    state.status = '';
    syncFilterUI();
    renderHome();
    switchView('home');
  }

  function syncFilterUI() {
    document.getElementById('search-input').value = state.keyword;
    document.getElementById('filter-category').value = state.category;
    document.getElementById('filter-location').value = state.location;
    document.getElementById('filter-status').value = state.status;
    document.querySelectorAll('.type-tab').forEach(function (t) {
      t.classList.toggle('active', t.getAttribute('data-type') === state.type);
    });
  }

  function renderMine(publisher) {
    var items = state.items.filter(function (i) { return i.publisher === publisher; });
    items = LostFound.sortItems(items, 'createdAt', false);
    document.getElementById('mine-list').innerHTML = items.map(function (item) {
      return cardHtml(item, true);
    }).join('');
    document.getElementById('mine-empty').classList.toggle('hidden', items.length > 0);
  }

  function bindEvents() {
    document.querySelectorAll('.nav-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var name = btn.getAttribute('data-nav');
        if (name === 'mine') {
          renderMine(state.currentUser);
        }
        switchView(name);
      });
    });

    document.querySelector('.brand').addEventListener('click', function () {
      switchView('home');
    });

    document.getElementById('search-btn').addEventListener('click', function () {
      state.keyword = document.getElementById('search-input').value;
      renderHome();
    });
    document.getElementById('search-input').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        state.keyword = document.getElementById('search-input').value;
        renderHome();
      }
    });

    document.querySelectorAll('.type-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        document.querySelectorAll('.type-tab').forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        state.type = tab.getAttribute('data-type');
        renderHome();
      });
    });

    document.getElementById('filter-category').addEventListener('change', function (e) {
      state.category = e.target.value;
      renderHome();
    });
    document.getElementById('filter-location').addEventListener('change', function (e) {
      state.location = e.target.value;
      renderHome();
    });
    document.getElementById('filter-status').addEventListener('change', function (e) {
      state.status = e.target.value;
      renderHome();
    });

    document.getElementById('publish-form').addEventListener('submit', handlePublish);

    document.getElementById('mine-filter-btn').addEventListener('click', function () {
      var name = document.getElementById('mine-publisher').value.trim();
      if (!name) {
        showToast('请输入发布者姓名');
        return;
      }
      renderMine(name);
    });

    document.body.addEventListener('click', function (e) {
      var nav = e.target.closest('[data-nav]');
      if (nav && nav.getAttribute('data-nav') === 'home') {
        switchView('home');
        return;
      }

      var actionBtn = e.target.closest('[data-act]');
      if (actionBtn) {
        var act = actionBtn.getAttribute('data-act');
        if (act === 'copy') {
          copyText(actionBtn.getAttribute('data-contact') || '');
          return;
        }
        if (act === 'resolve') {
          var rid = actionBtn.getAttribute('data-id');
          state.items = LostFound.updateStatus(state.items, rid, LostFound.STATUS.RESOLVED);
          saveItems();
          showToast('已标记为「' + (LostFound.getItemById(state.items, rid).type === 'lost' ? '已找到' : '已归还') + '」');
          if (document.getElementById('view-detail').classList.contains('hidden')) {
            renderMine(state.currentUser);
          } else {
            renderDetail(rid);
          }
          return;
        }
        if (act === 'delete') {
          var did = actionBtn.getAttribute('data-id');
          state.items = LostFound.deleteItem(state.items, did);
          saveItems();
          showToast('信息已删除');
          if (document.getElementById('view-detail').classList.contains('hidden')) {
            renderMine(state.currentUser);
          } else {
            switchView('home');
            renderHome();
          }
          return;
        }
      }

      var card = e.target.closest('.item-card');
      if (card) {
        renderDetail(card.getAttribute('data-id'));
      }
    });
  }

  function init() {
    state.items = loadItems();
    var pub = document.getElementById('f-publisher');
    if (state.currentUser) pub.value = state.currentUser;
    fillSelects();
    bindEvents();

    var params = new URLSearchParams(location.search);
    var q = params.get('q');
    if (q) {
      state.keyword = q;
      document.getElementById('search-input').value = q;
    }
    renderHome();

    var route = location.hash.replace('#', '');
    if (route === 'publish') {
      switchView('publish');
    } else if (route === 'mine') {
      renderMine(state.currentUser || (state.items[0] ? state.items[0].publisher : ''));
      switchView('mine');
    } else if (route === 'detail') {
      if (state.items[0]) renderDetail(state.items[0].id);
      else switchView('home');
    } else {
      switchView('home');
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();