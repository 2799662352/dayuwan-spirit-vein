/**
 * 大余湾灵脉节点 Mock 数据
 * 坐标基于武汉市黄陂区大余湾古村落周边（≈30.87°N, 114.37°E）
 */
export interface SpiritNode {
  id: string
  name: string
  latitude: number
  longitude: number
  radius: number
  campStatus: number
}

export const spiritNodes: SpiritNode[] = [
  {
    id: 'node_001',
    name: '余氏宗祠·主脉',
    latitude: 30.8721,
    longitude: 114.3685,
    radius: 50,
    campStatus: 0,
  },
  {
    id: 'node_002',
    name: '风水古井·坎位',
    latitude: 30.8735,
    longitude: 114.3702,
    radius: 50,
    campStatus: 0,
  },
  {
    id: 'node_003',
    name: '石拱桥·离火阵眼',
    latitude: 30.8708,
    longitude: 114.3671,
    radius: 50,
    campStatus: 0,
  },
  {
    id: 'node_004',
    name: '百年银杏·震木灵根',
    latitude: 30.8743,
    longitude: 114.3658,
    radius: 50,
    campStatus: 0,
  },
  {
    id: 'node_005',
    name: '后山观星台',
    latitude: 30.8762,
    longitude: 114.3693,
    radius: 50,
    campStatus: 0,
  },
  {
    id: 'node_006',
    name: '溪涧洗剑池',
    latitude: 30.8697,
    longitude: 114.3718,
    radius: 50,
    campStatus: 0,
  },
  {
    id: 'node_007',
    name: '村口牌坊·兑金锁',
    latitude: 30.8715,
    longitude: 114.3645,
    radius: 50,
    campStatus: 0,
  },
  {
    id: 'node_008',
    name: '古樟灵台·巽风口',
    latitude: 30.8752,
    longitude: 114.3725,
    radius: 50,
    campStatus: 0,
  },
  {
    id: 'node_009',
    name: '青石板道·艮山脊',
    latitude: 30.8688,
    longitude: 114.3660,
    radius: 50,
    campStatus: 0,
  },
  {
    id: 'node_010',
    name: '荷塘月色·坤地泉',
    latitude: 30.8730,
    longitude: 114.3740,
    radius: 50,
    campStatus: 0,
  },
]
