# @mortal-world/action

    `@mortal-world/action` 是针对面向对象编程的`Action`的管理器，

## 什么是Action

可以将一切的行为抽象成为一个 `Action`, 比如: 跳转页面, 弹出弹窗, error message等等.

## Action的类型

Action目前分为两种模式

1. 串行: 一个 `Action` 完成后, 再执行下一个 `Action`
2. 并行: 多个 `Action` 同时执行, `Action` 之间没有先后顺序, 不依赖结果信息

## 如何使用

```ts
@ActionController(ACTION_NAMESPACE)
class Controller {

  protected action = new ActionManager();

  constructor() {
    this.action.registerActionsByMetadata(this, ACTION_NAMESPACE);
  }

  @Action('gotoNewPage', EActionType.parallel)
  public gotoNewPage(action: IAction, params?: TSendParams, extraParams?: TSendExtraParams) {
    // ...
  }

  @Action('errorMessage', EActionType.parallel)
  public errorMessage(action: IAction, params?: TSendParams, extraParams?: TSendExtraParams) {
    // ...
  }

  @Action('getData', EActionType.serial)
  public async getData(action: IAction, params?: TSendParams, extraParams?: TSendExtraParams) {
    // ...
  }

  public onProcessEvent(
    actions: IAction[],
    params: TSendParams = {},
    extraParams: TSendExtraParams = {}
  ) {
    if (isEmpty(actions)) return;

    const _extraParams = {
      // ...,
      ...extraParams,
    };
    this.action.emitActions(actions, params, _extraParams);
  }
}
```

