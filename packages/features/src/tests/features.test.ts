import { FeaturesManager } from '../features';

/** AI 相关features */
export type TAIFeatures = {
	scrollToBottom?: boolean | undefined;
	dataDiff?:
		| {
				needDiff: boolean;
		  }
		| boolean;
	checkbox?: { title: string; subTitle: string };
	deleteItem?: undefined | boolean;
	restoreItem?: undefined | boolean;
	deleteAll?: {
		options: { title: string; message: string };
	};
	recycle?: undefined | boolean;
};

export const BuildSystemDefaultFeatures: TAIFeatures = {
	scrollToBottom: true,
	dataDiff: {
		/** 是否需要diff 出最新的数据 */
		needDiff: true,
		/** diff 所有变化 或者 diff 新item */
		type: '1'
	}
};
const features = new FeaturesManager<TAIFeatures>(BuildSystemDefaultFeatures);
const f1 = features.getFeature('deleteAll.options.message');
const f2 = features.getFeature('deleteAll.options');

const fh1 = features.hasFeatures('deleteAll');
const fh2 = features.hasFeatures('deleteAll.options.message');
const f3 = features.hasFeatures(['deleteAll', 'deleteAll.options.message']);

f3.hasDeleteAllFeature;
f3.hasDeleteAllOptionsMessageFeature;
