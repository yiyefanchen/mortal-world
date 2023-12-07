import { isEmpty } from 'lodash';

import { getCurrentActions } from './ActionDecorator';
import {
	EActionType,
	IAction,
	TActionCallback,
	TActionDecoratorValue,
	TActionMap,
	TSendExtraParams,
	TSendParams
} from './types';
import { reduceAsyncFunction } from '../utils';

/**
 * 统一管理 Action
 */
export class ActionManager {
	/** 串行 Action  */
	private registerSerialActions: TActionMap = new Map();
	/** 并行 Action  */
	private registerParallelActions: TActionMap = new Map();

	constructor();
	constructor(hostInstance: Object, namespace: string);
	constructor(hostInstance?: Object, namespace?: string) {
		if (hostInstance && namespace) {
			this.registerActionsByMetadata(hostInstance, namespace);
		}
	}

	/**
	 * 根据元数据中读取的action配置进行注册
	 * @param hostInstance - 宿主实例
	 * @param namespace - 命名空间
	 */
	public registerActionsByMetadata(hostInstance: Object, namespace: string) {
		getCurrentActions(
			hostInstance,
			namespace,
			(actions: TActionDecoratorValue[]) => {
				actions.forEach((value: TActionDecoratorValue) => {
					const callback: TActionCallback = function (
						action: IAction,
						params?: TSendParams,
						extraParams?: TSendExtraParams
					) {
						return value.descriptor.value.call(
							hostInstance,
							action,
							params,
							extraParams
						);
					};
					this.registerAction(value.event, callback, value.type);
				});
			}
		);
	}

	/**
	 * 获取不同类型的 action 集合
	 * @param actions 原始action数组
	 * @returns 包含不同类型的Action的对象
	 */
	protected getActions(actions: IAction[]) {
		const len = actions.length;
		const serialActions: IAction[] = [];
		const parallelActions: IAction[] = [];

		if (len) {
			actions.forEach((action) => {
				const registerSerialActions = this.registerSerialActions.get(
					action.event
				);
				const registerParallelActions = this.registerParallelActions.get(
					action.event
				);

				// 获取并行的Action集合
				registerParallelActions && parallelActions.push(action);
				// 不在范围内的走串行Action, 即执行完后将返回值作为下一个Action的参数继续执行
				registerSerialActions && serialActions.push(action);
			});
		}

		return {
			serialActions,
			parallelActions
		};
	}

	/**
	 * 注册 Action
	 * @param event - 事件名称
	 * @param callback - 回调函数
	 * @param type - 动作类型，默认为并行模式
	 */
	protected registerAction = (
		event: string,
		callback: TActionCallback,
		type: EActionType = EActionType.parallel
	) => {
		switch (type) {
			case EActionType.parallel:
				this.registerParallelActions.set(event, { event, callback });
				break;
			case EActionType.serial:
				this.registerSerialActions.set(event, { event, callback });
				break;
		}
	};

	/**
	 * 批量注册 Action
	 * @param actions - 原始 Action 数组
	 */
	protected batchRegisterAction = (
		actions: { event: string; callback: TActionCallback; type?: EActionType }[]
	) => {
		if (isEmpty(actions)) return;

		actions.forEach(({ event, callback, type }) =>
			this.registerAction(event, callback, type)
		);
	};

	/**
	 * 执行 Action
	 * @param action - 操作对象
	 * @param params - 发送参数
	 * @param extraParams - 额外参数
	 */
	protected execParallelAction = (
		action: IAction,
		params?: TSendParams,
		extraParams?: TSendExtraParams
	) => {
		const method = this.registerParallelActions.get(action.event)?.callback;
		if (method) {
			method(action, params, extraParams);
		}
	};

	/**
	 * 批量并行执行 Action
	 * @param actions 动作数组
	 * @param params 发送参数
	 * @param extraParams 额外参数
	 */
	protected batchExecParallelAction = (
		actions: IAction[],
		params?: TSendParams,
		extraParams?: TSendExtraParams
	) => {
		if (!actions.length) return;

		actions.forEach((action) =>
			this.execParallelAction(action, params, extraParams)
		);
	};

	/**
	 * 批量执行 串行 Action
	 * @param actions 操作数组
	 * @param params 参数对象
	 * @param extraParams 额外参数对象
	 */
	protected batchExecSerialAction = async (
		actions: IAction[],
		params: TSendParams,
		extraParams: TSendExtraParams
	) => {
		if (!actions.length) return;

		const tasks = actions.map(
			(action) => (params: TSendParams) =>
				this.execSerialAction(action, params, extraParams)
		);
		await reduceAsyncFunction(tasks, params, extraParams);
	};

	/**
	 * 串行执行 Action
	 * @param action - 动作对象
	 * @param params - 发送参数
	 * @param extraParams - 额外参数
	 * @returns 执行结果对象
	 */
	protected execSerialAction = async (
		action: IAction,
		params?: TSendParams,
		extraParams?: TSendExtraParams
	) => {
		const registerAction = this.registerSerialActions.get(action.event);
		if (!registerAction)
			return {
				action,
				params,
				extraParams
			};
		const { callback } = registerAction;

		return await callback(action, params, extraParams);
	};

	/**
	 * 批量执行 Action
	 * @param actions 动作数组
	 * @param params 发送参数（可选）
	 * @param extraParams 额外发送参数（可选）
	 */
	public batchExecAction = async (
		actions: IAction[],
		params?: TSendParams,
		extraParams?: TSendExtraParams
	) => {
		if (isEmpty(actions)) return;
		const { serialActions, parallelActions } = this.getActions(actions);

		const _params = params ?? {};
		const _extraParams = extraParams ?? {};

		if (!isEmpty(serialActions)) {
			await this.batchExecSerialAction(serialActions, _params, _extraParams);
		}

		if (!isEmpty(parallelActions)) {
			this.batchExecParallelAction(parallelActions, _params, _extraParams);
		}
	};

	public emitActions = this.batchExecAction;
}
