export type CamelCase<S extends string> = S extends `${infer F}.${infer R}`
	? R extends Capitalize<R>
		? `${Capitalize<F>}${CamelCase<R>}`
		: `${Capitalize<F>}${CamelCase<Capitalize<R>>}`
	: Capitalize<S>;
type ConvertKey<T extends string> = {
	[K in T as `has${CamelCase<K>}Feature`]?: boolean;
};
export type THasFeatureResult<T extends string> = ConvertKey<T>;
export type StringKeyof<T> = Exclude<keyof T, symbol>;
export type UnionToIntersection<U> = (
	U extends any ? (k: U) => void : never
) extends (k: infer I) => void
	? I
	: never;
export type CombineStringKey<
	H extends string | number,
	L extends string | number
> = H extends '' ? `${L}` : `${H}.${L}`;
export type ChainKeys<T, P extends string | number = ''> = UnionToIntersection<
	{
		[K in StringKeyof<T>]: Record<CombineStringKey<P, K>, T[K]> &
			(T[K] extends Record<any, any>
				? ChainKeys<T[K], CombineStringKey<P, K>>
				: {});
	}[StringKeyof<T>]
>;
export type Key<T> = keyof ChainKeys<T>;
