import { camelCase, get, isObject, set, upperFirst } from 'lodash';
import { THasFeatureResult, ChainKeys, Key } from './types';

const hasFeature: (value: unknown) => boolean = (value) =>
	isObject(value) ? true : value === true;

export class FeaturesManager<TFeatures> {
	private features: TFeatures;

	constructor(defaultFeatures: TFeatures) {
		this.initFeatures(defaultFeatures);
	}

	protected initFeatures(features: TFeatures) {
		this.features = features;
	}

	public resetFeatures(features: TFeatures) {
		this.initFeatures(features);
	}

	public getFeature<K extends Key<TFeatures>>(
		path: K
	): ChainKeys<TFeatures>[K] {
		return get(this.features, path);
	}

	hasFeatures(key: Key<TFeatures>): boolean;
	hasFeatures(
		key: Key<TFeatures>[]
	): THasFeatureResult<keyof ChainKeys<TFeatures>>;
	hasFeatures(
		key: Key<TFeatures> | Key<TFeatures>[]
	): THasFeatureResult<keyof ChainKeys<TFeatures>> | boolean {
		if (!Array.isArray(key)) {
			return hasFeature(get(this.features, key)) as boolean;
		} else {
			const result = {} as THasFeatureResult<keyof ChainKeys<TFeatures>>;
			(key as Key<TFeatures>[]).forEach((item: string) =>
				set(
					result,
					`has${upperFirst(camelCase(item))}Feature`,
					hasFeature(get(this.features, item))
				)
			);

			return result;
		}
	}
}
