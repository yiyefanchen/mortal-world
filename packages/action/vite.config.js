import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
	// vite默认会打包出umd和esmodule两种导出方式的文件，以下配置会打包出两份结果：
	// gr-lib.umd.js umd导出方式，兼容amd commenjs
	// gr-lib.mjs esmodule导出方式
	build: {
		lib: {
			entry: resolve(__dirname, './src/index.ts'),
			name: 'actions',
			// 构建好的文件名（不包括文件后缀）
			fileName: 'actions'
		},
		rollupOptions: {
			// 确保外部化处理那些你不想打包进库的依赖
			external: ['lodash', 'reflect-metadata'],
			output: {
				// 在 UMD 构建模式下,全局模式下为这些外部化的依赖提供一个全局变量
				globals: {
					lodash: 'lodash'
				}
			}
		}
	},
	// 该插件支持传递配置项
	// 如配置: dts({ tsconfigPath: './tsconfig.json '})，表示读取tsconfig.json的include、exlude配置
	plugins: [dts()]
});
