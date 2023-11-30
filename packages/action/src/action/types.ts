/** 按钮Action事件 */
export interface IAction {
	event: string;
	params: Record<string, unknown>;
}

/** Action 的类型 */
export enum EActionType {
	/** 串行 */
	serial = 'serial',
	/** 并行 */
	parallel = 'parallel'
}

/** 注解元数据信息 */
export type TActionDecoratorValue = {
	/** 当前事件 */
	event: string;
	/** Action 同步, 异步 */
	type: EActionType;
	/** 当前实例 */
	target: NonNullable<unknown> | undefined;
	/** 描述信息 */
	descriptor: PropertyDescriptor;
};

/** 同步 Action 的回调 */
export type TActionCallback = (
	action: IAction,
	params?: IBaseSendParams,
	extraParams?: IBaseSendExtraParams
) => {
	action: IAction;
	params?: IBaseSendParams;
	extraParams?: IBaseSendExtraParams;
};

export interface IBaseSendParams {
	[key: string]: unknown;
}

export interface IBaseSendExtraParams {
	[key: string]: unknown;
}

/** 处理事件参数 */
export type TSendParams = {
	[key: string]: unknown;
};

/** Action 中额外参数 */
export type TSendExtraParams = {
	[key: string]: unknown;
};

export type TClassMetadata = {
	namespace?: string;
};

export type TActionParameters = {
	propKey: string;
	event: string;
	target: NonNullable<unknown>;
	type: EActionType;
	descriptor: PropertyDescriptor;
};

export type TActionMap = Map<
	string,
	{ event: string; callback: TActionCallback }
>;
