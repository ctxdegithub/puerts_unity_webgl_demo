import { FunctionCallbackInfoPtrMananger, GetType, JSFunction, jsFunctionOrObjectFactory, PuertsJSEngine, Ref } from "../library";
/**
 * mixin
 * JS调用C#时，C#侧获取JS调用参数的值
 * 
 * @param engine 
 * @returns 
 */
export default function WebGLBackendGetFromJSArgumentAPI(engine: PuertsJSEngine) {
    return {
        GetNumberFromValue: function (isolate: IntPtr, value: MockIntPtr, isByRef: bool): number {
            return FunctionCallbackInfoPtrMananger.GetArgsByMockIntPtr(value);
        },
        GetDateFromValue: function (isolate: IntPtr, value: MockIntPtr, isByRef: bool): number {
            return (FunctionCallbackInfoPtrMananger.GetArgsByMockIntPtr(value) as Date).getTime();
        },
        GetStringFromValue: function (isolate: IntPtr, value: MockIntPtr, /*out int */length: any, isByRef: bool): string {
            var returnStr = FunctionCallbackInfoPtrMananger.GetArgsByMockIntPtr<string>(value);
            engine.unityApi.HEAP32[length >> 2] = returnStr.length;
            return engine.JSStringToCSString(returnStr);
        },
        GetBooleanFromValue: function (isolate: IntPtr, value: MockIntPtr, isByRef: bool): boolean {
            return FunctionCallbackInfoPtrMananger.GetArgsByMockIntPtr(value);
        },
        ValueIsBigInt: function (isolate: IntPtr, value: MockIntPtr, isByRef: bool): boolean {
            var bigint = FunctionCallbackInfoPtrMananger.GetArgsByMockIntPtr<any>(value);
            return bigint instanceof BigInt;
        },
        GetBigIntFromValue: function (isolate: IntPtr, value: MockIntPtr, isByRef: bool) {
            var bigint = FunctionCallbackInfoPtrMananger.GetArgsByMockIntPtr<any>(value);
            return bigint;
        },
        GetObjectFromValue: function (isolate: IntPtr, value: MockIntPtr, isByRef: bool) {
            var nativeObject = FunctionCallbackInfoPtrMananger.GetArgsByMockIntPtr(value);
            return engine.csharpObjectMap.getCSObjectIDFromObject(nativeObject);
        },
        GetFunctionFromValue: function (isolate: IntPtr, value: MockIntPtr, isByRef: bool): JSFunctionPtr {
            var func = FunctionCallbackInfoPtrMananger.GetArgsByMockIntPtr<(...args: any[]) => any>(value);
            var jsfunc = jsFunctionOrObjectFactory.getOrCreateJSFunction(func);
            return jsfunc.id;
        },
        GetJSObjectFromValue: function (isolate: IntPtr, value: IntPtr, isByRef: bool) {
            // 按Function的方式实现
            throw new Error('not implemented')
        },
        GetArrayBufferFromValue: function (isolate: IntPtr, value: MockIntPtr, /*out int */length: any, isOut: bool) {
            var ab = FunctionCallbackInfoPtrMananger.GetArgsByMockIntPtr<ArrayBuffer>(value);
            var ptr = engine.unityApi._malloc(ab.byteLength);
            engine.unityApi.HEAP8.set(new Int8Array(ab), ptr);
            engine.unityApi.HEAP32[length >> 2] = ab.byteLength;
            return ptr;
        },


        GetArgumentType: function (isolate: IntPtr, info: MockIntPtr, index: int, isByRef: bool) {
            var value = FunctionCallbackInfoPtrMananger.GetByMockPointer(info).args[index];
            return GetType(engine, value);
        },
        /**
         * 为c#侧提供一个获取callbackinfo里jsvalue的intptr的接口
         * 并不是得的到这个argument的值
         */
        GetArgumentValue/*inCallbackInfo*/: function (infoptr: MockIntPtr, index: int) {
            return infoptr | index;
        },
        GetJsValueType: function (isolate: IntPtr, val: MockIntPtr, isByRef: bool) {
            // public enum JsValueType
            // {
            //     NullOrUndefined = 1,
            //     BigInt = 2,
            //     Number = 4,
            //     String = 8,
            //     Boolean = 16,
            //     NativeObject = 32,
            //     JsObject = 64,
            //     Array = 128,
            //     Function = 256,
            //     Date = 512,
            //     ArrayBuffer = 1024,
            //     Unknow = 2048,
            //     Any = NullOrUndefined | BigInt | Number | String | Boolean | NativeObject | Array | Function | Date | ArrayBuffer,
            // };
            var value: any = FunctionCallbackInfoPtrMananger.GetArgsByMockIntPtr(val);
            return GetType(engine, value);
        },
        GetTypeIdFromValue: function (isolate: IntPtr, value: MockIntPtr, isByRef: bool) {
            var obj = FunctionCallbackInfoPtrMananger.GetArgsByMockIntPtr(value)
            var typeid = 0;
            if (typeof obj == 'function') {
                typeid = engine.csharpObjectMap.classIDWeakMap.get(obj);

            } else if (obj instanceof JSFunction) {
                typeid = engine.csharpObjectMap.classIDWeakMap.get(obj._func);

            } else {
                typeid = engine.csharpObjectMap.classIDWeakMap.get((obj as any).__proto__.constructor);
            }

            if (!typeid) {
                throw new Error('cannot find typeid for' + value)
            }
            return typeid
        },
    }
}