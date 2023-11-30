# 什么是 features

我们向外部一共一个功能模块, 但是在不同的场景开启的功能模块是不一样的

比如:

1. 在某场景下, 只需要只读操作
2. 在某场景下, 开启部分功能

## FeatureManager

所以提供专门管理功能模块的类, 用来控制功能模块的开启和关闭

## 使用

```ts
type TFeatures = {
  scrollToBottom?: boolean;
  dataDiff?: { needDiff: boolean; } | boolean;
  checkbox?: { title: string; subTitle: string };
  deleteAll?: { options: { title: string; message: string } };
  delete?: boolean;
  restore?: boolean;
  recycle?: boolean;
};

export const features: TFeatures = {
  scrollToBottom: true,
  dataDiff: { needDiff: true, },
  checkbox: { title: '全选', subTitle: '请选择需要提交的数据' },
  deleteAll: { options: { title: '全部删除', essage: '删除成功' } },
};
const featuresManager = new FeaturesManager<TFeatures>(features);

// const f1: string
const f1 = featuresManager.getFeature('deleteAll.options.message');
// const f2: {title: string, message: string}
const f2 = featuresManager.getFeature('deleteAll.options');

// const fh1: boolean
const fh1 = featuresManager.hasFeatures('deleteAll');
// const fh2: boolean
const fh2 = features.hasFeatures('deleteAll.options.message');
// {hasDeleteAllFeature: boolean, hasDeleteAllOptionsMessageFeature: boolean}
const f3 = features.hasFeatures(['deleteAll', 'deleteAll.options.message']);
```