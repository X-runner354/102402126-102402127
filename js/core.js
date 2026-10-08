const TYPES = { LOST: 'lost', FOUND: 'found' };
const STATUS = { OPEN: 'open', RESOLVED: 'resolved' };
const CATEGORIES = ['证件', '电子产品', '文具', '衣物', '钥匙', '生活用品', '其他'];
const LOCATIONS = ['教学区', '图书馆', '食堂', '操场', '宿舍区', '其他'];

function generateId() {
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

function statusLabel(item) {
  if (item.status === STATUS.RESOLVED) {
    return item.type === TYPES.LOST ? '已找到' : '已归还';
  }
  return item.type === TYPES.LOST ? '寻物中' : '招领中';
}

function validateItem(input) {
  const errors = {};
  if (!input.type || (input.type !== TYPES.LOST && input.type !== TYPES.FOUND)) {
    errors.type = '类型必须是寻物或招领';
  }
  if (!input.itemName || !String(input.itemName).trim()) {
    errors.itemName = '物品名称不能为空';
  }
  if (!input.category || !String(input.category).trim()) {
    errors.category = '请选择物品类别';
  }
  if (!input.location || !String(input.location).trim()) {
    errors.location = '地点不能为空';
  }
  if (!input.contact || !String(input.contact).trim()) {
    errors.contact = '联系方式不能为空';
  }
  if (!input.publisher || !String(input.publisher).trim()) {
    errors.publisher = '发布者不能为空';
  }
  return { valid: Object.keys(errors).length === 0, errors: errors };
}

function createItem(input) {
  const result = validateItem(input);
  if (!result.valid) {
    throw new Error(JSON.stringify(result.errors));
  }
  return {
    id: generateId(),
    type: input.type,
    itemName: String(input.itemName).trim(),
    category: String(input.category).trim(),
    location: String(input.location).trim(),
    itemDate: input.itemDate ? String(input.itemDate).trim() : '',
    description: input.description ? String(input.description).trim() : '',
    contact: String(input.contact).trim(),
    publisher: String(input.publisher).trim(),
    status: STATUS.OPEN,
    createdAt: Date.now()
  };
}

function searchItems(items, keyword) {
  const kw = String(keyword || '').trim().toLowerCase();
  if (!kw) return items.slice();
  return items.filter(function (item) {
    return [item.itemName, item.category, item.location, item.description, item.publisher]
      .filter(Boolean)
      .some(function (field) { return String(field).toLowerCase().indexOf(kw) !== -1; });
  });
}

function filterItems(items, filters) {
  const f = filters || {};
  return items.filter(function (item) {
    if (f.type && item.type !== f.type) return false;
    if (f.category && item.category !== f.category) return false;
    if (f.location && item.location !== f.location) return false;
    if (f.status && item.status !== f.status) return false;
    return true;
  });
}

function getItemById(items, id) {
  return items.find(function (item) { return item.id === id; }) || null;
}

function updateStatus(items, id, newStatus) {
  return items.map(function (item) {
    if (item.id === id) {
      return Object.assign({}, item, { status: newStatus });
    }
    return item;
  });
}

function deleteItem(items, id) {
  return items.filter(function (item) { return item.id !== id; });
}

function sortItems(items, field, asc) {
  const sorted = items.slice();
  const key = field || 'createdAt';
  sorted.sort(function (a, b) {
    const va = a[key];
    const vb = b[key];
    if (va < vb) return asc ? -1 : 1;
    if (va > vb) return asc ? 1 : -1;
    return 0;
  });
  return sorted;
}

const LostFound = {
  TYPES: TYPES,
  STATUS: STATUS,
  CATEGORIES: CATEGORIES,
  LOCATIONS: LOCATIONS,
  generateId: generateId,
  statusLabel: statusLabel,
  validateItem: validateItem,
  createItem: createItem,
  searchItems: searchItems,
  filterItems: filterItems,
  getItemById: getItemById,
  updateStatus: updateStatus,
  deleteItem: deleteItem,
  sortItems: sortItems
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = LostFound;
}