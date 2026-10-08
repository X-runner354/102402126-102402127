const LostFound = require('../js/core.js');

function validInput(overrides) {
  return Object.assign({
    type: 'lost',
    itemName: '校园卡',
    category: '证件',
    location: '图书馆',
    itemDate: '2026-10-08',
    description: '蓝色卡套',
    contact: '13800001111',
    publisher: '黄炜杰'
  }, overrides);
}

describe('validateItem 输入校验', () => {
  test('物品名称为空时应返回错误', () => {
    const r = LostFound.validateItem(validInput({ itemName: '   ' }));
    expect(r.valid).toBe(false);
    expect(r.errors.itemName).toBeDefined();
  });

  test('信息类型不是 lost/found 时应返回错误', () => {
    const r = LostFound.validateItem(validInput({ type: 'stolen' }));
    expect(r.valid).toBe(false);
    expect(r.errors.type).toBeDefined();
  });

  test('联系方式为空时应返回错误', () => {
    const r = LostFound.validateItem(validInput({ contact: '' }));
    expect(r.valid).toBe(false);
    expect(r.errors.contact).toBeDefined();
  });

  test('发布者名称为空时应返回错误', () => {
    const r = LostFound.validateItem(validInput({ publisher: '' }));
    expect(r.valid).toBe(false);
    expect(r.errors.publisher).toBeDefined();
  });

  test('所有必填字段齐全时应校验通过', () => {
    const r = LostFound.validateItem(validInput());
    expect(r.valid).toBe(true);
    expect(Object.keys(r.errors).length).toBe(0);
  });
});

describe('createItem 创建信息', () => {
  test('合法输入会生成唯一 id、初始状态 open 并记录创建时间', () => {
    const item = LostFound.createItem(validInput());
    expect(item.id).toBeTruthy();
    expect(item.status).toBe(LostFound.STATUS.OPEN);
    expect(typeof item.createdAt).toBe('number');
  });

  test('非法输入会抛出异常', () => {
    expect(function () {
      LostFound.createItem(validInput({ itemName: '' }));
    }).toThrow();
  });
});

describe('searchItems 关键词搜索', () => {
  const items = [
    LostFound.createItem(validInput({ itemName: '校园卡' })),
    LostFound.createItem(validInput({ itemName: 'AirPods', type: 'found', description: '白色耳机' })),
    LostFound.createItem(validInput({ itemName: '雨伞', location: '食堂' }))
  ];

  test('按物品名称搜索且不区分大小写', () => {
    const r = LostFound.searchItems(items, 'airpods');
    expect(r.length).toBe(1);
    expect(r[0].itemName).toBe('AirPods');
  });

  test('空关键词返回全部结果', () => {
    expect(LostFound.searchItems(items, '').length).toBe(3);
    expect(LostFound.searchItems(items, '  ').length).toBe(3);
  });

  test('关键词命中描述或地点也应返回结果', () => {
    expect(LostFound.searchItems(items, '耳机').length).toBe(1);
    expect(LostFound.searchItems(items, '食堂').length).toBe(1);
  });

  test('没有匹配时返回空数组', () => {
    expect(LostFound.searchItems(items, '不存在的物品').length).toBe(0);
  });
});

describe('filterItems 条件筛选', () => {
  const items = [
    LostFound.createItem(validInput({ type: 'lost', category: '证件' })),
    LostFound.createItem(validInput({ type: 'found', category: '钥匙' }))
  ];

  test('按类型筛选只返回对应类型', () => {
    const r = LostFound.filterItems(items, { type: 'found' });
    expect(r.length).toBe(1);
    expect(r[0].type).toBe('found');
  });

  test('按类别筛选', () => {
    const r = LostFound.filterItems(items, { category: '证件' });
    expect(r.length).toBe(1);
    expect(r[0].category).toBe('证件');
  });

  test('组合条件筛选（类型 + 类别）', () => {
    const r = LostFound.filterItems(items, { type: 'found', category: '钥匙' });
    expect(r.length).toBe(1);
    const none = LostFound.filterItems(items, { type: 'found', category: '证件' });
    expect(none.length).toBe(0);
  });
});

describe('updateStatus / getItemById / deleteItem 状态维护', () => {
  const items = [
    LostFound.createItem(validInput({ itemName: 'A' })),
    LostFound.createItem(validInput({ itemName: 'B', type: 'found' }))
  ];

  test('更新目标条目状态且不修改原数组（不可变）', () => {
    const updated = LostFound.updateStatus(items, items[0].id, LostFound.STATUS.RESOLVED);
    expect(items[0].status).toBe(LostFound.STATUS.OPEN);
    expect(updated[0].status).toBe(LostFound.STATUS.RESOLVED);
    expect(updated[1].status).toBe(LostFound.STATUS.OPEN);
  });

  test('更新不存在的 id 时原样返回', () => {
    const updated = LostFound.updateStatus(items, 'not-exist', LostFound.STATUS.RESOLVED);
    expect(updated).toEqual(items);
  });

  test('getItemById 能找到并返回对象，找不到返回 null', () => {
    expect(LostFound.getItemById(items, items[1].id).itemName).toBe('B');
    expect(LostFound.getItemById(items, 'not-exist')).toBeNull();
  });

  test('deleteItem 删除指定条目', () => {
    const after = LostFound.deleteItem(items, items[0].id);
    expect(after.length).toBe(1);
    expect(after[0].itemName).toBe('B');
  });
});

describe('statusLabel 状态文案与 generateId 唯一性', () => {
  test('寻物已解决显示「已找到」，招领已解决显示「已归还」', () => {
    const lost = { type: 'lost', status: 'resolved' };
    const found = { type: 'found', status: 'resolved' };
    expect(LostFound.statusLabel(lost)).toBe('已找到');
    expect(LostFound.statusLabel(found)).toBe('已归还');
  });

  test('进行中的寻物/招领显示对应文案', () => {
    expect(LostFound.statusLabel({ type: 'lost', status: 'open' })).toBe('寻物中');
    expect(LostFound.statusLabel({ type: 'found', status: 'open' })).toBe('招领中');
  });

  test('generateId 生成不同的唯一 id', () => {
    const a = LostFound.generateId();
    const b = LostFound.generateId();
    expect(a).not.toBe(b);
  });
});