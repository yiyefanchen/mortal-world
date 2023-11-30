import { isEmpty } from 'lodash';

import 'reflect-metadata';

import {
	EActionType,
	IAction,
	TActionDecoratorValue,
	TActionParameters,
	TClassMetadata,
	TSendExtraParams,
	TSendParams
} from './types';

/** Action controller metadata */
const ACTION_CONTROLLER_NAMESPACE: symbol = Symbol('action controller');
/** Action metadata */
const ACTION: symbol = Symbol('action method');

/**
 * Action 类装饰器
 * @param namespace 命名空间
 **/
export const ActionController = (namespace: string) => {
	return <TFunction extends Function>(target: TFunction): void => {
		addActionControllerNamespaceToClassMetadata(target, namespace);
	};
};

/**
 * 向 action controller 中增加 metadata
 * @param target 目标对象
 * @param namespace 命名空间
 */
const addActionControllerNamespaceToClassMetadata = (
	target: Object,
	namespace: string
) => {
	let metadata: TClassMetadata | undefined = Reflect.getOwnMetadata(
		ACTION_CONTROLLER_NAMESPACE,
		target
	);
	if (!metadata) {
		metadata = {};
	}
	metadata.namespace = namespace;
	Reflect.defineMetadata(ACTION_CONTROLLER_NAMESPACE, metadata, target);
};

/**
 * 将Action事件,类型添加到方法元数据
 * @param target 目标对象
 * @param propertyKey 属性键
 * @param actionParameter 操作参数
 */
const addActionEventToMethodMetadata = (
	target: Object,
	propertyKey: string,
	actionParameter: TActionParameters
) => {
	let metadata = Reflect.getMetadata(ACTION, target, propertyKey);
	if (!metadata) {
		metadata = {
			actionParameters: []
		};
	}

	metadata.actionParameters.push(actionParameter);

	Reflect.defineMetadata(ACTION, metadata, target, propertyKey);
};

/**
 * 根据Action类型绑定函数执行模式
 * @param type 操作类型
 * @param descriptor 函数属性描述符
 */
const bindFunctionExecutionModeByActionType = (
	type: EActionType,
	descriptor: PropertyDescriptor
) => {
	const method = descriptor.value;

	switch (type) {
		case EActionType.serial:
			descriptor.value = async function (
				action: IAction,
				params?: TSendParams,
				extraParams?: TSendExtraParams
			) {
				return await method.call(this, action, params, extraParams);
			};
			break;
		case EActionType.parallel:
			descriptor.value = function (
				action: IAction,
				params?: TSendParams,
				extraParams?: TSendExtraParams
			) {
				return method.call(this, action, params, extraParams);
			};
			break;
	}
};

/**
 * Action 方法装饰器
 * @param event 事件名称
 * @param type 动作类型
 */
export const Action = (event: string, type: EActionType) => {
	return function (
		target: Object,
		propKey: string,
		descriptor: PropertyDescriptor
	) {
		addActionEventToMethodMetadata(target, propKey, {
			type,
			propKey,
			event,
			descriptor,
			target
		});

		return bindFunctionExecutionModeByActionType(type, descriptor);
	};
};

/**
 * 获取当前实例指定命名空间下的所有 Action
 * @param instance 实例对象
 * @param namespace 命名空间
 * @param callback 回调函数，用于返回当前实例指定命名空间下的所有操作
 */
export const getCurrentActions = (
	instance: object,
	namespace: string,
	callback: Function
) => {
	const { namespace: controllerNamespace } = Reflect.getMetadata(
		ACTION_CONTROLLER_NAMESPACE,
		instance.constructor
	);
	if (controllerNamespace === namespace) {
		const targetPrototype = Object.getPrototypeOf(instance);

		const methodNames = Object.getOwnPropertyNames(targetPrototype);
		const currentActions: TActionDecoratorValue[] = [];

		for (const index in methodNames) {
			const methodName = methodNames[index];
			const actionAction = Reflect.getMetadata(
				ACTION,
				targetPrototype,
				methodName
			);
			if (!isEmpty(actionAction?.actionParameters)) {
				currentActions.push(...actionAction.actionParameters);
			}
		}
		callback(currentActions);
	}
};
